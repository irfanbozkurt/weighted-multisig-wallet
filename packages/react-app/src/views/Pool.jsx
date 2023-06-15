import { parseEther } from "@ethersproject/units";
import { Button, List, Spin } from "antd";
import { ethers } from "ethers";
import React, { useState } from "react";
import { TransactionListItem } from "../components";
import { useLocalStorage, usePoller } from "../hooks";

const axios = require("axios");

const DEBUG = false;

export default function Pool({
  poolServerUrl,
  walletContractName,
  quorumPerMillion,
  address,
  nonce,
  userProvider,
  mainnetProvider,
  localProvider,
  yourLocalBalance,
  price,
  tx,
  readContracts,
  writeContracts,
  blockExplorer,
}) {
  const [txInPool, setTxInPool] = useState();
  const [govTokenBalances] = useLocalStorage("govTokenBalances");

  usePoller(() => {
    const getTransactions = async () => {
      if (true) console.log("🛰 Requesting Transaction List");
      const res = await axios.get(
        poolServerUrl + readContracts[walletContractName].address + "_" + localProvider._network.chainId,
      );
      const newTransactions = [];
      for (const i in res.data) {
        // console.log("look through signatures of ",res.data[i])
        const thisNonce = ethers.BigNumber.from(res.data[i].nonce);
        if (thisNonce && nonce && thisNonce.gte(nonce)) {
          const validSignatures = [];
          for (const s in res.data[i].signatures) {
            // console.log("RECOVER:",res.data[i].signatures[s],res.data[i].hash)
            const signer = await readContracts[walletContractName].recover(res.data[i].hash, res.data[i].signatures[s]);
            const hasWeight = await writeContracts[walletContractName].hasWeight();
            if (signer && hasWeight) {
              validSignatures.push({ signer, signature: res.data[i].signatures[s] });
            }
          }
          const update = { ...res.data[i], validSignatures };
          // console.log("update",update)
          newTransactions.push(update);
        }
      }
      setTxInPool(newTransactions);
      console.log("Loaded", newTransactions.length);
    };
    if (readContracts) getTransactions();
  }, 3777);

  const getSortedSigList = async (allSigs, newHash) => {
    console.log("allSigs", allSigs);

    const sigList = [];
    for (const s in allSigs) {
      sigList.push({
        signature: allSigs[s],
        signer: await readContracts[walletContractName].recover(newHash, allSigs[s]),
      });
    }

    sigList.sort((a, b) => {
      return ethers.BigNumber.from(a.signer).sub(ethers.BigNumber.from(b.signer));
    });

    const finalSigList = [];
    const finalSigners = [];
    const used = {};
    for (const s in sigList) {
      if (!used[sigList[s].signature]) {
        finalSigList.push(sigList[s].signature);
        finalSigners.push(sigList[s].signer);
      }
      used[sigList[s].signature] = true;
    }

    console.log("FINAL SIG LIST:", finalSigList);
    return [finalSigList, finalSigners];
  };

  if (!quorumPerMillion) {
    return <Spin />;
  }

  console.log("transactions", txInPool);

  return (
    <div style={{ maxWidth: 750, margin: "auto", marginTop: 32, marginBottom: 32 }}>
      <h1>
        <b style={{ padding: 16 }}>Live Proposal Pool</b>
      </h1>

      <List
        bordered
        dataSource={txInPool}
        renderItem={item => {
          console.log("ITE88888M", item);

          const hasSigned = item.signers.indexOf(address) >= 0;
          const collectedWeight = item.signers.reduce((acc, addr) => acc + parseInt(govTokenBalances[addr] || 0), 0);
          const hasEnoughSignatures = collectedWeight <= quorumPerMillion.toNumber();

          return (
            <TransactionListItem
              item={item}
              mainnetProvider={mainnetProvider}
              blockExplorer={blockExplorer}
              price={price}
              readContracts={readContracts}
              walletContractName={walletContractName}
            >
              <span>
                {collectedWeight}/{quorumPerMillion.toNumber()}
              </span>
              <Button
                disabled={hasSigned}
                onClick={async () => {
                  console.log("item.signatures", item.signatures);

                  const newHash = await readContracts[walletContractName].getTransactionHash(
                    item.nonce,
                    item.to,
                    parseEther("" + parseFloat(item.amount).toFixed(12)),
                    item.data,
                  );
                  console.log("newHash", newHash);

                  const signature = await userProvider.send("personal_sign", [newHash, address]);
                  console.log("signature", signature);

                  const recover = await readContracts[walletContractName].recover(newHash, signature);
                  console.log("recover--->", recover);

                  const hasWeight = await writeContracts[walletContractName].hasWeight();

                  if (hasWeight) {
                    const [finalSigList, finalSigners] = await getSortedSigList(
                      [...item.signatures, signature],
                      newHash,
                    );
                    await axios.post(poolServerUrl, {
                      ...item,
                      signatures: finalSigList,
                      signers: finalSigners,
                    });
                  }
                }}
                type="secondary"
              >
                {hasSigned ? "Signed" : "Sign"}
              </Button>
              <Button
                key={item.hash}
                onClick={async () => {
                  const newHash = await writeContracts[walletContractName].getTransactionHash(
                    item.nonce,
                    item.to,
                    parseEther("" + parseFloat(item.amount).toFixed(12)),
                    item.data,
                  );
                  console.log("newHash", newHash);

                  const [finalSigList, finalSigners] = await getSortedSigList(item.signatures, newHash);

                  tx(
                    writeContracts[walletContractName].executeTransaction(
                      item.to,
                      parseEther("" + parseFloat(item.amount).toFixed(12)),
                      item.data,
                      finalSigList,
                    ),
                  );
                }}
                type={hasEnoughSignatures ? "primary" : "secondary"}
              >
                Exec
              </Button>
            </TransactionListItem>
          );
        }}
      />
    </div>
  );
}
