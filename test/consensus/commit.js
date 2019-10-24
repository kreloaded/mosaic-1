// Copyright 2019 OpenST Ltd.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//    http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

'use strict';

const BN = require('bn.js');
const web3 = require('../test_lib/web3.js');

const Utils = require('../test_lib/utils.js');
const consensusUtil = require('./utils.js');

const Consensus = artifacts.require('ConsensusTest');
const SpyCore = artifacts.require('SpyCore');
const SpyCommittee = artifacts.require('SpyCommittee');
const SpyAnchor = artifacts.require('SpyAnchor');

const anchotStateRoot = '0xef1552a40b7165c3cd773806b9e0c165b75356e0314bf0706f279c729f51e017';
const anchorBlockHeight = 1;

let contracts = {};
let commitParams = {};
/*
bytes memory rlpHeader = hex"f901f9a083cafc574e1f51ba9dc0568fc617a08ea2429fb384059c972f13b19fa1c8dd55a01dcc4de8dec75d7aab85b567b6ccd41ad312451b948a7413f0a142fd40d49347948888f1f195afa192cfee860698584c030f4c9db1a0ef1552a40b7165c3cd773806b9e0c165b75356e0314bf0706f279c729f51e017a05fe50b260da6308036625b850b5d6ced6d0a9f814c0688bc91ffb7b7a3a54b67a0bc37d79753ad738a6dac4921e57392f145d8887476de3f783dfa7edae9283e52b90100000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000008302000001832fefd8825208845506eb0780a0bd4472abb6659ebe3ee06ee4d7b72a00a9f4d001caca51342001075469aff49888a13a5a8c8f2bb1c4";
Block.Header memory header = Block.decodeHeader(rlpHeader);

Assert.equal(
    header.blockHash,
    hex"0a5843ac1cb04865017cb35a57b50b07084e5fcee39b5acadade33149f4fff9e",
    "Wrong block hash."
);
Assert.equal(
    header.parentHash,
    hex"83cafc574e1f51ba9dc0568fc617a08ea2429fb384059c972f13b19fa1c8dd55",
    "Wrong parent hash."
);
Assert.equal(
    header.uncleHash,
    hex"1dcc4de8dec75d7aab85b567b6ccd41ad312451b948a7413f0a142fd40d49347",
    "Wrong uncle hash."
);
Assert.equal(
    header.coinbase,
    0x8888f1F195AFa192CfeE860698584c030f4c9dB1,
    "Wrong coinbase."
);
Assert.equal(
    header.stateRoot,
    hex"ef1552a40b7165c3cd773806b9e0c165b75356e0314bf0706f279c729f51e017",
    "Wrong state root."
);
Assert.equal(
    header.transactionRoot,
    hex"5fe50b260da6308036625b850b5d6ced6d0a9f814c0688bc91ffb7b7a3a54b67",
    "Wrong transaction root."
);
Assert.equal(
    header.receiptRoot,
    hex"bc37d79753ad738a6dac4921e57392f145d8887476de3f783dfa7edae9283e52",
    "Wrong receipt root."
);
Assert.equal(
    header.difficulty,
    uint256(131072),
    "Wrong difficulty."
);
Assert.equal(
    header.height,
    uint256(1),
    "Wrong height."
);
Assert.equal(
    uint256(header.gasLimit),
    uint256(3141592),
    "Wrong gas limit."
);
Assert.equal(
    uint256(header.gasUsed),
    uint256(21000),
    "Wrong gas used."
);
Assert.equal(
    header.timeStamp,
    uint256(1426516743),
    "Wrong timestamp."
);
Assert.equal(
    header.mixDigest,
    hex"bd4472abb6659ebe3ee06ee4d7b72a00a9f4d001caca51342001075469aff498",
    "Wrong mix digest."
);
Assert.equal(
    header.nonce,
    0xa13a5a8c8f2bb1c4,
    "Wrong nonce."
);
*/
contract('Consensus::join', (accounts) => {
  const accountProvider = new Utils.AccountProvider(accounts);
  let committeeSecret;
  beforeEach(async () => {
    committeeSecret = Utils.getRandomHash();
    contracts = {
      Consensus: await Consensus.new(),
      SpyCore: await SpyCore.new(),
      SpyCommittee: await SpyCommittee.new(),
      SpyAnchor: await SpyAnchor.new(),
    };
    Object.freeze(contracts);

    commitParams = {
      chainId: accountProvider.get(),
      rlpBlockHeader: '0xf901f9a083cafc574e1f51ba9dc0568fc617a08ea2429fb384059c972f13b19fa1c8dd55a01dcc4de8dec75d7aab85b567b6ccd41ad312451b948a7413f0a142fd40d49347948888f1f195afa192cfee860698584c030f4c9db1a0ef1552a40b7165c3cd773806b9e0c165b75356e0314bf0706f279c729f51e017a05fe50b260da6308036625b850b5d6ced6d0a9f814c0688bc91ffb7b7a3a54b67a0bc37d79753ad738a6dac4921e57392f145d8887476de3f783dfa7edae9283e52b90100000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000008302000001832fefd8825208845506eb0780a0bd4472abb6659ebe3ee06ee4d7b72a00a9f4d001caca51342001075469aff49888a13a5a8c8f2bb1c4',
      kernelHash: Utils.getRandomHash(),
      originObservation: Utils.getRandomHash(),
      dynasty: new BN(1),
      accumulatedGas: new BN(888888),
      committeeLock: web3.utils.sha3(committeeSecret),
      source: '0x0a5843ac1cb04865017cb35a57b50b07084e5fcee39b5acadade33149f4fff9e',
      target: Utils.getRandomHash(),
      sourceBlockHeight: new BN(4000),
      targetBlockHeight: new BN(5000),
      txOptions: {
        from: accountProvider.get(),
      },
    };
    Object.freeze(commitParams);
  });

  contract('Negative Tests', async () => {
    it('should fail when chain id is 0', async () => {
      const params = Object.assign({}, commitParams, { chainId: Utils.NULL_ADDRESS });
      await Utils.expectRevert(
        consensusUtil.commit(contracts.Consensus, params),
        'Chain id is 0.',
      );
    });

    it('should fail when source is 0', async () => {
      const params = Object.assign({}, commitParams, { source: Utils.ZERO_BYTES32 });
      await Utils.expectRevert(
        consensusUtil.commit(contracts.Consensus, params),
        'Source is 0.',
      );
    });

    it('should fail when target is 0', async () => {
      const params = Object.assign({}, commitParams, { target: Utils.ZERO_BYTES32 });
      await Utils.expectRevert(
        consensusUtil.commit(contracts.Consensus, params),
        'Target is 0.',
      );
    });

    it('should fail when origin obeservation is 0', async () => {
      const params = Object.assign({}, commitParams, { originObservation: Utils.ZERO_BYTES32 });
      await Utils.expectRevert(
        consensusUtil.commit(contracts.Consensus, params),
        'Origin observation is 0.',
      );
    });

    it('should fail when target height is less than source height', async () => {
      const params = Object.assign({}, commitParams, { targetBlockHeight: new BN(3999) });
      await Utils.expectRevert(
        consensusUtil.commit(contracts.Consensus, params),
        'Target block height is less than or equal to source block height.',
      );
    });

    it('should fail when target height is equal to source height', async () => {
      const params = Object.assign({}, commitParams, { targetBlockHeight: new BN(4000) });
      await Utils.expectRevert(
        consensusUtil.commit(contracts.Consensus, params),
        'Target block height is less than or equal to source block height.',
      );
    });

    it('should fail when source is not equal to hash of specified rlp block header', async () => {
      const params = Object.assign({}, commitParams, { source: Utils.getRandomHash() });
      await Utils.expectRevert(
        consensusUtil.commit(contracts.Consensus, params),
        'Block header does not match with vote message source.',
      );
    });

    it('should fail when there is not core for the specified chain id', async () => {
      await Utils.expectRevert(
        consensusUtil.commit(contracts.Consensus, commitParams),
        'There is no core for the specified chain id.',
      );
    });

    it('should fail when core status is undefined', async () => {
      await contracts.Consensus.setAssignment(commitParams.chainId, contracts.SpyCore.address);
      await contracts.Consensus.setCoreStatus(
        contracts.SpyCore.address,
        consensusUtil.CoreStatus.undefined,
      );
      await Utils.expectRevert(
        consensusUtil.commit(contracts.Consensus, commitParams),
        'There is no core for the specified chain id.',
      );
    });

    it('should fail when core status is halted', async () => {
      await contracts.Consensus.setAssignment(commitParams.chainId, contracts.SpyCore.address);
      await contracts.Consensus.setCoreStatus(
        contracts.SpyCore.address,
        consensusUtil.CoreStatus.halted,
      );
      await Utils.expectRevert(
        consensusUtil.commit(contracts.Consensus, commitParams),
        'There is no core for the specified chain id.',
      );
    });

    it('should fail when core status is corrupted', async () => {
      await contracts.Consensus.setAssignment(commitParams.chainId, contracts.SpyCore.address);
      await contracts.Consensus.setCoreStatus(
        contracts.SpyCore.address,
        consensusUtil.CoreStatus.corrupted,
      );
      await Utils.expectRevert(
        consensusUtil.commit(contracts.Consensus, commitParams),
        'There is no core for the specified chain id.',
      );
    });

    it('should fail when precommit proposal is 0', async () => {
      await contracts.Consensus.setAssignment(commitParams.chainId, contracts.SpyCore.address);
      await contracts.Consensus.setCoreStatus(
        contracts.SpyCore.address,
        consensusUtil.CoreStatus.precommitted,
      );
      await Utils.expectRevert(
        consensusUtil.commit(contracts.Consensus, commitParams),
        'There is no precommit for the specified core.',
      );
    });

    it('should fail when specified kernel hash is not equal to open kernel hash', async () => {
      await contracts.Consensus.setAssignment(commitParams.chainId, contracts.SpyCore.address);
      await contracts.Consensus.setCoreStatus(
        contracts.SpyCore.address,
        consensusUtil.CoreStatus.precommitted,
      );
      const proposal = Utils.getRandomHash();
      const currentBlock = await Utils.getBlockNumber();
      await contracts.Consensus.setPreCommit(
        contracts.SpyCore.address,
        proposal,
        currentBlock.addn(consensusUtil.CommitteeFormationDelay),
      );
      await Utils.expectRevert(
        consensusUtil.commit(contracts.Consensus, commitParams),
        'Provided kernel hash must be equal to open kernel hash.',
      );
    });

    it('should fail when commit proposal is not equal to precommited proposal', async () => {
      await contracts.Consensus.setAssignment(commitParams.chainId, contracts.SpyCore.address);
      await contracts.Consensus.setCoreStatus(
        contracts.SpyCore.address,
        consensusUtil.CoreStatus.precommitted,
      );
      const proposal = Utils.getRandomHash();
      const currentBlock = await Utils.getBlockNumber();
      await contracts.Consensus.setPreCommit(
        contracts.SpyCore.address,
        proposal,
        currentBlock.addn(consensusUtil.CommitteeFormationDelay),
      );
      await contracts.SpyCore.mockOpenKernelHash(commitParams.kernelHash);
      await Utils.expectRevert(
        consensusUtil.commit(contracts.Consensus, commitParams),
        'Proposal is not precommitted.',
      );
    });

    it('should fail when committee address is 0', async () => {
      await contracts.Consensus.setAssignment(commitParams.chainId, contracts.SpyCore.address);
      await contracts.Consensus.setCoreStatus(
        contracts.SpyCore.address,
        consensusUtil.CoreStatus.precommitted,
      );
      const proposal = Utils.getRandomHash();
      const currentBlock = await Utils.getBlockNumber();
      await contracts.Consensus.setPreCommit(
        contracts.SpyCore.address,
        proposal,
        currentBlock.addn(consensusUtil.CommitteeFormationDelay),
      );
      await contracts.SpyCore.mockOpenKernelHash(commitParams.kernelHash);
      await contracts.SpyCore.mockPrecommit(proposal);
      await Utils.expectRevert(
        consensusUtil.commit(contracts.Consensus, commitParams),
        'There is no committee matching to the specified vote message.',
      );
    });

    it('should fail when committee decision is 0', async () => {
      await contracts.Consensus.setAssignment(commitParams.chainId, contracts.SpyCore.address);
      await contracts.Consensus.setCoreStatus(
        contracts.SpyCore.address,
        consensusUtil.CoreStatus.precommitted,
      );
      const proposal = Utils.getRandomHash();
      const currentBlock = await Utils.getBlockNumber();
      await contracts.Consensus.setPreCommit(
        contracts.SpyCore.address,
        proposal,
        currentBlock.addn(consensusUtil.CommitteeFormationDelay),
      );
      await contracts.SpyCore.mockOpenKernelHash(commitParams.kernelHash);
      await contracts.SpyCore.mockPrecommit(proposal);
      await contracts.Consensus.setCommitteeProposal(contracts.SpyCommittee.address, proposal);
      await Utils.expectRevert(
        consensusUtil.commit(contracts.Consensus, commitParams),
        'Committee has not decide on the proposal.',
      );
    });

    it('should fail when committee decision does not match the provided committee lock', async () => {
      await contracts.Consensus.setAssignment(commitParams.chainId, contracts.SpyCore.address);
      await contracts.Consensus.setCoreStatus(
        contracts.SpyCore.address,
        consensusUtil.CoreStatus.precommitted,
      );
      const proposal = Utils.getRandomHash();
      const currentBlock = await Utils.getBlockNumber();
      await contracts.Consensus.setPreCommit(
        contracts.SpyCore.address,
        proposal,
        currentBlock.addn(consensusUtil.CommitteeFormationDelay),
      );
      await contracts.SpyCore.mockOpenKernelHash(commitParams.kernelHash);
      await contracts.SpyCore.mockPrecommit(proposal);
      await contracts.Consensus.setCommitteeProposal(contracts.SpyCommittee.address, proposal);
      await contracts.SpyCommittee.mockCommitteeDecision(Utils.getRandomHash());
      await Utils.expectRevert(
        consensusUtil.commit(contracts.Consensus, commitParams),
        'Committee decision does not match with committee lock.',
      );
    });

    it('should fail when anchor address for specified chain id is 0', async () => {
      await contracts.Consensus.setAssignment(commitParams.chainId, contracts.SpyCore.address);
      await contracts.Consensus.setCoreStatus(
        contracts.SpyCore.address,
        consensusUtil.CoreStatus.precommitted,
      );
      const proposal = Utils.getRandomHash();
      const currentBlock = await Utils.getBlockNumber();
      await contracts.Consensus.setPreCommit(
        contracts.SpyCore.address,
        proposal,
        currentBlock.addn(consensusUtil.CommitteeFormationDelay),
      );
      await contracts.SpyCore.mockOpenKernelHash(commitParams.kernelHash);
      await contracts.SpyCore.mockPrecommit(proposal);
      await contracts.Consensus.setCommitteeProposal(contracts.SpyCommittee.address, proposal);
      await contracts.SpyCommittee.mockCommitteeDecision(committeeSecret);
      await Utils.expectRevert(
        consensusUtil.commit(contracts.Consensus, commitParams),
        'There is no anchor for the specified chain id.',
      );
    });

    it('should fail when called 2nd time with same parameteres', async () => {
      await contracts.Consensus.setAssignment(commitParams.chainId, contracts.SpyCore.address);
      await contracts.Consensus.setCoreStatus(
        contracts.SpyCore.address,
        consensusUtil.CoreStatus.precommitted,
      );
      const proposal = Utils.getRandomHash();
      const currentBlock = await Utils.getBlockNumber();
      await contracts.Consensus.setPreCommit(
        contracts.SpyCore.address,
        proposal,
        currentBlock.addn(consensusUtil.CommitteeFormationDelay),
      );
      await contracts.SpyCore.mockOpenKernelHash(commitParams.kernelHash);
      await contracts.SpyCore.mockPrecommit(proposal);
      await contracts.Consensus.setCommitteeProposal(contracts.SpyCommittee.address, proposal);
      await contracts.SpyCommittee.mockCommitteeDecision(committeeSecret);
      await contracts.Consensus.setAnchor(commitParams.chainId, contracts.SpyAnchor.address);

      await consensusUtil.commit(contracts.Consensus, commitParams);

      await Utils.expectRevert(
        consensusUtil.commit(contracts.Consensus, commitParams),
        'There is no precommit for the specified core.',
      );
    });
  });

  contract('Positive Tests', () => {
    let proposal;
    beforeEach(async () => {
      await contracts.Consensus.setAssignment(commitParams.chainId, contracts.SpyCore.address);
      await contracts.Consensus.setCoreStatus(
        contracts.SpyCore.address,
        consensusUtil.CoreStatus.precommitted,
      );
      proposal = Utils.getRandomHash();
      const currentBlock = await Utils.getBlockNumber();
      await contracts.Consensus.setPreCommit(
        contracts.SpyCore.address,
        proposal,
        currentBlock.addn(consensusUtil.CommitteeFormationDelay),
      );
      await contracts.SpyCore.mockOpenKernelHash(commitParams.kernelHash);
      await contracts.SpyCore.mockPrecommit(proposal);
      await contracts.Consensus.setCommitteeProposal(contracts.SpyCommittee.address, proposal);
      await contracts.SpyCommittee.mockCommitteeDecision(committeeSecret);
      await contracts.Consensus.setAnchor(commitParams.chainId, contracts.SpyAnchor.address);
    });

    it('should pass when core status is creation', async () => {
      await contracts.Consensus.setCoreStatus(
        contracts.SpyCore.address,
        consensusUtil.CoreStatus.creation,
      );
      await consensusUtil.commit(contracts.Consensus, commitParams);
    });

    it('should pass when core status is opened', async () => {
      await contracts.Consensus.setCoreStatus(
        contracts.SpyCore.address,
        consensusUtil.CoreStatus.opened,
      );
      await consensusUtil.commit(contracts.Consensus, commitParams);
    });

    it('should pass when core status is precommitted', async () => {
      await consensusUtil.commit(contracts.Consensus, commitParams);
    });

    it('should call openKernelHash function of core contract', async () => {
      await consensusUtil.commit(contracts.Consensus, commitParams);
      const mockedOpenKernelHash = await contracts.SpyCore.openKernelHash.call();
      assert.strictEqual(
        mockedOpenKernelHash,
        commitParams.kernelHash,
        'Open kernel hash of spy core contract is not set.',
      );
    });

    it('should call precommit function of core contract', async () => {
      await consensusUtil.commit(contracts.Consensus, commitParams);
      const mockedPrecommit = await contracts.SpyCore.precommit.call();
      assert.strictEqual(
        mockedPrecommit,
        proposal,
        'Precommit of spy core contract is not set.',
      );
    });

    it('should call committeeDecision function of committee contract', async () => {
      await consensusUtil.commit(contracts.Consensus, commitParams);
      const mockedCommitteeDecision = await contracts.SpyCommittee.committeeDecision.call();
      assert.strictEqual(
        mockedCommitteeDecision,
        committeeSecret,
        'Committee decision of spy committee contract is not set.',
      );
    });

    it('should call anchorStateRoot function of anchor contract', async () => {
      await consensusUtil.commit(contracts.Consensus, commitParams);
      const spyBlockHeight = await contracts.SpyAnchor.spyBlockHeight.call();
      assert.strictEqual(
        spyBlockHeight.eqn(anchorBlockHeight),
        true,
        `Block height ${spyBlockHeight.toString(10)} in spy anchor contract `
        + `is not set to ${anchorBlockHeight.toString(10)}.`,
      );

      const spyStateRoot = await contracts.SpyAnchor.spyStateRoot.call();
      assert.strictEqual(
        spyStateRoot,
        anchotStateRoot,
        'State root in spy anchor contract is not set.',
      );
    });

    it('should call openMetablock function of core contract', async () => {
      await consensusUtil.commit(contracts.Consensus, commitParams);

      const spyCommittedOriginObservation = await contracts
        .SpyCore
        .spyCommittedOriginObservation
        .call();

      assert.strictEqual(
        spyCommittedOriginObservation,
        commitParams.originObservation,
        'Committed orign oberservation is not set in spy core contract.',
      );

      const spyCommittedDynasty = await contracts.SpyCore.spyCommittedDynasty.call();
      assert.strictEqual(
        spyCommittedDynasty.eq(commitParams.dynasty),
        true,
        'Committed dynasty is not set in spy core contract.',
      );

      const spyCommittedAccumulatedGas = await contracts
        .SpyCore
        .spyCommittedAccumulatedGas
        .call();

      assert.strictEqual(
        spyCommittedAccumulatedGas.eq(commitParams.accumulatedGas),
        true,
        'Committed accummulated gas is not set in spy core contract.',
      );

      const spyCommittedCommitteeLock = await contracts.SpyCore.spyCommittedCommitteeLock.call();
      assert.strictEqual(
        spyCommittedCommitteeLock,
        commitParams.committeeLock,
        'Committed committee lock is not set in spy core contract.',
      );

      const spyCommittedSource = await contracts.SpyCore.spyCommittedSource.call();
      assert.strictEqual(
        spyCommittedSource,
        commitParams.source,
        'Committed source is not set in spy core contract.',
      );

      const spyCommittedTarget = await contracts.SpyCore.spyCommittedTarget.call();
      assert.strictEqual(
        spyCommittedTarget,
        commitParams.target,
        'Committed target is not set in spy core contract.',
      );

      const spyCommittedSourceBlockHeight = await contracts
        .SpyCore
        .spyCommittedSourceBlockHeight
        .call();

      assert.strictEqual(
        spyCommittedSourceBlockHeight.eq(commitParams.sourceBlockHeight),
        true,
        'Committed source block height is not set in spy core contract.',
      );

      const spyCommittedTargetBlockHeight = await contracts
        .SpyCore
        .spyCommittedTargetBlockHeight
        .call();

      assert.strictEqual(
        spyCommittedTargetBlockHeight.eq(commitParams.targetBlockHeight),
        true,
        'Committed target block height is not set in spy core contract.',
      );

      const spyDeltaGasTarget = await contracts.SpyCore.spyDeltaGasTarget.call();
      assert.strictEqual(
        spyDeltaGasTarget.eqn(0),
        true,
        'Committed delta gas target is not set in spy core contract.',
      );
    });
  });
});
