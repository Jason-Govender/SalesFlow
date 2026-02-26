"use client";

import { Card } from "antd";
import { useAppPageStyles } from "../pageStyles";

export default function ProposalsPage() {
  const { styles } = useAppPageStyles();
  return (
    <div>
      <h1 className={styles.title}>Proposals & Pricing</h1>
      <Card>
        <p className={styles.description}>
          Proposals & pricing content will be implemented here.
        </p>
      </Card>
    </div>
  );
}
