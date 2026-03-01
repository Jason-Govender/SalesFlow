"use client";

import { Card } from "antd";
import { OpportunityList } from "@/components/opportunities/OpportunityList";
import { useAppPageStyles } from "../pageStyles";

export default function OpportunitiesPage() {
  const { styles } = useAppPageStyles();

  return (
    <div>
      <h1 className={styles.title}>Opportunities</h1>
      <Card>
        <OpportunityList />
      </Card>
    </div>
  );
}
