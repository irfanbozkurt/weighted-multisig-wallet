/* eslint no-use-before-define: "warn" */
const fs = require("fs");
const chalk = require("chalk");
const { config, ethers, tenderly, run, network } = require("hardhat");
const { utils } = require("ethers");
const R = require("ramda");

let targetNetwork = process.env.HARDHAT_NETWORK || config.defaultNetwork;

let customSigner;

const main = async () => {
  // FE account pk
  customSigner = new ethers.Wallet(
    "0x11377fe5556d9bf81c3d5f24b37b5fffdf2b4bb494b91bd70a9c11545c4bb016",
    ethers.provider
  );

  await (
    await ethers.getSigners()
  )[0].sendTransaction({
    to: customSigner.address,
    value: ethers.utils.parseEther("0.02"),
  });

  console.log(`\n\n 📡 Deploying to ${targetNetwork}...\n`);

  const metaMultiSigWallet = await deploy("WeightedMultiSigWallet", [
    targetNetwork == "localhost" ? 31337 : 11155111, // Sepolia
    666666,
  ]);

  const govTokenAddr = await metaMultiSigWallet.govToken();

  fs.writeFileSync(`artifacts/WalletGovToken.address`, govTokenAddr);

  const govToken = await (
    await ethers.getContractFactory("WalletGovToken")
  ).attach(govTokenAddr);
  const deployer = (await ethers.getSigners())[0];

  //const yourContract = await deploy("YourContract") // <-- add in constructor args like line 19 vvvv

  //const secondContract = await deploy("SecondContract")

  // const exampleToken = await deploy("ExampleToken")
  // const examplePriceOracle = await deploy("ExamplePriceOracle")
  // const smartContractWallet = await deploy("SmartContractWallet",[exampleToken.address,examplePriceOracle.address])

  /*
  //If you want to send value to an address from the deployer
  const deployerWallet = ethers.provider.getSigner()
  await deployerWallet.sendTransaction({
    to: "0x34aA3F359A9D614239015126635CE7732c18fDF3",
    value: ethers.utils.parseEther("0.001")
  })
  */

  /*
  //If you want to send some ETH to a contract on deploy (make your constructor payable!)
  const yourContract = await deploy("YourContract", [], {
  value: ethers.utils.parseEther("0.05")
  });
  */

  /*
  //If you want to link a library into your contract:
  // reference: https://github.com/austintgriffith/scaffold-eth/blob/using-libraries-example/packages/hardhat/scripts/deploy.js#L19
  const yourContract = await deploy("YourContract", [], {}, {
   LibraryName: **LibraryAddress**
  });
  */

  //If you want to verify your contract on tenderly.co (see setup details in the scaffold-eth README!)
  /*
  await tenderlyVerify(
    {walletContractName: "YourContract",
     contractAddress: yourContract.address
  })
  */

  // If you want to verify your contract on etherscan
  /*
  console.log(chalk.blue('verifying on etherscan'))
  await run("verify:verify", {
    address: yourContract.address,
    // constructorArguments: args // If your contract has constructor arguments, you can pass them as an array
  })
  */

  console.log(
    " 💾  Artifacts (address, abi, and args) saved to: ",
    chalk.blue("packages/hardhat/artifacts/"),
    "\n\n"
  );
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

// checks if it is a Solidity file
const isSolidity = (fileName) =>
  fileName.indexOf(".sol") >= 0 &&
  fileName.indexOf(".swp") < 0 &&
  fileName.indexOf(".swap") < 0;

const readArgsFile = (walletContractName) => {
  let args = [];
  try {
    const argsFile = `./contracts/${walletContractName}.args`;
    if (!fs.existsSync(argsFile)) return args;
    args = JSON.parse(fs.readFileSync(argsFile));
  } catch (e) {
    console.log(e);
  }
  return args;
};

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// If you want to verify on https://tenderly.co/
const tenderlyVerify = async ({ walletContractName, contractAddress }) => {
  let tenderlyNetworks = [
    "kovan",
    "goerli",
    "mainnet",
    "rinkeby",
    "ropsten",
    "matic",
    "mumbai",
    "xDai",
    "POA",
  ];

  if (tenderlyNetworks.includes(targetNetwork)) {
    console.log(
      chalk.blue(
        ` 📁 Attempting tenderly verification of ${walletContractName} on ${targetNetwork}`
      )
    );

    await tenderly.persistArtifacts({
      name: walletContractName,
      address: contractAddress,
    });

    let verification = await tenderly.verify({
      name: walletContractName,
      address: contractAddress,
      network: targetNetwork,
    });

    return verification;
  } else {
    console.log(
      chalk.grey(` 🧐 Contract verification not supported on ${targetNetwork}`)
    );
  }
};

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
