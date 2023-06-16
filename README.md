# 🔶 Weighted MultiSig Wallet

Weighted MultiSig wallet deploys and uses a fixed supply of ERC20 tokens representing **signature weight**, similar to how Decentralized Autonomous Organizations use a governance token to represent vote weight.

Execution proposals are published to a back-end for other signers to see and interact with, and only the proposals acquiring weight more than the threshold of the wallet can get executed. Weight of a participant's signature will be determined by their **token balance** at the execution time.

While anyone connecting to the front-end can create proposals, only the **executors** can grab all signatures and actually execute the proposals. Initially the only executor will be the deployer, but new executors can be added through the voting mechanism.

<br>

### Demo on Sepolia :

<br>

### [WeightedMultiSigWallet Contract](./packages/hardhat/contracts/WeightedMultiSigWallet.sol) - [Etherscan](https://sepolia.etherscan.io/address/0x76D4E44335D50C4e74BB681708a62FE5862671E8)

### [WalletGovToken Contract](./packages/hardhat/contracts/WalletGovToken.sol)

### [Etherscan link](https://sepolia.etherscan.io/address/0x76D4E44335D50C4e74BB681708a62FE5862671E8)

<br>
<br>

## 📡 Deployment

🛰 Ready to deploy to a testnet?

> Change the `defaultNetwork` in `packages/hardhat/hardhat.config.js`

![image](https://user-images.githubusercontent.com/2653167/109538427-4d38c980-7a7d-11eb-878b-b59b6d316014.png)

🔐 Generate a deploy account with `yarn generate`

![image](https://user-images.githubusercontent.com/2653167/109537873-a2c0a680-7a7c-11eb-95de-729dbf3399a3.png)

👛 View your deployer address using `yarn account` (You'll need to fund this account. Hint: use an [instant wallet](https://instantwallet.io) to fund your account via QR code)

![image](https://user-images.githubusercontent.com/2653167/109537339-ff6f9180-7a7b-11eb-85b0-46cd72311d12.png)

👨‍🎤 Deploy your wallet:

```bash
yarn deploy
```

---

# 🏄‍♂️ Getting Started Locally

Prerequisites: [Node (v18 LTS)](https://nodejs.org/en/download/) plus [Yarn](https://classic.yarnpkg.com/en/docs/install/) and [Git](https://git-scm.com/downloads)

> clone/fork 👛 weighted-multisig-wallet:

```bash
git clone https://github.com/irfanbozkurt/weighted-multisig-wallet.git
```

> install and start your 👷‍ Hardhat chain:

```bash
cd Multisig-Wallet
yarn install
yarn chain
```

> in a second terminal window, start your 📱 frontend:

```bash
cd Multisig-Wallet-Creator
yarn start
```

> in a third terminal window, 🛰 deploy your contract:

```bash
cd Multisig-Wallet-Creator
yarn deploy
```

> in a fourth terminal window, 🗄 start your backend:

```bash
cd MultisigWalletCreator
yarn backend
```

📱 Open http://localhost:3000 to see the app

🚀 Built with [Scaffold-Eth](https://github.com/scaffold-eth/scaffold-eth)
