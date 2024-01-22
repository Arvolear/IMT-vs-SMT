// @ts-ignore
import * as snarkjs from "snarkjs";
import { MerkleTree } from "merkletreejs";
import { ethers } from "hardhat";
import { getBytes32PoseidonHash } from "./poseidon-hash";

import { VerifierHelper } from "@/generated-types/ethers/contracts/IMTChecker";

export function getRoot(tree: MerkleTree) {
  return "0x" + tree.getRoot().toString("hex");
}

export function getProof(hashFunc: any, tree: MerkleTree, leaf: string) {
  return tree.getProof(hashFunc(leaf)).map((e) => "0x" + e.data.toString("hex"));
}

export function getPositionalProof(tree: MerkleTree, leaf: string): [number[], string[]] {
  const positionalProof = tree.getPositionalHexProof(leaf);
  const positions = positionalProof.map((e) => Number(e[0]));
  const data = positionalProof.map((e) => ethers.toBeHex(e[1], 32));

  return [positions, data];
}

export function buildFullTree(hashFunc: any, leaves: string[], height: number) {
  const elementsToAdd = 2 ** height - leaves.length;
  const zeroHash = hashFunc("0x0000000000000000000000000000000000000000000000000000000000000000");
  const zeroElements = Array(elementsToAdd).fill(zeroHash);

  return new MerkleTree([...leaves, ...zeroElements], hashFunc, {
    hashLeaves: false,
    sortPairs: false,
  });
}

export async function getZKP(leafData: string, root: string, tree: MerkleTree) {
  const leaf = getBytes32PoseidonHash(leafData);

  const [pathIndices, pathElements] = getPositionalProof(tree, leaf);

  const { proof } = await snarkjs.groth16.fullProve(
    {
      leaf: leaf,
      path_elements: pathElements,
      path_index: pathIndices,
      root: root,
    },
    `./circuits/output/imt.wasm`,
    `./circuits/output/imt.zkey`,
  );

  swap(proof.pi_b[0], 0, 1);
  swap(proof.pi_b[1], 0, 1);

  const formattedProof: VerifierHelper.ProofPointsStruct = {
    a: proof.pi_a.slice(0, 2).map((x: any) => hexlifyElement(BigInt(x))),
    b: proof.pi_b.slice(0, 2).map((x: any[]) => x.map((y: any) => hexlifyElement(BigInt(y)))),
    c: proof.pi_c.slice(0, 2).map((x: any) => hexlifyElement(BigInt(x))),
  };

  return formattedProof;
}

// Function to swap two elements in an array
function swap(arr: any, i: number, j: number) {
  const temp = arr[i];
  arr[i] = arr[j];
  arr[j] = temp;
}

function hexlifyElement(element: any) {
  return ethers.toBeHex(element, 32);
}
