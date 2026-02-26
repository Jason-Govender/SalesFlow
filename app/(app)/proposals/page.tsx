"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, Table, Button, Select, Space, Alert, Spin, Tag } from "antd";
import { useProposalsState, useProposalsActions } from "@/providers/proposals-provider";
import {
  PROPOSAL_STATUS_LABELS,
  ProposalStatus,
} from "@/utils/proposals-service";
import { useAppPageStyles } from "../pageStyles";

function formatCurrency(value: number, currency: string = "ZAR"): string {
  return new Intl.NumberFormat("en-ZA", {
    style: "currency",
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

const STATUS_OPTIONS = [
  { value: undefined, label: "All statuses" },
  { value: ProposalStatus.Draft, label: PROPOSAL_STATUS_LABELS[ProposalStatus.Draft] },
  { value: ProposalStatus.Submitted, label: PROPOSAL_STATUS_LABELS[ProposalStatus.Submitted] },
  { value: ProposalStatus.Rejected, label: PROPOSAL_STATUS_LABELS[ProposalStatus.Rejected] },
  { value: ProposalStatus.Approved, label: PROPOSAL_STATUS_LABELS[ProposalStatus.Approved] },
];

export default function ProposalsPage() {
  const { styles } = useAppPageStyles();
  const router = useRouter();
  const {
    proposals,
    pagination,
    filters,
    isPending,
    isError,
    error,
  } = useProposalsState();
  const {
    loadProposals,
    setFilters,
    setPagination,
  } = useProposalsActions();

  useEffect(() => {
    loadProposals({
      ...filters,
      pageNumber: pagination.pageNumber,
      pageSize: pagination.pageSize,
    });
  }, [filters.clientId, filters.opportunityId, filters.status, pagination.pageNumber, pagination.pageSize]);

  const columns = [
    {
      title: "Title",
      dataIndex: "title",
      key: "title",
      render: (val: string, record: { id: string }) => (
        <a onClick={() => router.push(`/proposals/${record.id}`)}>{val || "—"}</a>
      ),
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (status: ProposalStatus) => {
        const label = PROPOSAL_STATUS_LABELS[status as ProposalStatus] ?? status;
        const color =
          status === ProposalStatus.Approved
            ? "green"
            : status === ProposalStatus.Rejected
              ? "red"
              : status === ProposalStatus.Submitted
                ? "blue"
                : "default";
        return <Tag color={color}>{label}</Tag>;
      },
    },
    {
      title: "Currency",
      dataIndex: "currency",
      key: "currency",
      render: (val: string) => val || "—",
    },
    {
      title: "Total",
      dataIndex: "total",
      key: "total",
      render: (val: number, record: { currency?: string }) =>
        val != null
          ? formatCurrency(val, record.currency)
          : "—",
    },
    {
      title: "Valid until",
      dataIndex: "validUntil",
      key: "validUntil",
      render: (val: string) =>
        val ? new Date(val).toLocaleDateString() : "—",
    },
  ];

  if (isPending && !proposals?.length) {
    return (
      <div style={{ display: "flex", justifyContent: "center", minHeight: "50vh", alignItems: "center" }}>
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div>
      <h1 className={styles.title}>Proposals & Pricing</h1>

      {isError && error && (
        <Alert
          message="Error"
          description={error}
          type="error"
          showIcon
          action={
            <Button type="link" onClick={() => loadProposals()}>
              Retry
            </Button>
          }
          style={{ marginBottom: 16 }}
        />
      )}

      <Card>
        <Space direction="vertical" size="middle" style={{ width: "100%" }}>
          <Space wrap>
            <Select
              placeholder="Status"
              allowClear
              value={filters.status}
              onChange={(value) => setFilters({ status: value })}
              options={STATUS_OPTIONS}
              style={{ minWidth: 140 }}
            />
            <Button type="primary" onClick={() => router.push("/proposals/new")}>
              Create proposal
            </Button>
          </Space>

          <Table
            loading={isPending}
            dataSource={proposals ?? []}
            rowKey="id"
            columns={columns}
            pagination={{
              current: pagination.pageNumber,
              pageSize: pagination.pageSize,
              total: pagination.totalCount,
              showSizeChanger: true,
              showTotal: (total) => `Total ${total} proposals`,
              onChange: (page, pageSize) =>
                setPagination(page, pageSize ?? pagination.pageSize),
            }}
            onRow={(record) => ({
              onClick: () => router.push(`/proposals/${record.id}`),
              style: { cursor: "pointer" },
            })}
          />
        </Space>
      </Card>
    </div>
  );
}
