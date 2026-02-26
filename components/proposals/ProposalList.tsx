"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Table, Button, Space, Alert, Spin, Tag } from "antd";
import { useProposalsState, useProposalsActions } from "@/providers/proposals-provider";
import {
  PROPOSAL_STATUS_LABELS,
  ProposalStatus,
} from "@/utils/proposals-service";
import type { IProposal } from "@/utils/proposals-service";

function formatCurrency(value: number, currency: string = "ZAR"): string {
  return new Intl.NumberFormat("en-ZA", {
    style: "currency",
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

export interface ProposalListProps {
  /** When set, list is scoped to this client (loadProposals called with clientId, no setFilters). */
  clientId?: string;
  /** When set, list is scoped to this opportunity (loadProposals called with opportunityId, no setFilters). */
  opportunityId?: string;
  /** Show a "Create proposal" button that links to this href. */
  showCreateButton?: boolean;
  createHref?: string;
}

export function ProposalList({
  clientId,
  opportunityId,
  showCreateButton = false,
  createHref = "/proposals/new",
}: ProposalListProps) {
  const router = useRouter();
  const {
    proposals,
    pagination,
    isPending,
    isError,
    error,
  } = useProposalsState();
  const { loadProposals, setPagination } = useProposalsActions();

  const isScoped = Boolean(clientId || opportunityId);
  const [scopedPagination, setScopedPagination] = useState({
    pageNumber: 1,
    pageSize: 10,
  });

  useEffect(() => {
    if (!isScoped) return;
    loadProposals({
      clientId,
      opportunityId,
      pageNumber: scopedPagination.pageNumber,
      pageSize: scopedPagination.pageSize,
    });
  }, [isScoped, clientId, opportunityId, scopedPagination.pageNumber, scopedPagination.pageSize, loadProposals]);

  const columns = [
    {
      title: "Title",
      dataIndex: "title",
      key: "title",
      render: (val: string, record: IProposal) => (
        <a
          onClick={(e) => {
            e.stopPropagation();
            router.push(`/proposals/${record.id}`);
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
      render: (val: number, record: IProposal) =>
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
    {
      title: "Client",
      key: "client",
      render: (_: unknown, record: IProposal) => (
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
      render: (_: unknown, record: IProposal) => (
        <Link
          href={`/clients/${record.clientId}/opportunities/${record.opportunityId}`}
          onClick={(e) => e.stopPropagation()}
        >
          View opportunity
        </Link>
      ),
    },
  ];

  const currentPagination = isScoped
    ? {
        current: scopedPagination.pageNumber,
        pageSize: scopedPagination.pageSize,
        total: pagination.totalCount,
        showSizeChanger: true,
        showTotal: (total: number) => `Total ${total} proposals`,
        onChange: (page: number, pageSize?: number) => {
          setScopedPagination((prev) => ({
            pageNumber: page,
            pageSize: pageSize ?? prev.pageSize,
          }));
        },
      }
    : {
        current: pagination.pageNumber,
        pageSize: pagination.pageSize,
        total: pagination.totalCount,
        showSizeChanger: true,
        showTotal: (total: number) => `Total ${total} proposals`,
        onChange: (page: number, pageSize?: number) =>
          setPagination(page, pageSize ?? pagination.pageSize),
      };

  if (isPending && !proposals?.length) {
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
      {showCreateButton && (
        <Button type="primary" onClick={() => router.push(createHref)}>
          Create proposal
        </Button>
      )}
      {isError && error && (
        <Alert
          message="Error"
          description={error}
          type="error"
          showIcon
          action={
            <Button
              type="link"
              onClick={() =>
                isScoped
                  ? loadProposals({
                      clientId,
                      opportunityId,
                      pageNumber: scopedPagination.pageNumber,
                      pageSize: scopedPagination.pageSize,
                    })
                  : loadProposals()
              }
            >
              Retry
            </Button>
          }
        />
      )}
      <Table
        loading={isPending}
        dataSource={proposals ?? []}
        rowKey="id"
        columns={columns}
        pagination={currentPagination}
        onRow={(record) => ({
          onClick: () => router.push(`/proposals/${record.id}`),
          style: { cursor: "pointer" },
        })}
      />
    </Space>
  );
}
