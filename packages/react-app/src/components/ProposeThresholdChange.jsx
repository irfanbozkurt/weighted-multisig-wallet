import { Button, Input } from "antd";
import React, { useState } from "react";
import { useLocalStorage } from "../hooks";

export default function ProposeThresholdChange({ walletContractName, readContracts }) {
  const [, setMethodName] = useLocalStorage("createTx", "");
  const [, setCreateTxMethodNameDisabled] = useLocalStorage("createTxMethodNameDisabled");

  const [, setTo] = useLocalStorage("to");
  const [, setToDisabled] = useLocalStorage("toDisabled");

  const [customAmount, setCustomAmount] = useState(0);

  const [, setAmount] = useLocalStorage("createTxAmount");
  const [, setCreateTxAmountDisabled] = useLocalStorage("createTxAmountDisabled", false);

  const [, setData] = useLocalStorage("data", "0x");
  const [, setDataDisabled] = useLocalStorage("createTxDataDisabled");

  return (
    <div
      style={{
        width: "80%",
        margin: "auto",
        paddingBottom: 10,
      }}
    >
      <div style={{ margin: 8, display: "flex", justifyContent: "space-between" }}>
        <div style={{ width: "100%", paddingRight: 10 }}>
          <Input
            type="number"
            min={1}
            max={1000000}
            value={customAmount}
            onChange={e => setCustomAmount(e.target.value)}
          />
        </div>

        <div>
          <Button
            onClick={async () => {
              const calldata = readContracts[walletContractName].interface.encodeFunctionData(
                "updateQuorumPerMillion",
                [parseInt(customAmount)],
              );
              setData(calldata);
              setDataDisabled(true);

              setMethodName("updateQuorumPerMillion(uint256)");
              setCreateTxMethodNameDisabled(true);

              setTo(readContracts[walletContractName].address);
              setToDisabled(true);

              setAmount(0);
              setCreateTxAmountDisabled(true);
              setCustomAmount(0);

              window.location.reload(true);
            }}
          >
            Propose new weight threshold
          </Button>
        </div>
      </div>
    </div>
  );
}
