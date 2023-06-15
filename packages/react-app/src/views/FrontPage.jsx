import React, { useCallback, useEffect, useState } from "react";
import { Button, List, Modal, Input, Card, DatePicker, Slider, Switch, Progress, Spin } from "antd";
import { SyncOutlined } from "@ant-design/icons";
import { parseEther, formatEther } from "@ethersproject/units";
import { ethers } from "ethers";
import QR from "qrcode.react";
import { useContractReader, useEventListener, useLocalStorage, useLookupAddress } from "../hooks";
import { Address, AddressInput, Balance, Blockie, TransactionListItem } from "../components";
import { Typography, Skeleton } from "antd";

const axios = require("axios");

const { Text } = Typography;

export default function FrontPage({
  executeTransactionEvents,
  signerUpdateEvents,
  walletContractName,
  localProvider,
  readContracts,
  price,
  mainnetProvider,
  blockExplorer,
}) {
  const [methodName, setMethodName] = useLocalStorage("transferFrom");
  return (
    <div style={{ padding: 32, maxWidth: 750, margin: "auto" }}>
      <div style={{ paddingBottom: 32 }}>
        <div>
          <Balance
            address={readContracts ? readContracts[walletContractName].address : readContracts}
            provider={localProvider}
            dollarMultiplier={price}
            fontSize={64}
          />
        </div>
        <div>
          <QR
            value={readContracts ? readContracts[walletContractName].address : ""}
            size="180"
            level="H"
            includeMargin
            renderAs="svg"
            imageSettings={{ excavate: false }}
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

      <div style={{ display: "flex", flexDirection: "row", textAlign: "center" }}>
        <span style={{ verticalAlign: "middle", paddingLeft: 5, fontSize: 36, width: "100%" }}>
          <Text>
            <a style={{ color: "#ddd" }} target={"_blank"} rel="noopener noreferrer">
              weight transfers
            </a>
          </Text>
        </span>
      </div>

      <div style={{ display: "flex", flexDirection: "row", textAlign: "justify" }}>
        <div style={{ display: "flex", flexDirection: "row", width: "100%" }}>
          <span style={{ verticalAlign: "middle", paddingLeft: 5, fontSize: 28, width: "100%" }}>
            <Text>
              <a style={{ color: "#ddd" }} target={"_blank"} rel="noopener noreferrer">
                from
              </a>
            </Text>
          </span>

          <span style={{ verticalAlign: "middle", paddingLeft: 5, fontSize: 28, width: "100%" }}>
            <Text>
              <a style={{ color: "#ddd" }} target={"_blank"} rel="noopener noreferrer">
                new weight
              </a>
            </Text>
          </span>
        </div>

        <div style={{ display: "flex", flexDirection: "row", width: "100%" }}>
          <span style={{ verticalAlign: "middle", paddingLeft: 5, fontSize: 28, width: "100%" }}>
            <Text>
              <a style={{ color: "#ddd" }} target={"_blank"} rel="noopener noreferrer">
                to
              </a>
            </Text>
          </span>

          <span style={{ verticalAlign: "middle", paddingLeft: 5, fontSize: 28, width: "100%" }}>
            <Text>
              <a style={{ color: "#ddd" }} target={"_blank"} rel="noopener noreferrer">
                new weight
              </a>
            </Text>
          </span>
        </div>
      </div>

      <List
        bordered
        dataSource={signerUpdateEvents}
        renderItem={item => {
          return (
            <div style={{ display: "flex", flexDirection: "row", maxWidth: "100%", width: "100%", flexBasis: "auto" }}>
              <div style={{ display: "flex", flexDirection: "row", width: "100%" }}>
                <Address address={item[0]} ensProvider={mainnetProvider} blockExplorer={blockExplorer} fontSize={28} />
                <span style={{ verticalAlign: "middle", paddingLeft: 5, fontSize: 28 }}>
                  <Text>
                    <a style={{ color: "#ddd" }} target={"_blank"} rel="noopener noreferrer">
                      {parseInt(item[1])}
                    </a>
                  </Text>
                </span>
              </div>

              <div style={{ display: "flex", flexDirection: "row", width: "100%" }}>
                <Address address={item[2]} ensProvider={mainnetProvider} blockExplorer={blockExplorer} fontSize={28} />

                <span style={{ verticalAlign: "middle", paddingLeft: 5, fontSize: 28 }}>
                  <Text>
                    <a style={{ color: "#ddd" }} target={"_blank"} rel="noopener noreferrer">
                      {parseInt(item[3])}
                    </a>
                  </Text>
                </span>
              </div>
            </div>
          );
        }}
      />
      {/* <List
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
      /> */}
    </div>
  );
}
