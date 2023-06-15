const fs = require("fs");
const chalk = require("chalk");
const bre = require("hardhat");

const publishDir = "../react-app/src/contracts";
const graphDir = "../subgraph";

function publishContract(walletContractName) {
  console.log(
    " 💽 Publishing",
    chalk.cyan(walletContractName),
    "to",
    chalk.gray(publishDir)
  );
  try {
    let contract = fs
      .readFileSync(
        `${bre.config.paths.artifacts}/contracts/${walletContractName}.sol/${walletContractName}.json`
      )
      .toString();
    const address = fs
      .readFileSync(
        `${bre.config.paths.artifacts}/${walletContractName}.address`
      )
      .toString();
    contract = JSON.parse(contract);
    let graphConfigPath = `${graphDir}/config/config.json`;
    let graphConfig;
    try {
      if (fs.existsSync(graphConfigPath)) {
        graphConfig = fs.readFileSync(graphConfigPath).toString();
      } else {
        graphConfig = "{}";
      }
    } catch (e) {
      console.log(e);
    }

    graphConfig = JSON.parse(graphConfig);
    graphConfig[walletContractName + "Address"] = address;
    fs.writeFileSync(
      `${publishDir}/${walletContractName}.address.js`,
      `module.exports = "${address}";`
    );
    fs.writeFileSync(
      `${publishDir}/${walletContractName}.abi.js`,
      `module.exports = ${JSON.stringify(contract.abi, null, 2)};`
    );
    fs.writeFileSync(
      `${publishDir}/${walletContractName}.bytecode.js`,
      `module.exports = "${contract.bytecode}";`
    );

    const folderPath = graphConfigPath.replace("/config.json", "");
    if (!fs.existsSync(folderPath)) {
      fs.mkdirSync(folderPath);
    }
    fs.writeFileSync(graphConfigPath, JSON.stringify(graphConfig, null, 2));
    fs.writeFileSync(
      `${graphDir}/abis/${walletContractName}.json`,
      JSON.stringify(contract.abi, null, 2)
    );

    console.log(
      " 📠 Published " + chalk.green(walletContractName) + " to the frontend."
    );

    return true;
  } catch (e) {
    if (e.toString().indexOf("no such file or directory") >= 0) {
      console.log(
        chalk.yellow(
          " ⚠️  Can't publish " +
            walletContractName +
            " yet (make sure it getting deployed)."
        )
      );
    } else {
      console.log(e);
      return false;
    }
  }
}

async function main() {
  if (!fs.existsSync(publishDir)) {
    fs.mkdirSync(publishDir);
  }
  const finalContractList = [];
  fs.readdirSync(bre.config.paths.sources).forEach((file) => {
    if (file.indexOf(".sol") >= 0) {
      const walletContractName = file.replace(".sol", "");
      // Add contract to list if publishing is successful
      if (publishContract(walletContractName)) {
        finalContractList.push(walletContractName);
      }
    }
  });
  fs.writeFileSync(
    `${publishDir}/contracts.js`,
    `module.exports = ${JSON.stringify(finalContractList)};`
  );
}
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
