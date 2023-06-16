import { parseEther } from "@ethersproject/units";
import { Button, Input, List, Spin, Typography } from "antd";
import React, { useEffect, useRef, useState } from "react";
import {
  Address,
  AddressInput,
  Balance,
  Blockie,
  EtherInput,
  ProposeAddExecutor,
  ProposeThresholdChange,
} from "../components";
import Pool from "../components/Pool";

const axios = require("axios");
const { Text } = Typography;

export default function Transactions({
  poolServerUrl,
  walletContractName,
  quorumPerMillion,
  blockExplorer,
  address,
  executorEvents,
  yourLocalBalance,
  userIsExecutor,
  tx,
  userProvider,
  nonce,
  mainnetProvider,
  localProvider,
  price,
  readContracts,
  writeContracts,
}) {
  // keep track of a variable from the contract in the local React state:
  const calldataInputRef = useRef("0x");

  const [to, setTo] = useLocalStorage("to");
  const [toDisabled, setToDisabled] = useLocalStorage("toDisabled", false);
  const [amount, setAmount] = useLocalStorage("createTxAmount", "0");
  const [createTxAmountDisabled, setCreateTxAmountDisabled] = useLocalStorage("createTxAmountDisabled", false);

  const [data, setData] = useLocalStorage("data", "0x");
  const [dataDisabled, setDataDisabled] = useLocalStorage("createTxDataDisabled", false);
  const [isCreateTxnEnabled, setCreateTxnEnabled] = useState(true);
  const [decodedDataState, setDecodedData] = useState();
  const [methodName, setMethodName] = useLocalStorage("createTx", "");
  const [createTxMethodNameDisabled, setCreateTxMethodNameDisabled] = useLocalStorage(
    "createTxMethodNameDisabled",
    false,
  );

  let decodedData = "";

  const [result, setResult] = useState();

  let decodedDataObject = "";
  useEffect(() => {
    const inputTimer = setTimeout(async () => {
      try {
        decodedData = (
          <div>
            <div
              style={{
                display: "flex",
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "left",
                marginTop: 16,
              }}
            >
              {decodedDataObject && decodedDataObject.signature && <b>Function Signature : </b>}
              {decodedDataObject.signature}
            </div>
            {decodedDataObject.functionFragment &&
              decodedDataObject.functionFragment.inputs.map((element, index) => {
                if (element.type === "address") {
                  return (
                    <div
                      style={{ display: "flex", flexDirection: "row", alignItems: "center", justifyContent: "left" }}
                    >
                      <b>{element.name} :&nbsp;</b>
                      <Address fontSize={16} address={decodedDataObject.args[index]} ensProvider={mainnetProvider} />
                    </div>
                  );
                }
                if (element.type === "uint256") {
                  return (
                    <p style={{ display: "flex", flexDirection: "row", alignItems: "center", justifyContent: "left" }}>
                      {element.name === "value" ? (
                        <>
                          <b>{element.name} : </b>{" "}
                          <Balance fontSize={16} balance={decodedDataObject.args[index]} dollarMultiplier={price} />{" "}
                        </>
                      ) : (
                        <>
                          <b>{element.name} : </b>{" "}
                          {decodedDataObject.args[index] && decodedDataObject.args[index].toNumber()}
                        </>
                      )}
                    </p>
                  );
                }
              })}
          </div>
        );
        setDecodedData(decodedData);
        setCreateTxnEnabled(true);
        setResult();
      } catch (error) {
        console.log("mistake: ", error);
        if (data !== "0x") setResult("ERROR: Invalid calldata");
        setCreateTxnEnabled(false);
      }
    }, 500);
    return () => {
      clearTimeout(inputTimer);
    };
  }, [data, decodedData, amount]);

  let resultDisplay;
  if (result) {
    if (result.indexOf("ERROR") >= 0) {
      resultDisplay = <div style={{ margin: 16, padding: 8, color: "red" }}>{result}</div>;
    } else {
      resultDisplay = (
        <div style={{ margin: 16, padding: 8 }}>
          <Blockie size={4} scale={8} address={result} /> Tx {result.substr(0, 6)} Created!
          <div style={{ padding: 4 }}>
            <Spin />
          </div>
        </div>
      );
    }
  }

  const clearForm = () => {
    setTo("");
    setToDisabled(false);

    setAmount("0");
    setCreateTxAmountDisabled(false);

    setData("0x");
    setDataDisabled(false);

    setMethodName("");

    setCreateTxMethodNameDisabled(false);
  };

  const [executors, setExecutors] = useLocalStorage([]);
  const possibleExecutors = Array.from(
    executorEvents.reduce((set, event) => {
      set.add(event[0]);
      return set;
    }, new Set()),
  );

  useEffect(() => {
    Promise.all(
      possibleExecutors.map(async addr => {
        return [addr, await readContracts[walletContractName].executors(addr)];
      }),
    ).then(entries => setExecutors(entries.filter(([addr, isExecutor]) => isExecutor).map(([addr]) => addr)));
  }, [executorEvents]);

  console.log("zürten");
  console.log(executorEvents);
  console.log(possibleExecutors);
  console.log(executors);

  return (
    <div
      style={{
        width: "100%",
        padding: 32,
        maxWidth: "100%",
        margin: "auto",
        display: "flex",
        justifyContent: "space-around",
      }}
    >
      {/* LEFT COLUMN */}

      <div
        style={{
          paddingTop: 18,
          textAlign: "center",
          width: "45%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}
      >
        {/* CONTRACT CURRENT WEIGHT INFORMATION */}
        <div style={{ width: "100%", paddingLeft: 16, paddingRight: 16 }}>
          <span
            style={{
              width: "100%",
              display: "flex",
              justifyContent: "center",
              verticalAlign: "middle",
              paddingTop: 15,
              fontSize: 36,
            }}
          >
            <Text>
              <a style={{ color: "#ddd" }} target={"_blank"} rel="noopener noreferrer">
                weight threshold is {parseInt(quorumPerMillion)}
              </a>
            </Text>
          </span>
          <ProposeThresholdChange walletContractName={walletContractName} readContracts={readContracts} />
        </div>

        {/* EXECUTORS */}
        <div
          style={{
            textAlign: "center",
            width: "100%",
            maxHeight: "400px",
            overflow: "scroll",
            alignItems: "center",
          }}
        >
          <h1>
            <b style={{ padding: 16 }}>Executors</b>
          </h1>

          {/* Propose new executor */}

          <div style={{ width: "100%" }}>
            <ProposeAddExecutor
              mainnetProvider={mainnetProvider}
              walletContractName={walletContractName}
              readContracts={readContracts}
            />
          </div>

          {/* List of current executors */}
          <div style={{ width: "100%" }}>
            <List
              bordered
              dataSource={executors}
              renderItem={item => {
                return (
                  <div
                    style={{ display: "flex", flexDirection: "row", width: "100%", alignItems: "center", padding: 10 }}
                  >
                    <span style={{ verticalAlign: "middle", paddingLeft: 5, fontSize: 28, width: "100%" }}>
                      <Address
                        address={item}
                        ensProvider={mainnetProvider}
                        blockExplorer={blockExplorer}
                        fontSize={28}
                      />
                    </span>

                    <div style={{ display: "flex", flexDirection: "row", width: "100%" }}>
                      <Button
                        onClick={async () => {
                          const calldata = readContracts[
                            walletContractName
                          ].interface.encodeFunctionData("removeExecutor", [item]);
                          setData(calldata);
                          setDataDisabled(true);

                          setMethodName("removeExecutor(address)");
                          setCreateTxMethodNameDisabled(true);

                          setTo(readContracts[walletContractName].address);
                          setToDisabled(true);

                          setAmount(0);
                          setCreateTxAmountDisabled(true);

                          window.location.reload(true);
                        }}
                      >
                        Propose Removal Of Executor
                      </Button>
                    </div>
                  </div>
                );
              }}
            />
          </div>
        </div>
      </div>

      {/* RIGHT COLUMN */}

      <div style={{ textAlign: "center", width: "45%" }}>
        <div
          style={{
            border: "1px solid #cccccc",
            borderRadius: "50px",
            padding: 16,
            width: "100%",
            margin: "auto",
            marginTop: 48,
          }}
        >
          {/* Signature of function to be called */}
          <div style={{ padding: 8, width: "100%", display: `${!createTxMethodNameDisabled && "none"}` }}>
            <Input
              style={{ width: "100%" }}
              type="text"
              disabled={true}
              value={methodName}
              placeholder="Enter function signature"
              onChange={e => setMethodName(e.target.value)}
            />
          </div>

          {/* Target Address */}
          <div
            style={{
              ...{
                padding: 10,
              },

              width: "100%",
            }}
          >
            <AddressInput
              autoFocus
              disabled={toDisabled}
              ensProvider={mainnetProvider}
              placeholder="target address"
              value={to}
              onChange={setTo}
            />
          </div>

          {/* Amount to be sent (from the wallet contract) */}
          <div
            style={{
              ...{
                padding: 10,
              },
              width: "100%",
            }}
          >
            <EtherInput
              disabled={createTxAmountDisabled}
              price={price}
              mode="USD"
              value={amount}
              onChange={setAmount}
            />
          </div>

          {/* Calldata (if you'd like to manually change it) */}
          <div
            style={{
              ...{
                padding: 10,
              },

              width: "100%",
            }}
          >
            <Input
              placeholder="calldata"
              disabled={dataDisabled}
              value={data == "0x" ? "" : data}
              onChange={e => {
                setData(e.target.value);
              }}
              ref={calldataInputRef}
            />
            {decodedDataState}
          </div>

          {/* Buttons */}
          <div style={{ display: "flex", width: "100%", justifyContent: "space-around" }}>
            <Button style={{ width: "40%" }} onClick={clearForm}>
              Refresh Form
            </Button>

            <Button
              style={{ width: "40%" }}
              disabled={!isCreateTxnEnabled}
              onClick={async () => {
                const newHash = await writeContracts[walletContractName].getTransactionHash(
                  nonce,
                  to,
                  parseEther("" + parseFloat(amount).toFixed(12)),
                  data,
                );
                console.log("newHash", newHash);

                const signature = await userProvider.send("personal_sign", [newHash, address]);
                console.log("signature", signature);

                const recover = await writeContracts[walletContractName].recover(newHash, signature);
                console.log("recover", recover);

                const hasWeight = await writeContracts[walletContractName].hasWeight();

                if (hasWeight) {
                  // Give allowance to the wallet so that it can transfer tokens from user to newcomer
                  const res = await axios.post(poolServerUrl, {
                    chainId: localProvider._network.chainId,
                    address: writeContracts[walletContractName].address,
                    nonce: parseInt("" + nonce),
                    to,
                    amount,
                    data,
                    hash: newHash,
                    signatures: [signature],
                    signers: [recover],
                  });
                  // IF SIG IS VALUE ETC END TO SERVER AND SERVER VERIFIES SIG IS RIGHT AND IS SIGNER BEFORE ADDING TY
                  console.log("RESULT", res.data);

                  setResult(res.data.hash);
                  clearForm();
                } else {
                  console.log("ERROR, NOT OWNER.");
                  setResult("ERROR, NOT OWNER.");
                }
              }}
            >
              Create
            </Button>
          </div>
          {resultDisplay}
        </div>

        <div
          style={{
            textAlign: "center",
            width: "100%",
            display: "flex",
            flexDirection: "column",
            margin: "auto",
            paddingTop: 32,
            alignItems: "center",
          }}
        >
          <Pool
            poolServerUrl={poolServerUrl}
            userIsExecutor={userIsExecutor}
            walletContractName={walletContractName}
            address={address}
            quorumPerMillion={quorumPerMillion}
            userProvider={userProvider}
            mainnetProvider={mainnetProvider}
            localProvider={localProvider}
            yourLocalBalance={yourLocalBalance}
            price={price}
            tx={tx}
            writeContracts={writeContracts}
            readContracts={readContracts}
            blockExplorer={blockExplorer}
            nonce={nonce}
          />
        </div>
      </div>
    </div>
  );
}

function useLocalStorage(key, initialValue) {
  // State to store our value
  // Pass initial state function to useState so logic is only executed once
  const [storedValue, setStoredValue] = useState(() => {
    try {
      // Get from local storage by key
      const item = window.localStorage.getItem(key);
      // Parse stored json or if none return initialValue
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      // If error also return initialValue
      console.log(error);
      return initialValue;
    }
  });

  // Return a wrapped version of useState's setter function that ...
  // ... persists the new value to localStorage.
  const setValue = value => {
    try {
      // Allow value to be a function so we have same API as useState
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      // Save state
      setStoredValue(valueToStore);
      // Save to local storage
      window.localStorage.setItem(key, JSON.stringify(valueToStore));
    } catch (error) {
      // A more advanced implementation would handle the error case
      console.log(error);
    }
  };

  return [storedValue, setValue];
}
