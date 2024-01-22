import { expect } from "chai";
import { ethers } from "hardhat";

import { deployPoseidonFacade } from "./helpers/poseidon-deployer";
import { getZKP } from "./helpers/smt-helper";

import { SMTChecker } from "@ethers-v6";
import { ZERO_ADDR } from "@/scripts/utils/constants";

describe("SMT", () => {
  let smtChecker: SMTChecker;

  beforeEach("setup", async () => {
    const poseidonFacade = await deployPoseidonFacade();

    const SMTChecker = await ethers.getContractFactory("SMTChecker", {
      libraries: {
        PoseidonFacade: await poseidonFacade.getAddress(),
      },
    });

    const SMTVerifier = await ethers.getContractFactory("SMTVerifier20");
    const smtVerifier = await SMTVerifier.deploy();

    smtChecker = await SMTChecker.deploy(await smtVerifier.getAddress());

    // smtChecker = await SMTChecker.deploy(ZERO_ADDR);
  });

  it.only("should build the tree", async () => {
    let leaves: string[] = [];

    for (let i = 0; i < 50; i++) {
      const rand = ethers.hexlify(ethers.randomBytes(30));

      await smtChecker.addElement(rand, rand);
      leaves.push(rand);
    }

    const root = await smtChecker.getRoot();
    const proof = await smtChecker.getProof(leaves[0]);

    console.log("leaf0", leaves[0]);
    console.log("root", ethers.toBeHex(root));
    console.log(
      "proof",
      proof.siblings.map((e: bigint) => ethers.toBeHex(e)),
    );
  });

  it("should prove the tree", async () => {
    let leaves: string[] = [];

    for (let i = 0; i < 20; i++) {
      const rand = ethers.hexlify(ethers.randomBytes(30));

      await smtChecker.addElement(rand, rand);

      leaves.push(rand);
    }

    const root = await smtChecker.getRoot();

    const proof = await getZKP(leaves[12], smtChecker);

    await smtChecker.verifyProof(root, proof);
  });
});
