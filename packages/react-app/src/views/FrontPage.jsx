import { List, Typography } from "antd";
import React, { useEffect } from "react";
import { PieChart } from "react-minimal-pie-chart";
import { Address, Balance, SendGovToken, TransactionListItem } from "../components";
import ProposeSpend from "../components/ProposeSpend";
import { useLocalStorage } from "../hooks";

const axios = require("axios");

const { Text } = Typography;

export default function FrontPage({
  tokenBalance,
  quorumPerMillion,
  readContracts,

  executeTransactionEvents,
  writeContracts,
  tokenTransferEvents,
  walletContractName,
  tokenContractName,
  localProvider,
  tx,

  price,
  mainnetProvider,
  blockExplorer,
}) {
  const [govTokenBalances, setGovTokenBalances] = useLocalStorage("govTokenBalances", {});

  const govTokenHolders = Array.from(
    tokenTransferEvents.reduce((set, event) => {
      set.add(event[1]);
      return set;
    }, new Set()),
  );

  useEffect(() => {
    Promise.all(
      govTokenHolders.map(async holder => {
        return [holder, parseInt(await readContracts[tokenContractName][`balanceOf(address)`](holder))];
      }),
    ).then(entries => setGovTokenBalances(Object.fromEntries(entries)));
  }, [tokenTransferEvents]);

  let a = govTokenBalances;

  const chartData = Array.from(Object.entries(govTokenBalances)).reduce((acc, [address, balance]) => {
    let color = "#";
    for (let i = 0; i < 6; i++) color += (4 + Math.floor(Math.random() * 7)).toString(16);
    return [...acc, { title: address, value: balance, color: `${color}` }];
  }, []);

  return (
    <div style={{ padding: 32, maxWidth: "100%", margin: "auto", display: "flex" }}>
      <div style={{ width: "80%", display: "flex", flexDirection: "column", alignItems: "center" }}>
        <div style={{ display: "flex", flexDirection: "row", textAlign: "center" }}>
          <span style={{ verticalAlign: "middle", paddingLeft: 5, fontSize: 36, paddingBottom: 24, width: "100%" }}>
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
        </div>

        <div style={{ maxWidth: "95%", display: "flex", flexDirection: "row", marginLeft: 20 }}>
          <SendGovToken
            mainnetProvider={mainnetProvider}
            writeContracts={writeContracts}
            tokenContractName={tokenContractName}
            tx={tx}
            tokenBalance={tokenBalance}
          />
        </div>

        <div style={{ paddingTop: 20, width: "95%", maxHeight: "600px", overflow: "scroll" }}>
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
      </div>

      <div style={{ width: "100%" }}>
        <div style={{ display: "flex", flexDirection: "row", textAlign: "center" }}>
          <span style={{ paddingBottom: 24, verticalAlign: "middle", paddingLeft: 5, fontSize: 36, width: "100%" }}>
            <Text>
              <a style={{ color: "#ddd" }} target={"_blank"} rel="noopener noreferrer">
                Contract Balance
              </a>
            </Text>
          </span>
        </div>
        <div style={{ width: "95%", display: "flex", justifyContent: "space-around", alignItems: "center" }}>
          <div style={{ maxWidth: "90%", border: "1px solid rgb(50, 50, 50)", borderRadius: 10 }}>
            <div style={{ padding: 5 }}>
              <Balance
                address={readContracts ? readContracts[walletContractName].address : readContracts}
                provider={localProvider}
                dollarMultiplier={price}
                fontSize={36}
              />
            </div>
            <div style={{ padding: 5 }}>
              <Address
                address={readContracts ? readContracts[walletContractName].address : readContracts}
                ensProvider={mainnetProvider}
                blockExplorer={blockExplorer}
                fontSize={32}
              />
            </div>
          </div>

          <div style={{ maxWidth: "100%", display: "flex", flexDirection: "row", marginLeft: 20 }}>
            <ProposeSpend mainnetProvider={mainnetProvider} price={price} quorumPerMillion={quorumPerMillion} />
          </div>
        </div>

        <div style={{ paddingTop: 32, width: "95%", maxHeight: "600px", overflow: "scroll" }}>
          <div style={{ display: "flex", flexDirection: "row", textAlign: "center" }}>
            <span style={{ verticalAlign: "middle", paddingLeft: 5, fontSize: 36, width: "100%" }}>
              <Text>
                <a style={{ color: "#ddd" }} target={"_blank"} rel="noopener noreferrer">
                  executed ether transfers
                </a>
              </Text>
            </span>
          </div>

          <List
            bordered
            dataSource={executeTransactionEvents.filter(event => event["data"] == "0x00")}
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

        <div style={{ paddingTop: 32, width: "95%", maxHeight: "600px", overflow: "scroll" }}>
          <div style={{ display: "flex", flexDirection: "row", textAlign: "center" }}>
            <span style={{ verticalAlign: "middle", paddingLeft: 5, fontSize: 36, width: "100%" }}>
              <Text>
                <a style={{ color: "#ddd" }} target={"_blank"} rel="noopener noreferrer">
                  other executions
                </a>
              </Text>
            </span>
          </div>

          <List
            bordered
            dataSource={executeTransactionEvents.filter(event => event["data"] != "0x00")}
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
