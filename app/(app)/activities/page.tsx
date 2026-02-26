"use client";

import { Card } from "antd";
import { useAppPageStyles } from "../pageStyles";

export default function ActivitiesPage() {
  const { styles } = useAppPageStyles();
  return (
    <div>
      <h1 className={styles.title}>Activities</h1>
      <Card>
        <p className={styles.description}>
          Activities content will be implemented here.
        </p>
      </Card>
    </div>
  );
}
