"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { Table, Button, Space, Alert, Spin, Tag } from "antd";
import {
  PRICING_REQUEST_STATUS_LABELS,
  PRIORITY_LABELS,
  PricingRequestStatus,
  Priority,
} from "@/utils/pricing-requests-service";
import type { IPricingRequest } from "@/utils/pricing-requests-service";

export interface IPricingRequestsPaginationConfig {
  pageNumber: number;
  pageSize: number;
  totalCount: number;
  onChange: (page: number, pageSize?: number) => void;
}

export interface PricingRequestListProps {
  items: IPricingRequest[] | null;
  loading?: boolean;
  error?: string;
  onRetry?: () => void;
  pagination?: IPricingRequestsPaginationConfig;
  showCreateButton?: boolean;
  onCreateClick?: () => void;
}

export function PricingRequestList({
  items,
  loading = false,
  error,
  onRetry,
  pagination,
  showCreateButton = false,
  onCreateClick,
}: PricingRequestListProps) {
  const router = useRouter();

  const columns = [
    {
      title: "Title",
      dataIndex: "title",
      key: "title",
      render: (val: string, record: IPricingRequest) => (
        <a
          onClick={(e) => {
            e.stopPropagation();
            router.push(`/pricing-requests/${record.id}`);
          }}
        >
          {val || "—"}
        </a>
      ),
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (status: PricingRequestStatus | number) => {
        const label =
          PRICING_REQUEST_STATUS_LABELS[status as PricingRequestStatus] ??
          String(status);
        const color =
          status === PricingRequestStatus.Completed
            ? "green"
            : status === PricingRequestStatus.InProgress
              ? "blue"
              : "default";
        return <Tag color={color}>{label}</Tag>;
      },
    },
    {
      title: "Priority",
      dataIndex: "priority",
      key: "priority",
      render: (priority: Priority | number) =>
        PRIORITY_LABELS[priority as Priority] ?? String(priority),
    },
    {
      title: "Required by",
      dataIndex: "requiredByDate",
      key: "requiredByDate",
      render: (val: string) =>
        val ? new Date(val).toLocaleDateString() : "—",
    },
    {
      title: "Client",
      key: "client",
      render: (_: unknown, record: IPricingRequest) => (
        <Link
          href={`/clients/${record.clientId}`}
          onClick={(e) => e.stopPropagation()}
        >
          View client
        </Link>
      ),
    },
    {
      title: "Opportunity",
      key: "opportunity",
      render: (_: unknown, record: IPricingRequest) =>
        record.opportunityId ? (
          <Link
            href={`/clients/${record.clientId}/opportunities/${record.opportunityId}`}
            onClick={(e) => e.stopPropagation()}
          >
            View opportunity
          </Link>
        ) : (
          "—"
        ),
    },
    {
      title: "Assigned to",
      dataIndex: "assignedToId",
      key: "assignedToId",
      render: (val: string) => (val ? "Yes" : "—"),
    },
  ];

  const tablePagination = pagination
    ? {
        current: pagination.pageNumber,
        pageSize: pagination.pageSize,
        total: pagination.totalCount,
        showSizeChanger: true,
        showTotal: (total: number) => `Total ${total} requests`,
        onChange: (page: number, pageSize?: number) =>
          pagination.onChange(page, pageSize),
      }
    : false;

  if (loading && !items?.length) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          minHeight: "50vh",
          alignItems: "center",
        }}
      >
        <Spin size="large" />
      </div>
    );
  }

  return (
    <Space direction="vertical" size="middle" style={{ width: "100%" }}>
      {showCreateButton && onCreateClick && (
        <Button type="primary" onClick={onCreateClick}>
          Create pricing request
        </Button>
      )}
      {error && (
        <Alert
          message="Error"
          description={error}
          type="error"
          showIcon
          action={
            onRetry ? (
              <Button type="link" onClick={onRetry}>
                Retry
              </Button>
            ) : undefined
          }
        />
      )}
      <Table
        loading={loading}
        dataSource={items ?? []}
        rowKey="id"
        columns={columns}
        pagination={tablePagination}
        onRow={(record) => ({
          onClick: () => router.push(`/pricing-requests/${record.id}`),
          style: { cursor: "pointer" },
        })}
      />
    </Space>
  );
}
