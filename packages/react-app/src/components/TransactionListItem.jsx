import React, { useState } from "react";
import { Button, List } from "antd";

import { Address, Balance, Blockie, TransactionDetailsModal } from "../components";
import { EllipsisOutlined } from "@ant-design/icons";
import { parseEther, formatEther } from "@ethersproject/units";
import { Typography, Skeleton } from "antd";
const { Text } = Typography;

const TransactionListItem = function ({
  item,
  mainnetProvider,
  blockExplorer,
  price,
  readContracts,
  walletContractName,
  children,
}) {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [txnInfo, setTxnInfo] = useState(null);

  const showModal = () => {
    setIsModalVisible(true);
  };

  const handleOk = () => {
    setIsModalVisible(false);
  };

  const buildTxnTransferData = transaction => {
    return {
      functionFragment: {
        inputs: [],
        name: "Transfer",
      },
      signature: "",
      args: [transaction.to],
      sighash: item.data,
    };
  };

  console.log("🔥🔥🔥🔥", item);
  let txnData;
  try {
    txnData =
      item.data === "" || item.data === "0x" || item.data === "0x00"
        ? buildTxnTransferData(item)
        : readContracts[walletContractName].interface.parseTransaction(item);
  } catch (error) {
    console.log("ERROR", error);
  }

  return (
    <>
      <TransactionDetailsModal
        visible={isModalVisible}
        txnInfo={txnData}
        handleOk={handleOk}
        mainnetProvider={mainnetProvider}
        price={price}
      />
      {txnData && (
        <List.Item key={item.hash} style={{ position: "relative" }}>
          <div
            style={{
              position: "absolute",
              top: 55,
              fontSize: 12,
              opacity: 0.5,
              display: "flex",
              flexDirection: "row",
              width: "90%",
              justifyContent: "space-between",
            }}
          >
            <p>{item.hash}&nbsp;</p>
          </div>
          {<b style={{ padding: 16 }}>#{typeof item.nonce === "number" ? item.nonce : item.nonce.toNumber()}</b>}
          <Address address={item.to} ensProvider={mainnetProvider} blockExplorer={blockExplorer} fontSize={16} />
          <Balance
            balance={item.value ? item.value : parseEther("" + parseFloat(item.amount).toFixed(12))}
            dollarMultiplier={price}
          />
          <>{children}</>
          <Button onClick={showModal}>
            <EllipsisOutlined />
          </Button>
        </List.Item>
      )}
    </>
  );
};
export default TransactionListItem;
