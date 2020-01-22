pragma solidity >=0.5.0 <0.6.0;

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

import "../../anchor/AnchorI.sol";
import "../../consensus/ConsensusI.sol";
import "../../proxies/MasterCopyNonUpgradable.sol";

contract SpyAnchor is MasterCopyNonUpgradable, AnchorI{

    uint256 public spyBlockHeight;
    bytes32 public spyStateRoot;
    uint256 public spyMaxStateRoot;
    address public spyConsensus;
    mapping(uint256 => bytes32) stateRoots;

    function setup(
        uint256 _maxStateRoots,
        ConsensusI _consensus
    )
        external
    {
        spyMaxStateRoot = _maxStateRoots;
        spyConsensus = address(_consensus);
    }

    function getLatestStateRootBlockHeight()
        external
        view
        returns (uint256)
    {
        require(false, "SpyAnchor::getLatestStateRootBlockHeight should not be called.");
    }

    /**
     * @notice It sets stateroot for a blockheight.
     *
     * @param _stateRoot State root for a blocknumber.
     * @param _blockHeight Block height.
     */
    function anchorStateRoot(
        uint256 _blockHeight,
        bytes32 _stateRoot
    )
        external
    {
        spyBlockHeight = _blockHeight;
        spyStateRoot = _stateRoot;
        stateRoots[_blockHeight] = _stateRoot;
    }

    /**
     * @notice It returns stateroot for a blockheight.
     *
     * @param _blockHeight Blockheight for which stateroot is required.
     *
     * @return Stateroot for the blockheight.
     */
    function getStateRoot(uint256 _blockHeight) external view returns(bytes32) {
        return stateRoots[_blockHeight];
    }
}
