import { expect } from "chai";
import { ethers } from "hardhat";
import { MultiSigWallet } from "../typechain-types";

describe("MultiSigWallet", function () {
  async function deployWallet() {
    const [owner, secondOwner, recipient, outsider] = await ethers.getSigners();
    const walletFactory = await ethers.getContractFactory("MultiSigWallet");
    const wallet = (await walletFactory.deploy()) as MultiSigWallet;
    await wallet.waitForDeployment();

    return { owner, secondOwner, recipient, outsider, wallet };
  }

  it("starts with the deployer as sole owner and threshold 1", async function () {
    const { owner, wallet } = await deployWallet();

    expect(await wallet.getOwners()).to.deep.equal([owner.address]);
    expect(await wallet.isOwner(owner.address)).to.equal(true);
    expect(await wallet.threshold()).to.equal(1n);
  });

  it("allows an owner to submit, approve, revoke, and re-approve a transaction", async function () {
    const { owner, recipient, wallet } = await deployWallet();

    await wallet.submitTransaction(recipient.address, 0, "0x");
    expect(await wallet.getTransactionCount()).to.equal(1n);

    await wallet.approveTransaction(0);
    let transaction = await wallet.getTransaction(0);
    expect(transaction.numConfirmations).to.equal(1n);
    expect(await wallet.approved(0, owner.address)).to.equal(true);

    await wallet.revokeApproval(0);
    transaction = await wallet.getTransaction(0);
    expect(transaction.numConfirmations).to.equal(0n);

    await wallet.approveTransaction(0);
    transaction = await wallet.getTransaction(0);
    expect(transaction.numConfirmations).to.equal(1n);
  });

  it("executes an approved ETH transfer", async function () {
    const { owner, recipient, wallet } = await deployWallet();
    const walletAddress = await wallet.getAddress();
    const value = ethers.parseEther("1");

    await owner.sendTransaction({ to: walletAddress, value });
    await wallet.submitTransaction(recipient.address, value, "0x");
    await wallet.approveTransaction(0);

    await expect(() => wallet.executeTransaction(0)).to.changeEtherBalances([wallet, recipient], [-value, value]);

    const transaction = await wallet.getTransaction(0);
    expect(transaction.executed).to.equal(true);
  });

  it("rejects approval and submission from non-owners", async function () {
    const { outsider, recipient, wallet } = await deployWallet();

    await expect(wallet.connect(outsider).submitTransaction(recipient.address, 0, "0x")).to.be.revertedWith(
      "not owner",
    );

    await wallet.submitTransaction(recipient.address, 0, "0x");
    await expect(wallet.connect(outsider).approveTransaction(0)).to.be.revertedWith("not owner");
  });

  it("applies owner and threshold changes only through approved wallet self-calls", async function () {
    const { owner, secondOwner, wallet } = await deployWallet();
    const walletAddress = await wallet.getAddress();
    const addOwnerData = wallet.interface.encodeFunctionData("addOwner", [secondOwner.address]);

    await expect(wallet.addOwner(secondOwner.address)).to.be.revertedWith("not wallet");

    await wallet.submitTransaction(walletAddress, 0, addOwnerData);
    await wallet.approveTransaction(0);
    await wallet.executeTransaction(0);

    expect(await wallet.isOwner(secondOwner.address)).to.equal(true);
    expect(Array.from(await wallet.getOwners())).to.have.members([owner.address, secondOwner.address]);

    const thresholdData = wallet.interface.encodeFunctionData("changeThreshold", [2]);
    await wallet.submitTransaction(walletAddress, 0, thresholdData);
    await wallet.approveTransaction(1);
    await wallet.executeTransaction(1);

    expect(await wallet.threshold()).to.equal(2n);
  });
});
