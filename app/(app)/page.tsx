"use client";

import { Card, Row, Col, Statistic, Spin, Alert, Table } from "antd";
import { useDashboardState, useDashboardActions } from "@/providers/dashboard-provider";
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
  const { overview, isPending, isError, error } = useDashboardState();
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

  const { opportunities, pipeline, activities, contracts, revenue } = overview;

  const pipelineColumns = [
    {
      title: "Stage",
      dataIndex: "stageName",
      key: "stageName",
      render: (val: string) => val ?? "—",
    },
    {
      title: "Count",
      dataIndex: "count",
      key: "count",
      render: (val: number) => (val != null ? val : "—"),
    },
    {
      title: "Value",
      dataIndex: "value",
      key: "value",
      render: (val: number) =>
        val != null ? formatCurrency(val) : "—",
    },
  ];

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
            <Statistic
              title="Pipeline value"
              value={formatCurrency(opportunities.pipelineValue)}
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
        <Col xs={24} lg={12}>
          <Card
            title={`Pipeline (weighted value: ${formatCurrency(pipeline.weightedPipelineValue)})`}
            className={styles.pipelineCard}
          >
            {pipeline.stages?.length > 0 ? (
              <Table
                dataSource={pipeline.stages.map((s, i) => ({
                  ...s,
                  key: s.stageId ?? i,
                }))}
                columns={pipelineColumns}
                pagination={false}
                size="small"
              />
            ) : (
              <span>No pipeline stages</span>
            )}
          </Card>
        </Col>
      </Row>
    </div>
  );
}
