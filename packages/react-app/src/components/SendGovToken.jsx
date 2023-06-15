import { Button, Input } from "antd";
import React, { useState } from "react";
import { AddressInput } from ".";

export default function SendGovToken({ mainnetProvider, writeContracts, tokenContractName, tx, tokenBalance }) {
  const [to, setTo] = useState("");
  const [amount, setAmount] = useState(0);

  return (
    <div
      style={{
        border: "1px solid #cccccc",
        borderRadius: 30,
        width: 400,
        margin: "auto",
        padding: 10,
        marginTop: 24,
      }}
    >
      <div style={{ margin: 8 }}> Send governance tokens to another address </div>
      <div style={{ margin: 8 }}>
        <AddressInput autoFocus ensProvider={mainnetProvider} placeholder="Receiver" value={to} onChange={setTo} />
      </div>
      <div style={{ margin: 8, display: "flex", justifyContent: "space-between" }}>
        <div style={{ width: "100%", paddingRight: 10 }}>
          <Input
            type="number"
            min={1}
            max={parseInt(tokenBalance)}
            value={amount}
            onChange={e => setAmount(e.target.value)}
          />
        </div>

        <div>
          <Button
            onClick={async () => {
              tx(writeContracts[tokenContractName].transfer(to, amount));
              setTo("");
              setAmount("");
            }}
          >
            Send Tokens
          </Button>
        </div>
      </div>
    </div>
  );
}
