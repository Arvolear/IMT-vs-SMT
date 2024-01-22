import { expect } from "chai";
import { ethers } from "hardhat";

import { deployPoseidonFacade } from "./helpers/poseidon-deployer";
import { poseidonHash, getBytes32PoseidonHash } from "./helpers/poseidon-hash";
import { getRoot, getPositionalProof, buildFullTree, getZKP } from "./helpers/imt-helper";

import { IMTChecker } from "@ethers-v6";
import { ZERO_ADDR } from "@/scripts/utils/constants";

describe("IMT", () => {
  let imtChecker: IMTChecker;

  beforeEach("setup", async () => {
    const poseidonFacade = await deployPoseidonFacade();

    const IMTChecker = await ethers.getContractFactory("IMTChecker", {
      libraries: {
        PoseidonFacade: await poseidonFacade.getAddress(),
      },
    });

    const IMTVerifier = await ethers.getContractFactory("IMTVerifier20");
    const imtVerifier = await IMTVerifier.deploy();

    imtChecker = await IMTChecker.deploy(await imtVerifier.getAddress());

    // imtChecker = await IMTChecker.deploy(ZERO_ADDR);
  });

  it.only("should build the tree", async () => {
    let leaves: string[] = [];

    for (let i = 0; i < 50; i++) {
      const rand = ethers.hexlify(ethers.randomBytes(30));

      await imtChecker.addElement(rand);
      leaves.push(getBytes32PoseidonHash(rand));
    }

    const imt = buildFullTree(poseidonHash, leaves, 20);

    const root = getRoot(imt);

    const [pathIndices, pathElements] = getPositionalProof(imt, leaves[0]);

    console.log("leaf0", leaves[0]);
    console.log("root", ethers.toBeHex(root));
    console.log("proof", pathIndices, pathElements);

    expect(await imtChecker.getRoot()).to.equal(root);
  });

  it("should prove the tree", async () => {
    let leaves: string[] = [];
    let leavesData: string[] = [];

    for (let i = 0; i < 20; i++) {
      const rand = ethers.hexlify(ethers.randomBytes(30));

      await imtChecker.addElement(rand);

      leavesData.push(rand);
      leaves.push(getBytes32PoseidonHash(rand));
    }

    const imt = buildFullTree(poseidonHash, leaves, 10);

    const root = getRoot(imt);

    const proof = await getZKP(leavesData[12], root, imt);

    await imtChecker.verifyProof(root, proof);
  });
});
