"use client";

import { Card, Row, Col, Statistic, Spin, Alert } from "antd";
import { useDashboardState, useDashboardActions } from "@/providers/dashboard-provider";
import { PipelineChart } from "@/components/dashboard/PipelineChart";
import { useDashboardPageStyles } from "./pageStyles";

function formatCurrency(value: number): string {
  return new Intl.NumberFormat("en-ZA", {
    style: "currency",
    currency: "ZAR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

export default function Home() {
  const { styles } = useDashboardPageStyles();
  const { overview, pipelineMetrics, isPending, isError, error } =
    useDashboardState();
  const { loadDashboard } = useDashboardActions();

  if (isPending) {
    return (
      <div className={styles.loadingWrapper}>
        <Spin size="large" />
      </div>
    );
  }

  if (isError && error) {
    return (
      <Alert
        message="Dashboard error"
        description={error}
        type="error"
        showIcon
        action={
          <button
            type="button"
            onClick={() => loadDashboard()}
            className={styles.retryButton}
          >
            Retry
          </button>
        }
      />
    );
  }

  if (!overview) {
    return null;
  }

  const { opportunities, activities, contracts, revenue } = overview;

  return (
    <div>
      <h1 className={styles.title}>Dashboard</h1>

      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} lg={6}>
          <Card title="Opportunities" className={styles.cardAccent}>
            <Statistic
              title="Total"
              value={opportunities.totalCount}
            />
            <Statistic
              title="Won"
              value={opportunities.wonCount}
              className={styles.statisticItem}
            />
            <Statistic
              title="Win rate (%)"
              value={opportunities.winRate}
              precision={2}
              className={styles.statisticItem}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card title="Activities" className={styles.cardAccent}>
            <Statistic title="Upcoming" value={activities.upcomingCount} />
            <Statistic
              title="Overdue"
              value={activities.overdueCount}
              className={styles.statisticItem}
            />
            <Statistic
              title="Completed today"
              value={activities.completedTodayCount}
              className={styles.statisticItem}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card title="Contracts" className={styles.cardAccent}>
            <Statistic
              title="Active"
              value={contracts.totalActiveCount}
            />
            <Statistic
              title="Expiring this month"
              value={contracts.expiringThisMonthCount}
              className={styles.statisticItem}
            />
            <Statistic
              title="Total contract value"
              value={formatCurrency(contracts.totalContractValue)}
              className={styles.statisticItem}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card title="Revenue" className={styles.cardAccent}>
            <Statistic
              title="This month"
              value={formatCurrency(revenue.thisMonth)}
            />
            <Statistic
              title="This quarter"
              value={formatCurrency(revenue.thisQuarter)}
              className={styles.statisticItem}
            />
            <Statistic
              title="This year"
              value={formatCurrency(revenue.thisYear)}
              className={styles.statisticItem}
            />
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]} className={styles.pipelineRow}>
        <Col xs={24}>
          <Card
            title="Pipeline chart"
            className={styles.pipelineCard}
          >
            <PipelineChart
              stages={pipelineMetrics?.stages ?? []}
              weightedValue={pipelineMetrics?.weightedPipelineValue}
            />
          </Card>
        </Col>
      </Row>
    </div>
  );
}
