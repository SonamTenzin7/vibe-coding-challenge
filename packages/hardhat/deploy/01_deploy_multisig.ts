import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";

const deployMultiSig: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { deployer } = await hre.getNamedAccounts();
  const { deploy } = hre.deployments;

  await deploy("MultiSigWallet", {
    from: deployer,
    args: [],
    log: true,
    autoMine: true,
  });

  console.log("MultiSigWallet deployed. Deployer is the sole owner with threshold = 1.");
  console.log("Next: use the wallet dashboard to add the other four team members as owners.");
};

export default deployMultiSig;

deployMultiSig.tags = ["MultiSigWallet"];
