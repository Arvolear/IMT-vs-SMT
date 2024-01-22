// SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.8.4;

import {TypeCaster} from "@solarity/solidity-lib/libs/utils/TypeCaster.sol";
import {VerifierHelper} from "@solarity/solidity-lib/libs/zkp/snarkjs/VerifierHelper.sol";

import {IncrementalMerkleTree} from "./libs/IMT.sol";

contract IMTChecker {
    using IncrementalMerkleTree for IncrementalMerkleTree.UintIMT;
    using VerifierHelper for address;
    using TypeCaster for *;

    IncrementalMerkleTree.UintIMT internal _uintTree;
    address public verifier;

    constructor(address verifier_) {
        _uintTree._tree.branches = new bytes32[](20);
        verifier = verifier_;
    }

    function addElement(uint256 elem_) external {
        _uintTree.add(elem_);
    }

    function verifyProof(uint256 root_, VerifierHelper.ProofPoints memory points_) external {
        require(root_ == getRoot(), "Invalid root");

        verifier.verifyProof([root_].asDynamic(), points_);
    }

    function getRoot() public view returns (uint256) {
        return uint256(_uintTree.root());
    }
}
