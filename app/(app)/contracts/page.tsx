"use client";

import { Card } from "antd";
import { useAppPageStyles } from "../pageStyles";

export default function ContractsPage() {
  const { styles } = useAppPageStyles();
  return (
    <div>
      <h1 className={styles.title}>Contracts</h1>
      <Card>
        <p className={styles.description}>
          Contracts content will be implemented here.
        </p>
      </Card>
    </div>
  );
}
