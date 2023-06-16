import React from "react";
import { PageHeader } from "antd";

// displays a page header

export default function Header() {
  return (
    <a
      href="https://buidlguidl.com/builders/0x5F1442eF295BC2Ef0a65b7d49198a34B13c1E3aB"
      target="_blank"
      rel="noopener noreferrer"
    >
      <PageHeader title="🏗 scaffold-eth" subTitle="weighted-multisig-wallet" style={{ cursor: "pointer" }} />
    </a>
  );
}
