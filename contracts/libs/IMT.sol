// SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.8.4;

import {PoseidonFacade} from "@iden3/contracts/lib/Poseidon.sol";

library IncrementalMerkleTree {
    /**
     *********************
     *      UintIMT      *
     *********************
     */

    struct UintIMT {
        IMT _tree;
    }

    function add(UintIMT storage tree, uint256 element_) internal {
        _add(tree._tree, bytes32(element_));
    }

    function root(UintIMT storage tree) internal view returns (bytes32) {
        return _root(tree._tree);
    }

    function height(UintIMT storage tree) internal view returns (uint256) {
        return _height(tree._tree);
    }

    function length(UintIMT storage tree) internal view returns (uint256) {
        return _length(tree._tree);
    }

    /**
     ************************
     *       InnerIMT       *
     ************************
     */

    struct IMT {
        bytes32[] branches;
        uint256 leavesCount;
    }

    function _add(IMT storage tree, bytes32 element_) private {
        bytes32 resultValue_ = bytes32(PoseidonFacade.poseidon1([uint256(element_)]));

        uint256 index_ = 0;
        uint256 size_ = ++tree.leavesCount;
        uint256 treeHeight_ = tree.branches.length;

        while (index_ < treeHeight_) {
            if (size_ & 1 == 1) {
                break;
            }

            bytes32 branch_ = tree.branches[index_];
            resultValue_ = bytes32(
                PoseidonFacade.poseidon2([uint256(branch_), uint256(resultValue_)])
            );

            size_ >>= 1;
            ++index_;
        }

        if (index_ == treeHeight_) {
            tree.branches.push(resultValue_);
        } else {
            tree.branches[index_] = resultValue_;
        }
    }

    function _root(IMT storage tree) private view returns (bytes32) {
        uint256 treeHeight_ = tree.branches.length;

        if (treeHeight_ == 0) {
            return _getZeroHash();
        }

        uint256 height_;
        uint256 size_ = tree.leavesCount;
        bytes32 root_ = _getZeroHash();
        bytes32[] memory zeroHashes_ = _getZeroHashes(treeHeight_);

        while (height_ < treeHeight_) {
            if (size_ & 1 == 1) {
                bytes32 branch_ = tree.branches[height_];
                root_ = bytes32(PoseidonFacade.poseidon2([uint256(branch_), uint256(root_)]));
            } else {
                bytes32 zeroHash_ = zeroHashes_[height_];
                root_ = bytes32(PoseidonFacade.poseidon2([uint256(root_), uint256(zeroHash_)]));
            }

            size_ >>= 1;
            ++height_;
        }

        return root_;
    }

    function _height(IMT storage tree) private view returns (uint256) {
        return tree.branches.length;
    }

    function _length(IMT storage tree) private view returns (uint256) {
        return tree.leavesCount;
    }

    function _getZeroHashes(uint256 height_) private pure returns (bytes32[] memory) {
        bytes32[] memory zeroHashes_ = new bytes32[](height_);

        zeroHashes_[0] = _getZeroHash();

        for (uint256 i = 1; i < height_; ++i) {
            bytes32 prevHash_ = zeroHashes_[i - 1];
            bytes32 result = bytes32(
                PoseidonFacade.poseidon2([uint256(prevHash_), uint256(prevHash_)])
            );

            zeroHashes_[i] = result;
        }

        return zeroHashes_;
    }

    function _getZeroHash() private pure returns (bytes32) {
        return bytes32(PoseidonFacade.poseidon1([uint256(0)]));
    }
}
