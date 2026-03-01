"use client";

import { Card } from "antd";
import { ContractList } from "@/components/contracts/ContractList";
import { useAppPageStyles } from "../pageStyles";

export default function ContractsPage() {
  const { styles } = useAppPageStyles();

  return (
    <div>
      <h1 className={styles.title}>Contracts</h1>
      <Card>
        <ContractList />
      </Card>
    </div>
  );
}
