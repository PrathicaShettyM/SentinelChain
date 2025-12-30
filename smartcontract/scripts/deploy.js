import hre from "hardhat";

async function main() {
  const SentinelChain = await hre.ethers.getContractFactory("SentinelChain");
  const sentinelChain = await SentinelChain.deploy();

  await sentinelChain.waitForDeployment();

  console.log("SentinelChain deployed to:", sentinelChain.target);
  console.log(
    "Deployment tx hash:",
    sentinelChain.deploymentTransaction().hash
  );
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
