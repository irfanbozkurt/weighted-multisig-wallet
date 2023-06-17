# 🔶 Weighted MultiSig Wallet

Weighted MultiSig wallet deploys and uses a fixed supply of 1,000,000 ERC20 tokens representing **signature weight**, similar to how Decentralized Autonomous Organizations use a governance token to represent vote weight.

Execution proposals are published to a back-end for other signers to see and interact with, and only the proposals acquiring weight more than a configurable threshold (2/3 by default) can get executed. Weight of a participant's signature will be determined by their **token balance** at the execution time.

While anyone holding at least 1 gov token can create proposals, only the **executors** can grab all signatures and actually execute a pending proposal. Initially the only executor will be the deployer, but new executors can be added through the voting mechanism.

Weighted MultiSig Wallet provides pre-configured UI interfaces for Wallet governance and payment calls, but users can craft custom calldata and propose entirely custom calls to any CA or EOA. Inputed 'to', 'value' and '_calldata' will literally be **call{}()** ed by the wallet contract, given enough signature weight. Explore further all these interfaces in the online demo.

### Demo on Sepolia : [weighted-multisig.surge.sh](https://weighted-multisig.surge.sh) (please switch to sepolia)

- buidlguidl.eth is granted 333,333 of all 1,000,000 tokens
- buidlguidl.eth is registered as an executor

<br>

### [WeightedMultiSigWallet Contract](./packages/hardhat/contracts/WeightedMultiSigWallet.sol) - [Etherscan Sepolia](https://sepolia.etherscan.io/address/0x76D4E44335D50C4e74BB681708a62FE5862671E8)

### [WalletGovToken Contract](./packages/hardhat/contracts/WalletGovToken.sol)

<br>

## 🏄‍♂️ Getting Started Locally

Prerequisites: [Node (v18 LTS)](https://nodejs.org/en/download/) plus [Yarn](https://classic.yarnpkg.com/en/docs/install/) and [Git](https://git-scm.com/downloads)

> clone/fork 👛 weighted-multisig-wallet:

```bash
git clone https://github.com/irfanbozkurt/weighted-multisig-wallet.git
```

> install and start your 👷‍ Hardhat chain:

```bash
cd Weighted-Multisig-Wallet
yarn install
yarn backend
yarn chain
```

> in a second terminal window, start your 📱 frontend:

```bash
yarn start
```

> Replace PLACE_DEPLOYER_PK_HERE in [deploy.js](./packages/hardhat/scripts/deploy.js) file with the private key of your deployer account. Make sure it has funds in the chain you're deploying. For localhost, you can get the private key from 'wallet icon' -> 'private key'

> in a third terminal window, 🛰 deploy your contract:

```bash
yarn deploy
```

> in a fourth terminal window, 🗄 start your backend:

```bash
yarn backend
```

📱 Open http://localhost:3000 to see the app

🚀 Built with [Scaffold-Eth](https://github.com/scaffold-eth/scaffold-eth)
