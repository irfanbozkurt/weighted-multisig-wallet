/* eslint no-use-before-define: "warn" */
const fs = require("fs");
const chalk = require("chalk");
const { config, ethers, tenderly, run, network } = require("hardhat");
const { utils } = require("ethers");
const R = require("ramda");

let targetNetwork = process.env.HARDHAT_NETWORK || config.defaultNetwork;

let customSigner = new ethers.Wallet("PLACE_DEPLOYER_PK_HERE", ethers.provider);

let QUORUM_PER_MILLION = 666666;
let CHAIN_ID = targetNetwork == "localhost" ? 31337 : 11155111;

const main = async () => {
  if (!customSigner) {
    console.error("Place deployer account at top");
    return;
  }

  if (targetNetwork == "localhost")
    await (
      await ethers.getSigners()
    )[0].sendTransaction({
      to: customSigner.address,
      value: ethers.utils.parseEther("0.02"),
    });

  console.log(`\n\n 📡 Deploying to ${targetNetwork}...\n`);

  const weightedMultiSigWallet = await deploy("WeightedMultiSigWallet", [
    CHAIN_ID, // Sepolia
    QUORUM_PER_MILLION,
  ]);
  const govTokenAddr = await weightedMultiSigWallet.govToken();
  fs.writeFileSync(`artifacts/WalletGovToken.address`, govTokenAddr);

  console.log(`Government token at: ${govTokenAddr}`);

  if (targetNetwork !== "localhost") {
    console.log(`\n\n 📡 Verifying contract...\n`);
    await run("verify:verify", {
      address: weightedMultiSigWallet.address,
      contract: "contracts/WeightedMultiSigWallet.sol:WeightedMultiSigWallet",
      constructorArguments: [CHAIN_ID, QUORUM_PER_MILLION],
    });
    console.log(`\n\n 📄 Contract verified.\n`);
  }

  const govToken = await (
    await ethers.getContractFactory("WalletGovToken")
  ).attach(govTokenAddr);
};

const deploy = async (
  walletContractName,
  _args = [],
  overrides = {},
  libraries = {}
) => {
  console.log(` 🛰  Deploying: ${walletContractName}`);

  const contractArgs = _args || [];
  const contractArtifacts = await ethers.getContractFactory(
    walletContractName,
    {
      libraries: libraries,
    }
  );

  let deployed;
  if (customSigner) {
    deployed = await contractArtifacts
      .connect(customSigner)
      .deploy(...contractArgs, overrides);
  } else {
    deployed = await contractArtifacts.deploy(...contractArgs, overrides);
  }

  const encoded = abiEncodeArgs(deployed, contractArgs);
  fs.writeFileSync(`artifacts/${walletContractName}.address`, deployed.address);

  console.log(
    " 📄",
    chalk.cyan(walletContractName),
    "deployed to:",
    chalk.magenta(deployed.address)
  );

  await tenderly.persistArtifacts({
    name: walletContractName,
    address: deployed.address,
  });

  if (!encoded || encoded.length <= 2) return deployed;
  fs.writeFileSync(`artifacts/${walletContractName}.args`, encoded.slice(2));

  return deployed;
};

// ------ utils -------

// abi encodes contract arguments
// useful when you want to manually verify the contracts
// for example, on Etherscan
const abiEncodeArgs = (deployed, contractArgs) => {
  // not writing abi encoded args if this does not pass
  if (
    !contractArgs ||
    !deployed ||
    !R.hasPath(["interface", "deploy"], deployed)
  ) {
    return "";
  }
  const encoded = utils.defaultAbiCoder.encode(
    deployed.interface.deploy.inputs,
    contractArgs
  );
  return encoded;
};

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
