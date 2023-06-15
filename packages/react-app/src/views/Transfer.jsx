import { Button, Input, Spin } from "antd";
import React from "react";
import { useHistory } from "react-router-dom";
import { AddressInput } from "../components";
import { useLocalStorage } from "../hooks";

export default function Transfer({
  walletContractName,
  tokenBalance,
  quorumPerMillion,
  address,
  mainnetProvider,
  readContracts,
}) {
  const history = useHistory();

  const [recipient, setRecipient] = useLocalStorage("");
  const [givenSupply, setGivenSupply] = useLocalStorage("");
  const [, setCreateTxAutoApproval] = useLocalStorage("createTxAutoApproval", 0);

  const [, setMethodName] = useLocalStorage("createTx", "");
  const [, setCreateTxMethodNameDisabled] = useLocalStorage("createTxMethodNameDisabled");

  const [, setTo] = useLocalStorage("to");
  const [, setToDisabled] = useLocalStorage("toDisabled");

  const [, setData] = useLocalStorage("data", "0x");
  const [, setDataDisabled] = useLocalStorage("createTxDataDisabled");

  const [, setAmount] = useLocalStorage("createTxAmount");
  const [, setCreateTxAmountDisabled] = useLocalStorage("createTxAmountDisabled", false);

  return (
    <div
      style={{
        border: "1px solid #cccccc",
        width: 400,
        margin: "auto",
        borderRadius: 30,
        padding: 10,
        marginTop: 24,
      }}
    >
      <div style={{ margin: 8 }}>Register new signer by sending them gov tokens</div>
      <div style={{ margin: 8 }}>
        This proposal will require {quorumPerMillion ? quorumPerMillion.toNumber() : <Spin></Spin>} signature weight
      </div>
      <div style={{ margin: 8 }}>
        <AddressInput
          autoFocus
          ensProvider={mainnetProvider}
          placeholder="New Signer"
          value={recipient}
          onChange={setRecipient}
        />
      </div>
      <div style={{ margin: 8, display: "flex", justifyContent: "space-between" }}>
        <div style={{ width: "100%", paddingRight: 10 }}>
          <Input
            ensProvider={mainnetProvider}
            placeholder="Gov tokens to give"
            value={givenSupply}
            type="number"
            max={parseInt(tokenBalance)}
            min={1}
            onChange={e => {
              setGivenSupply(e.target.value);
            }}
          />
        </div>

        <div>
          <Button
            onClick={async () => {
              const calldata = readContracts[walletContractName].interface.encodeFunctionData("transferWeight", [
                address,
                recipient,
                givenSupply,
              ]);
              setRecipient("");
              setGivenSupply("0");

              setMethodName("transferWeight");
              setCreateTxMethodNameDisabled(true);

              setData(calldata);
              setDataDisabled(true);

              setTo(readContracts[walletContractName].address);
              setToDisabled(true);

              setCreateTxAutoApproval(givenSupply);

              setAmount(0);
              setCreateTxAmountDisabled(true);

              setTimeout(() => {
                history.push("/create");
              }, 777);
            }}
          >
            Create Tx
          </Button>
        </div>
      </div>
    </div>
  );
}
