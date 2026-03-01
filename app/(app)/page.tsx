"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Card,
  Row,
  Col,
  Statistic,
  Spin,
  Alert,
  Table,
  Select,
  Button,
  DatePicker,
} from "antd";
import { useDashboardState, useDashboardActions } from "@/providers/dashboard-provider";
import { useAuthState } from "@/providers/auth-provider";
import { PipelineChart } from "@/components/dashboard/PipelineChart";
import { SalesByPeriodChart } from "@/components/dashboard/SalesByPeriodChart";
import { reportsService } from "@/utils/reports-service";
import type {
  IOpportunitiesReportParams,
  IOpportunityReportItem,
  ISalesByPeriodParams,
  ISalesByPeriodItem,
} from "@/utils/reports-service";
import dayjs from "dayjs";
import { useDashboardPageStyles } from "./pageStyles";

const ROLES_CAN_VIEW_SALES_AND_CONTRACTS = ["Admin", "SalesManager"];
const { RangePicker } = DatePicker;

function formatCurrency(value: number): string {
  return new Intl.NumberFormat("en-ZA", {
    style: "currency",
    currency: "ZAR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

function toISODate(d: Date): string {
  return d.toISOString().split("T")[0];
}

export default function Home() {
  const { styles } = useDashboardPageStyles();
  const { overview, pipelineMetrics, salesPerformance, contractsExpiring, isPending, isError, error } =
    useDashboardState();
  const { loadDashboard } = useDashboardActions();
  const { session } = useAuthState();
  const canViewRestricted =
    session?.user?.roles?.some((r) =>
      ROLES_CAN_VIEW_SALES_AND_CONTRACTS.includes(r)
    ) ?? false;

  const [opportunitiesParams, setOpportunitiesParams] =
    useState<IOpportunitiesReportParams>(() => {
      const end = new Date();
      const start = new Date();
      start.setDate(start.getDate() - 30);
      return {
        startDate: toISODate(start),
        endDate: toISODate(end),
        pageNumber: 1,
        pageSize: 10,
      };
    });
  const [opportunitiesData, setOpportunitiesData] = useState<{
    items: IOpportunityReportItem[];
    totalCount: number;
  }>({ items: [], totalCount: 0 });
  const [opportunitiesLoading, setOpportunitiesLoading] = useState(false);
  const [opportunitiesError, setOpportunitiesError] = useState<string | null>(null);

  const [salesByPeriodParams, setSalesByPeriodParams] =
    useState<ISalesByPeriodParams>(() => {
      const end = new Date();
      const start = new Date();
      start.setMonth(start.getMonth() - 11);
      return {
        startDate: toISODate(start),
        endDate: toISODate(end),
        groupBy: "month",
      };
    });
  const [salesByPeriodData, setSalesByPeriodData] = useState<ISalesByPeriodItem[]>([]);
  const [salesByPeriodLoading, setSalesByPeriodLoading] = useState(false);
  const [salesByPeriodError, setSalesByPeriodError] = useState<string | null>(null);

  const fetchOpportunitiesReport = useCallback(async () => {
    setOpportunitiesLoading(true);
    setOpportunitiesError(null);
    try {
      const res = await reportsService.getOpportunitiesReport(opportunitiesParams);
      setOpportunitiesData({ items: res.items, totalCount: res.totalCount ?? 0 });
    } catch (e) {
      setOpportunitiesError(e instanceof Error ? e.message : "Failed to load report.");
    } finally {
      setOpportunitiesLoading(false);
    }
  }, [opportunitiesParams]);

  const fetchSalesByPeriod = useCallback(async () => {
    setSalesByPeriodLoading(true);
    setSalesByPeriodError(null);
    try {
      const res = await reportsService.getSalesByPeriod(salesByPeriodParams);
      setSalesByPeriodData(res ?? []);
    } catch (e) {
      setSalesByPeriodError(e instanceof Error ? e.message : "Failed to load report.");
    } finally {
      setSalesByPeriodLoading(false);
    }
  }, [salesByPeriodParams]);

  useEffect(() => {
    fetchOpportunitiesReport();
  }, [fetchOpportunitiesReport]);

  useEffect(() => {
    fetchSalesByPeriod();
  }, [fetchSalesByPeriod]);

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

      {canViewRestricted && (
        <Row gutter={[16, 16]} className={styles.pipelineRow}>
          <Col xs={24} lg={12}>
            <Card title="Top sales performance" className={styles.pipelineCard}>
              {salesPerformance == null ? (
                <Spin />
              ) : salesPerformance.length === 0 ? (
                <span>No data</span>
              ) : (
                <Table
                  dataSource={salesPerformance.map((r, i) => ({ ...r, key: r.userId ?? i }))}
                  columns={[
                    { title: "Name", dataIndex: "name", key: "name", render: (v: string) => v ?? "—" },
                    {
                      title: "Value",
                      dataIndex: "totalValue",
                      key: "totalValue",
                      render: (v: number) => (v != null ? formatCurrency(v) : "—"),
                    },
                    {
                      title: "Opportunities",
                      dataIndex: "opportunityCount",
                      key: "opportunityCount",
                      render: (v: number) => (v != null ? v : "—"),
                    },
                  ]}
                  pagination={false}
                  size="small"
                />
              )}
            </Card>
          </Col>
          <Col xs={24} lg={12}>
            <Card title="Contracts expiring" className={styles.pipelineCard}>
              {contractsExpiring == null ? (
                <Spin />
              ) : contractsExpiring.length === 0 ? (
                <span>No contracts expiring in the next 30 days</span>
              ) : (
                <Table
                  dataSource={contractsExpiring.map((c, i) => ({ ...c, key: c.id ?? i }))}
                  columns={[
                    { title: "Client", dataIndex: "clientName", key: "clientName", render: (v: string) => v ?? "—" },
                    { title: "End date", dataIndex: "endDate", key: "endDate", render: (v: string) => v ?? "—" },
                    {
                      title: "Value",
                      dataIndex: "contractValue",
                      key: "contractValue",
                      render: (v: number) => (v != null ? formatCurrency(v) : "—"),
                    },
                  ]}
                  pagination={false}
                  size="small"
                />
              )}
            </Card>
          </Col>
        </Row>
      )}

      <Row gutter={[16, 16]} className={styles.pipelineRow}>
        <Col xs={24}>
          <Card title="Opportunities report" className={styles.pipelineCard}>
            <div style={{ marginBottom: 16, display: "flex", flexWrap: "wrap", gap: 8, alignItems: "center" }}>
              <RangePicker
                value={[
                  opportunitiesParams.startDate ? dayjs(opportunitiesParams.startDate) : null,
                  opportunitiesParams.endDate ? dayjs(opportunitiesParams.endDate) : null,
                ] as [dayjs.Dayjs | null, dayjs.Dayjs | null]}
                onChange={(dates) => {
                  const start = dates?.[0];
                  const end = dates?.[1];
                  if (start && end) {
                    setOpportunitiesParams((p) => ({
                      ...p,
                      startDate: start.format("YYYY-MM-DD"),
                      endDate: end.format("YYYY-MM-DD"),
                    }));
                  }
                }}
              />
              <Select
                placeholder="Stage"
                style={{ width: 120 }}
                allowClear
                value={opportunitiesParams.stage ?? undefined}
                onChange={(v) =>
                  setOpportunitiesParams((p) => ({ ...p, stage: v ?? undefined }))
                }
              >
                <Select.Option value={1}>Lead</Select.Option>
                <Select.Option value={2}>Qualified</Select.Option>
                <Select.Option value={3}>Proposal</Select.Option>
                <Select.Option value={4}>Negotiation</Select.Option>
                <Select.Option value={5}>Closed Won</Select.Option>
                <Select.Option value={6}>Closed Lost</Select.Option>
              </Select>
              <Button type="primary" onClick={fetchOpportunitiesReport} loading={opportunitiesLoading}>
                Apply
              </Button>
            </div>
            {opportunitiesError && (
              <Alert type="error" message={opportunitiesError} style={{ marginBottom: 8 }} />
            )}
            {opportunitiesLoading && !opportunitiesData.items.length ? (
              <Spin />
            ) : opportunitiesData.items.length === 0 ? (
              <span>No opportunities for the selected filters</span>
            ) : (
              <Table
                dataSource={opportunitiesData.items.map((o, i) => ({ ...o, key: o.id ?? i }))}
                columns={[
                  { title: "Title", dataIndex: "title", key: "title", render: (v: string) => v ?? "—" },
                  { title: "Client", dataIndex: "clientName", key: "clientName", render: (v: string) => v ?? "—" },
                  { title: "Stage", dataIndex: "stageName", key: "stageName", render: (v: string) => v ?? "—" },
                  {
                    title: "Value",
                    dataIndex: "estimatedValue",
                    key: "estimatedValue",
                    render: (v: number) => (v != null ? formatCurrency(v) : "—"),
                  },
                  { title: "Close date", dataIndex: "expectedCloseDate", key: "expectedCloseDate", render: (v: string) => v ?? "—" },
                ]}
                pagination={{
                  current: opportunitiesParams.pageNumber,
                  pageSize: opportunitiesParams.pageSize,
                  total: opportunitiesData.totalCount,
                  showSizeChanger: true,
                  onChange: (page, size) =>
                    setOpportunitiesParams((p) => ({
                      ...p,
                      pageNumber: page,
                      pageSize: size ?? p.pageSize,
                    })),
                }}
                size="small"
              />
            )}
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]} className={styles.pipelineRow}>
        <Col xs={24}>
          <Card title="Sales by period" className={styles.pipelineCard}>
            <div style={{ marginBottom: 16, display: "flex", flexWrap: "wrap", gap: 8, alignItems: "center" }}>
              <RangePicker
                value={[
                  salesByPeriodParams.startDate ? dayjs(salesByPeriodParams.startDate) : null,
                  salesByPeriodParams.endDate ? dayjs(salesByPeriodParams.endDate) : null,
                ] as [dayjs.Dayjs | null, dayjs.Dayjs | null]}
                onChange={(dates) => {
                  const start = dates?.[0];
                  const end = dates?.[1];
                  if (start && end) {
                    setSalesByPeriodParams((p) => ({
                      ...p,
                      startDate: start.format("YYYY-MM-DD"),
                      endDate: end.format("YYYY-MM-DD"),
                    }));
                  }
                }}
              />
              <Select
                style={{ width: 120 }}
                value={salesByPeriodParams.groupBy}
                onChange={(v) =>
                  setSalesByPeriodParams((p) => ({ ...p, groupBy: v as "month" | "week" }))
                }
              >
                <Select.Option value="month">By month</Select.Option>
                <Select.Option value="week">By week</Select.Option>
              </Select>
              <Button type="primary" onClick={fetchSalesByPeriod} loading={salesByPeriodLoading}>
                Apply
              </Button>
            </div>
            {salesByPeriodError && (
              <Alert type="error" message={salesByPeriodError} style={{ marginBottom: 8 }} />
            )}
            {salesByPeriodLoading && !salesByPeriodData.length ? (
              <Spin />
            ) : (
              <SalesByPeriodChart data={salesByPeriodData} />
            )}
          </Card>
        </Col>
      </Row>
    </div>
  );
}
