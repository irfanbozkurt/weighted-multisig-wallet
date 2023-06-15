import React, { useCallback, useEffect, useState } from "react";
import { useHistory } from "react-router-dom";
import { Select, Button, List, Divider, Input, Card, DatePicker, Slider, Switch, Progress, Spin } from "antd";
import { SyncOutlined } from "@ant-design/icons";
import { Address, AddressInput, Balance, Blockie } from "../components";
import { parseEther, formatEther } from "@ethersproject/units";
import { ethers } from "ethers";
import { useContractReader, useEventListener, useLocalStorage } from "../hooks";
const axios = require("axios");
const { Option } = Select;

export default function Senate({
  walletContractName,
  ownerEvents,
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
  const history = useHistory();

  const [newSigner, setNewSigner] = useLocalStorage("");
  const [to, setTo] = useLocalStorage("to");

  const [givenSupply, setGivenSupply] = useLocalStorage("newquorumPerMillion");
  const [data, setData] = useLocalStorage("data", "0x");

  return (
    <div>
      <h2 style={{ marginTop: 32 }}>
        Transactions will require {quorumPerMillion ? quorumPerMillion.toNumber() : <Spin></Spin>} signature weight.
      </h2>
      <List
        style={{ maxWidth: 400, margin: "auto", marginTop: 32 }}
        bordered
        dataSource={ownerEvents}
        renderItem={item => {
          return (
            <List.Item key={"owner_" + item[0]}>
              <Address address={item[0]} ensProvider={mainnetProvider} blockExplorer={blockExplorer} fontSize={32} />
              <div style={{ padding: 16 }}>{item[1] ? "👍" : "👎"}</div>
            </List.Item>
          );
        }}
      />

      <div style={{ border: "1px solid #cccccc", padding: 16, width: 400, margin: "auto", marginTop: 64 }}>
        <div style={{ margin: 8, padding: 8 }}>Add new signer by sending them gov tokens</div>
        <div style={{ margin: 8, padding: 8 }}>
          <AddressInput
            autoFocus
            ensProvider={mainnetProvider}
            placeholder="New Signer"
            value={newSigner}
            onChange={setNewSigner}
          />
        </div>
        <div style={{ margin: 8, padding: 8 }}>
          <Input
            ensProvider={mainnetProvider}
            placeholder="Gov tokens you want to give"
            value={givenSupply}
            onChange={e => {
              setGivenSupply(e.target.value);
            }}
          />
        </div>
        <div style={{ margin: 8, padding: 8 }}>
          <Button
            onClick={() => {
              const calldata = readContracts[walletContractName].interface.encodeFunctionData("transferFrom", [
                address,
                newSigner,
                givenSupply,
              ]);
              setData(calldata);
              setTo(readContracts[walletContractName].address);
              setGivenSupply("0");
              setNewSigner("");
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
