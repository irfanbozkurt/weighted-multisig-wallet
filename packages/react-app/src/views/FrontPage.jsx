import React, { useCallback, useEffect, useState } from "react";
import { Button, List, Modal, Input, Card, DatePicker, Slider, Switch, Progress, Spin } from "antd";
import { SyncOutlined } from "@ant-design/icons";
import { parseEther, formatEther } from "@ethersproject/units";
import { ethers } from "ethers";
import QR from "qrcode.react";
import { useContractReader, useEventListener, useLocalStorage, useLookupAddress } from "../hooks";
import { Address, AddressInput, Balance, Blockie, TransactionListItem } from "../components";
import { Typography, Tooltip } from "antd";
import { PieChart } from "react-minimal-pie-chart";
import Transfer from "./Transfer";
import ProposeSpend from "./ProposeSpend";

const axios = require("axios");

const { Text } = Typography;

export default function FrontPage({
  tokenBalance,
  quorumPerMillion,
  address,
  readContracts,

  executeTransactionEvents,
  writeContracts,
  signerUpdateEvents,
  walletContractName,
  tokenContractName,
  localProvider,

  price,
  mainnetProvider,
  blockExplorer,
}) {
  const populateWeights = () => {
    const weightBalances = {};
    const updateWeight = (address, weight) => {
      if (address in weightBalances) return;
      weightBalances[address] = weight;
    };

    signerUpdateEvents.forEach(event => {
      updateWeight(event[0], parseInt(event[1]));
      updateWeight(event[2], parseInt(event[3]));
    });
    Array.from(Object.keys(weightBalances)).forEach(address => {
      if (weightBalances[address] == 0) delete weightBalances[address];
    });
    return weightBalances;
  };

  const weightBalances = populateWeights();
  const chartData = Array.from(Object.entries(weightBalances)).reduce((acc, [address, balance]) => {
    let color = "#";
    for (let i = 0; i < 6; i++) color += (4 + Math.floor(Math.random() * 7)).toString(16);
    return [...acc, { title: address, value: balance, color: `${color}` }];
  }, []);

  console.log("zürten");
  console.log(weightBalances);
  console.log(chartData);

  return (
    <div style={{ padding: 32, maxWidth: "100%", margin: "auto", display: "flex" }}>
      <div style={{ width: "100%", display: "flex", flexDirection: "column", alignItems: "center" }}>
        <div style={{ display: "flex", flexDirection: "row", textAlign: "center" }}>
          <span style={{ verticalAlign: "middle", paddingLeft: 5, fontSize: 36, width: "100%" }}>
            <Text>
              <a style={{ color: "#ddd" }} target={"_blank"} rel="noopener noreferrer">
                Your weight: {parseInt(tokenBalance)}
              </a>
            </Text>
          </span>
        </div>

        <div
          style={{
            width: "85%",
            height: "30%",
            border: "solid",
            borderRadius: "250px",
            borderColor: "rgb(33, 33, 33)",
            overflow: "hidden",
            display: `${chartData.length == 0 ? `none` : ""}`,
          }}
        >
          <PieChart
            style={{
              opacity: "60%",
              fontFamily: '"Nunito Sans", -apple-system, Helvetica, Arial, sans-serif',
              fontSize: "8px",
            }}
            data={chartData}
            radius={200}
            animate={true}
            animationDuration={1000}
            segmentsStyle={{ transition: "stroke .3s", cursor: "pointer" }}
            segmentsShift={1}
          />
          <Tooltip title="anal"></Tooltip>
        </div>

        <div style={{ display: "flex", flexDirection: "row", textAlign: "center" }}>
          <Transfer
            walletContractName={walletContractName}
            tokenContractName={tokenContractName}
            address={address}
            tokenBalance={tokenBalance}
            mainnetProvider={mainnetProvider}
            writeContracts={writeContracts}
            readContracts={readContracts}
            quorumPerMillion={quorumPerMillion}
          />
        </div>

        <div style={{ paddingTop: 20, width: "95%" }}>
          <div style={{ display: "flex", flexDirection: "row", textAlign: "center" }}>
            <span style={{ verticalAlign: "middle", paddingLeft: 5, fontSize: 36, width: "100%" }}>
              <Text>
                <a style={{ color: "#ddd" }} target={"_blank"} rel="noopener noreferrer">
                  weight hodlers
                </a>
              </Text>
            </span>
          </div>

          <List
            bordered
            dataSource={chartData}
            renderItem={item => {
              return (
                <div style={{ display: "flex", flexDirection: "row" }}>
                  <div style={{ display: "flex", flexDirection: "row", width: "100%" }}>
                    <span style={{ verticalAlign: "middle", paddingLeft: 5, fontSize: 28, width: "100%" }}>
                      <Address
                        address={item.title}
                        ensProvider={mainnetProvider}
                        blockExplorer={blockExplorer}
                        fontSize={28}
                      />
                    </span>
                  </div>

                  <div style={{ display: "flex", flexDirection: "row", width: "100%" }}>
                    <span style={{ verticalAlign: "middle", paddingLeft: 5, fontSize: 28, width: "100%" }}>
                      <Text>
                        <a style={{ color: "#ddd" }} target={"_blank"} rel="noopener noreferrer">
                          {parseInt(item.value)}
                        </a>
                      </Text>
                    </span>
                  </div>
                </div>
              );
            }}
          />
        </div>

        <div style={{ paddingTop: 20, width: "95%" }}>
          <div style={{ display: "flex", flexDirection: "row", textAlign: "center" }}>
            <span style={{ verticalAlign: "middle", paddingLeft: 5, fontSize: 36, width: "100%" }}>
              <Text>
                <a style={{ color: "#ddd" }} target={"_blank"} rel="noopener noreferrer">
                  weight transfers
                </a>
              </Text>
            </span>
          </div>

          <List
            bordered
            dataSource={signerUpdateEvents}
            renderItem={item => {
              return (
                <div style={{ display: "flex", flexDirection: "row", justifyContent: "center" }}>
                  <div style={{ display: "flex", flexDirection: "row", width: "30%" }}>
                    <span style={{ verticalAlign: "middle", fontSize: 28, width: "100%" }}>
                      <Address
                        address={item[0]}
                        ensProvider={mainnetProvider}
                        blockExplorer={blockExplorer}
                        fontSize={16}
                      />
                    </span>
                  </div>

                  <div
                    style={{
                      display: "flex",
                      flexDirection: "row",
                      width: "40%",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <span style={{ verticalAlign: "middle", fontSize: 28 }}>
                      <Text>
                        <a style={{ color: "#ddd" }} target={"_blank"} rel="noopener noreferrer">
                          --
                        </a>
                      </Text>
                    </span>
                    <span style={{ verticalAlign: "middle", paddingLeft: 5, fontSize: 28 }}>
                      <Text>
                        <a style={{ color: "#ddd" }} target={"_blank"} rel="noopener noreferrer">
                          {parseInt(item[4])}
                        </a>
                      </Text>
                    </span>
                    <span style={{ verticalAlign: "middle", paddingLeft: 5, fontSize: 28 }}>
                      <Text>
                        <a style={{ color: "#ddd" }} target={"_blank"} rel="noopener noreferrer">
                          {"-->"}
                        </a>
                      </Text>
                    </span>
                  </div>

                  <div style={{ display: "flex", flexDirection: "row", width: "30%" }}>
                    <span style={{ verticalAlign: "middle", fontSize: 28 }}>
                      <Address
                        address={item[2]}
                        ensProvider={mainnetProvider}
                        blockExplorer={blockExplorer}
                        fontSize={16}
                      />
                    </span>
                  </div>
                </div>
              );
            }}
          />
        </div>
      </div>

      <div style={{ width: "100%" }}>
        <div style={{ display: "flex", flexDirection: "row", textAlign: "center" }}>
          <span style={{ paddingBottom: 30, verticalAlign: "middle", paddingLeft: 5, fontSize: 36, width: "100%" }}>
            <Text>
              <a style={{ color: "#ddd" }} target={"_blank"} rel="noopener noreferrer">
                Contract Balance
              </a>
            </Text>
          </span>
        </div>
        <div style={{ width: "95%", display: "flex", justifyContent: "center", alignItems: "center" }}>
          <div style={{ maxWidth: "100%" }}>
            <div>
              <Balance
                address={readContracts ? readContracts[walletContractName].address : readContracts}
                provider={localProvider}
                dollarMultiplier={price}
                fontSize={36}
              />
            </div>
            <div>
              <Address
                address={readContracts ? readContracts[walletContractName].address : readContracts}
                ensProvider={mainnetProvider}
                blockExplorer={blockExplorer}
                fontSize={32}
              />
            </div>
          </div>

          <div style={{ maxWidth: "100%", display: "flex", flexDirection: "row", marginLeft: 20 }}>
            <ProposeSpend
              walletContractName={walletContractName}
              tokenContractName={tokenContractName}
              address={address}
              tokenBalance={tokenBalance}
              mainnetProvider={mainnetProvider}
              writeContracts={writeContracts}
              price={price}
              readContracts={readContracts}
              quorumPerMillion={quorumPerMillion}
            />
          </div>
        </div>

        <div style={{ paddingTop: 20, width: "95%" }}>
          <div style={{ display: "flex", flexDirection: "row", textAlign: "center" }}>
            <span style={{ verticalAlign: "middle", paddingLeft: 5, fontSize: 36, width: "100%" }}>
              <Text>
                <a style={{ color: "#ddd" }} target={"_blank"} rel="noopener noreferrer">
                  executed proposals
                </a>
              </Text>
            </span>
          </div>

          <List
            bordered
            dataSource={executeTransactionEvents}
            renderItem={item => {
              return (
                <>
                  <TransactionListItem
                    item={item}
                    mainnetProvider={mainnetProvider}
                    blockExplorer={blockExplorer}
                    price={price}
                    readContracts={readContracts}
                    walletContractName={walletContractName}
                  />
                </>
              );
            }}
          />
        </div>
      </div>
    </div>
  );
}
