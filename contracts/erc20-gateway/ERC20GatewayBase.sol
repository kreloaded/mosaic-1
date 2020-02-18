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

contract ERC20GatewayBase {

    /* Constants */

    bytes32 constant public DEPOSIT_INTENT_TYPEHASH = keccak256(
        "DepositIntent(address valueToken,uint256 amount,address beneficiary)"
    );

    bytes32 constant public WITHDRAW_INTENT_TYPEHASH = keccak256(
        "WithdrawIntent(uint256 amount,address beneficiary)"
    );


    /** Mapping of message sender and nonce. */
    mapping(address => uint256) public  nonces;


    /* Public functions */

    /**
     * @notice It returns hash of deposit intent.
     *
     * @param _valueToken Value Token contract address.
     * @param _amount Amount of tokens.
     * @param _beneficiary Beneficiary address.
     *
     * @return depositIntentHash_ Hash of deposit intent.
     */
    function hashDepositIntent(
        address _valueToken,
        uint256 _amount,
        address _beneficiary
    )
        public
        pure
        returns (bytes32 depositIntentHash_)
    {
        depositIntentHash_ = keccak256(
            abi.encode(
                DEPOSIT_INTENT_TYPEHASH,
                _valueToken,
                _amount,
                _beneficiary
            )
        );
    }


    /**
     * @notice It returns hash of withdraw intent.
     *
     * @param _amount Amount of tokens.
     * @param _beneficiary Beneficiary address.
     *
     * @return withdrawIntentHash_ Hash of withdraw intent.
     */
    function hashWithdrawIntent(
        uint256 _amount,
        address _beneficiary
    )
        public
        pure
        returns (bytes32 withdrawIntentHash_)
    {
        withdrawIntentHash_ = keccak256(
            abi.encode(
                WITHDRAW_INTENT_TYPEHASH,
                _amount,
                _beneficiary
            )
        );
    }

}
