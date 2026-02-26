"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, Table, Button, Select, Space, Alert, Spin, Input, Tag } from "antd";
import { useClientsState, useClientsActions } from "@/providers/clients-provider";
import {
  CLIENT_TYPE_LABELS,
  ClientType,
} from "@/utils/clients-service";
import { useAppPageStyles } from "../pageStyles";

const CLIENT_TYPE_OPTIONS = [
  { value: undefined, label: "All types" },
  { value: ClientType.Government, label: CLIENT_TYPE_LABELS[ClientType.Government] },
  { value: ClientType.Private, label: CLIENT_TYPE_LABELS[ClientType.Private] },
  { value: ClientType.Partner, label: CLIENT_TYPE_LABELS[ClientType.Partner] },
];

const IS_ACTIVE_OPTIONS = [
  { value: undefined, label: "All" },
  { value: true, label: "Active" },
  { value: false, label: "Inactive" },
];

export default function ClientsPage() {
  const { styles } = useAppPageStyles();
  const router = useRouter();
  const {
    clients,
    pagination,
    filters,
    isPending,
    isError,
    error,
  } = useClientsState();
  const {
    loadClients,
    setFilters,
    setPagination,
  } = useClientsActions();

  useEffect(() => {
    loadClients({
      ...filters,
      pageNumber: pagination.pageNumber,
      pageSize: pagination.pageSize,
    });
  }, [filters.searchTerm, filters.industry, filters.clientType, filters.isActive, pagination.pageNumber, pagination.pageSize]);

  const columns = [
    {
      title: "Name",
      dataIndex: "name",
      key: "name",
      render: (val: string, record: { id: string }) => (
        <a onClick={(e) => { e.stopPropagation(); router.push(`/clients/${record.id}`); }}>{val || "—"}</a>
      ),
    },
    {
      title: "Industry",
      dataIndex: "industry",
      key: "industry",
      render: (val: string) => val || "—",
    },
    {
      title: "Type",
      dataIndex: "clientType",
      key: "clientType",
      render: (clientType: ClientType) => {
        const label = CLIENT_TYPE_LABELS[clientType as ClientType] ?? clientType;
        return <Tag>{label}</Tag>;
      },
    },
    {
      title: "Website",
      dataIndex: "website",
      key: "website",
      render: (val: string) => val || "—",
    },
    {
      title: "Status",
      dataIndex: "isActive",
      key: "isActive",
      render: (isActive: boolean) => (
        <Tag color={isActive !== false ? "green" : "default"}>
          {isActive !== false ? "Active" : "Inactive"}
        </Tag>
      ),
    },
  ];

  if (isPending && !clients?.length) {
    return (
      <div style={{ display: "flex", justifyContent: "center", minHeight: "50vh", alignItems: "center" }}>
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div>
      <h1 className={styles.title}>Clients</h1>

      {isError && error && (
        <Alert
          message="Error"
          description={error}
          type="error"
          showIcon
          action={
            <Button type="link" onClick={() => loadClients()}>
              Retry
            </Button>
          }
          style={{ marginBottom: 16 }}
        />
      )}

      <Card>
        <Space direction="vertical" size="middle" style={{ width: "100%" }}>
          <Space wrap>
            <Input
              placeholder="Search name, industry"
              allowClear
              value={filters.searchTerm ?? ""}
              onChange={(e) => setFilters({ searchTerm: e.target.value || undefined })}
              style={{ minWidth: 200 }}
            />
            <Input
              placeholder="Industry"
              allowClear
              value={filters.industry ?? ""}
              onChange={(e) => setFilters({ industry: e.target.value || undefined })}
              style={{ minWidth: 140 }}
            />
            <Select
              placeholder="Type"
              allowClear
              value={filters.clientType}
              onChange={(value) => setFilters({ clientType: value })}
              options={CLIENT_TYPE_OPTIONS}
              style={{ minWidth: 120 }}
            />
            <Select
              placeholder="Status"
              allowClear
              value={filters.isActive}
              onChange={(value) => setFilters({ isActive: value })}
              options={IS_ACTIVE_OPTIONS}
              style={{ minWidth: 100 }}
            />
            <Button type="primary" onClick={() => router.push("/clients/new")}>
              Add client
            </Button>
          </Space>

          <Table
            loading={isPending}
            dataSource={clients ?? []}
            rowKey="id"
            columns={columns}
            pagination={{
              current: pagination.pageNumber,
              pageSize: pagination.pageSize,
              total: pagination.totalCount,
              showSizeChanger: true,
              showTotal: (total) => `Total ${total} clients`,
              onChange: (page, pageSize) =>
                setPagination(page, pageSize ?? pagination.pageSize),
            }}
            onRow={(record) => ({
              onClick: () => router.push(`/clients/${record.id}`),
              style: { cursor: "pointer" },
            })}
          />
        </Space>
      </Card>
    </div>
  );
}
