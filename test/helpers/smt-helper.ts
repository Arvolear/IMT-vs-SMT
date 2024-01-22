// @ts-ignore
import * as snarkjs from "snarkjs";
import { ethers } from "hardhat";

import { SMTChecker, VerifierHelper } from "@/generated-types/ethers/contracts/SMTChecker";

export async function getZKP(leafIndex: string, smtChecker: SMTChecker) {
  const merkleProof = await smtChecker.getProof(leafIndex);

  const { proof } = await snarkjs.groth16.fullProve(
    {
      root: merkleProof.root,
      siblings: merkleProof.siblings,
      key: merkleProof.index,
      value: merkleProof.value,
    },
    `./circuits/output/smt.wasm`,
    `./circuits/output/smt.zkey`,
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
