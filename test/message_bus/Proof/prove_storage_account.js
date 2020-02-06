// Copyright 2020 OpenST Ltd.
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

const Proof = artifacts.require('ProofDouble');
const SpyAnchor = artifacts.require('SpyAnchor');

const BN = require('bn.js');
const utils = require('../../test_lib/utils.js');

const { AccountProvider } = require('../../test_lib/utils.js');
const ProveStorageAccount = require('./prove_storage_account_proof.json');

contract('Proof::proveStorageAccount', async (accounts) => {
  const accountProvider = new AccountProvider(accounts);
  let proof;
  let spyAnchor;
  let setupParams;
  let consensus;
  let ExpectedStorageRoot;
  let CalculatedStorageRoot;

  beforeEach(async () => {
    proof = await Proof.new();
    spyAnchor = await SpyAnchor.new();

    setupParams = {
      storageAccount: ProveStorageAccount.address,
      stateRootProvider: spyAnchor.address,
      maxStorageRootItems: new BN(100),
    };

    await proof.setupProofDouble(
      setupParams.storageAccount,
      setupParams.stateRootProvider,
      setupParams.maxStorageRootItems,
    );

    consensus = accountProvider.get();
    await spyAnchor.setup(
      setupParams.maxStorageRootItems,
      consensus,
    );

    await spyAnchor.anchorStateRoot(
      ProveStorageAccount.blockNumber,
      ProveStorageAccount.stateRoot,
    );
  });


  contract('Negative Tests', async () => {
    it('should fail when rlpAccount length is zero', async () => {
      const failRlpAccount = '0x';
      await utils.expectRevert(
        proof.proveStorageAccountDouble(
          new BN(ProveStorageAccount.blockNumber),
          failRlpAccount,
          ProveStorageAccount.rlpParentNodes,
        ),
        'Length of RLP account must not be 0.',
      );
    });


    it('should fail when rlpParentNodes length is zero', async () => {
      const failRlpParentNodes = '0x';
      await spyAnchor.anchorStateRoot(
        new BN(ProveStorageAccount.blockNumber),
        ProveStorageAccount.stateRoot,
      );
      await utils.expectRevert(
        proof.proveStorageAccountDouble(
          new BN(ProveStorageAccount.blockNumber),
          ProveStorageAccount.rlpAccountNode,
          failRlpParentNodes,
        ),
        'Length of RLP parent nodes is 0.',
      );
    });


    it('should fail when state root is null', async () => {
      const stateRoot = '0x';
      await spyAnchor.anchorStateRoot(
        ProveStorageAccount.blockNumber,
        stateRoot,
      );

      await utils.expectRevert(
        proof.proveStorageAccountDouble(
          new BN(ProveStorageAccount.blockNumber),
          ProveStorageAccount.rlpAccountNode,
          ProveStorageAccount.rlpParentNodes,
        ),
        'State root must not be zero.',
      );
    });
  });


  contract('Positive Tests', async () => {
    it('should pass when account storage root proof matches', async () => {
      await proof.proveStorageAccountDouble(
        new BN(ProveStorageAccount.blockNumber),
        ProveStorageAccount.rlpAccountNode,
        ProveStorageAccount.rlpParentNodes,
      );

      ExpectedStorageRoot = await proof.storageRoots.call(ProveStorageAccount.blockNumber);

      CalculatedStorageRoot = ProveStorageAccount.storageHash;

      assert.strictEqual(
        ExpectedStorageRoot,
        CalculatedStorageRoot,
        'Storage root/hash generated must match with storage root calculated.',
      );
    });
  });
});