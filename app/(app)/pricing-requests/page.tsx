"use client";

import { useEffect, useState } from "react";
import { Card, Tabs, Select, Space, Modal } from "antd";
import { usePricingRequestsState, usePricingRequestsActions } from "@/providers/pricing-requests-provider";
import { useAuthState } from "@/providers/auth-provider";
import {
  PRICING_REQUEST_STATUS_LABELS,
  PRIORITY_LABELS,
  PricingRequestStatus,
  Priority,
} from "@/utils/pricing-requests-service";
import type { IPricingRequest } from "@/utils/pricing-requests-service";
import {
  PricingRequestList,
  PricingRequestFormModal,
  AssignPricingRequestModal,
} from "@/components/pricing-requests";
import { useAppPageStyles } from "../pageStyles";

const ROLES_CAN_ASSIGN: string[] = ["Admin", "SalesManager"];

type TabKey = "all" | "pending" | "my";

function canSeePending(roles: string[] | undefined): boolean {
  if (!roles?.length) return false;
  return roles.some((r) => r === "Admin" || r === "SalesManager");
}

export default function PricingRequestsPage() {
  const { styles } = useAppPageStyles();
  const { session } = useAuthState();
  const {
    pricingRequests,
    pendingRequests,
    myRequests,
    pagination,
    filters,
    isPending,
    isError,
    error,
    actionPending,
  } = usePricingRequestsState();
  const {
    loadPricingRequests,
    loadPending,
    loadMyRequests,
    setFilters,
    setPagination,
    createPricingRequest,
    updatePricingRequest,
    assignPricingRequest,
    deletePricingRequest,
  } = usePricingRequestsActions();

  const [activeTab, setActiveTab] = useState<TabKey>("all");
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [editModalRequest, setEditModalRequest] = useState<IPricingRequest | null>(null);
  const [assignModalRequest, setAssignModalRequest] = useState<IPricingRequest | null>(null);
  const showPending = canSeePending(session?.user?.roles);
  const canAssign = (session?.user?.roles ?? []).some((r) => ROLES_CAN_ASSIGN.includes(r));

  useEffect(() => {
    if (activeTab === "all") {
      loadPricingRequests({
        ...filters,
        pageNumber: pagination.pageNumber,
        pageSize: pagination.pageSize,
      });
    }
  }, [
    activeTab,
    filters.status,
    filters.priority,
    pagination.pageNumber,
    pagination.pageSize,
    loadPricingRequests,
  ]);

  useEffect(() => {
    if (activeTab === "pending") {
      loadPending();
    }
  }, [activeTab, loadPending]);

  useEffect(() => {
    if (activeTab === "my") {
      loadMyRequests();
    }
  }, [activeTab, loadMyRequests]);

  const handleAssignSuccess = () => {
    setAssignModalRequest(null);
    if (activeTab === "all") loadPricingRequests({ ...filters, pageNumber: pagination.pageNumber, pageSize: pagination.pageSize });
    if (activeTab === "pending") loadPending();
    if (activeTab === "my") loadMyRequests();
  };

  const handleDelete = (record: IPricingRequest) => {
    Modal.confirm({
      title: "Delete pricing request",
      content: `Are you sure you want to delete "${record.title}"?`,
      okText: "Delete",
      okType: "danger",
      cancelText: "Cancel",
      onOk: async () => {
        await deletePricingRequest(record.id);
      },
    });
  };

  const tabItems = [
    {
      key: "all",
      label: "All",
      children: (
        <PricingRequestList
          items={pricingRequests}
          loading={isPending}
          error={isError ? error : undefined}
          onRetry={() => loadPricingRequests()}
          pagination={{
            pageNumber: pagination.pageNumber,
            pageSize: pagination.pageSize,
            totalCount: pagination.totalCount,
            onChange: (page, pageSize) =>
              setPagination(page, pageSize ?? pagination.pageSize),
          }}
          showCreateButton
          onCreateClick={() => setCreateModalOpen(true)}
          canAssign={canAssign}
          onAssign={(record) => setAssignModalRequest(record)}
          onEdit={(record) => setEditModalRequest(record)}
          onDelete={handleDelete}
        />
      ),
    },
    ...(showPending
      ? [
          {
            key: "pending",
            label: "Pending",
            children: (
              <PricingRequestList
                items={pendingRequests}
                loading={isPending}
                error={isError ? error : undefined}
                onRetry={() => loadPending()}
                canAssign={canAssign}
                onAssign={(record) => setAssignModalRequest(record)}
                onEdit={(record) => setEditModalRequest(record)}
                onDelete={handleDelete}
              />
            ),
          },
        ]
      : []),
    {
      key: "my",
      label: "My requests",
      children: (
        <PricingRequestList
          items={myRequests}
          loading={isPending}
          error={isError ? error : undefined}
          onRetry={() => loadMyRequests()}
          showCreateButton
          onCreateClick={() => setCreateModalOpen(true)}
          onEdit={(record) => setEditModalRequest(record)}
          onDelete={handleDelete}
        />
      ),
    },
  ];

  return (
    <div>
      <h1 className={styles.title}>Pricing Requests</h1>

      <Card>
        <Space direction="vertical" size="middle" style={{ width: "100%" }}>
          {activeTab === "all" && (
            <Space wrap>
              <Select
                placeholder="Status"
                allowClear
                value={filters.status}
                onChange={(value) => {
                  setFilters({ status: value });
                  setPagination(1);
                }}
                options={[
                  { value: undefined, label: "All statuses" },
                  {
                    value: PricingRequestStatus.Pending,
                    label: PRICING_REQUEST_STATUS_LABELS[PricingRequestStatus.Pending],
                  },
                  {
                    value: PricingRequestStatus.InProgress,
                    label:
                      PRICING_REQUEST_STATUS_LABELS[PricingRequestStatus.InProgress],
                  },
                  {
                    value: PricingRequestStatus.Completed,
                    label:
                      PRICING_REQUEST_STATUS_LABELS[PricingRequestStatus.Completed],
                  },
                ]}
                style={{ minWidth: 140 }}
              />
              <Select
                placeholder="Priority"
                allowClear
                value={filters.priority}
                onChange={(value) => {
                  setFilters({ priority: value });
                  setPagination(1);
                }}
                options={[
                  { value: undefined, label: "All priorities" },
                  { value: Priority.Low, label: PRIORITY_LABELS[Priority.Low] },
                  { value: Priority.Medium, label: PRIORITY_LABELS[Priority.Medium] },
                  { value: Priority.High, label: PRIORITY_LABELS[Priority.High] },
                  { value: Priority.Urgent, label: PRIORITY_LABELS[Priority.Urgent] },
                ]}
                style={{ minWidth: 140 }}
              />
            </Space>
          )}

          <Tabs
            activeKey={activeTab}
            onChange={(k) => setActiveTab(k as TabKey)}
            items={tabItems}
          />
        </Space>
      </Card>

      {createModalOpen && (
        <PricingRequestFormModal
          open={createModalOpen}
          onClose={() => setCreateModalOpen(false)}
          onSuccess={() => {
            setCreateModalOpen(false);
            if (activeTab === "all") loadPricingRequests();
            if (activeTab === "my") loadMyRequests();
          }}
          onSubmit={createPricingRequest}
          loading={actionPending}
        />
      )}

      {editModalRequest && (
        <PricingRequestFormModal
          open={Boolean(editModalRequest)}
          onClose={() => setEditModalRequest(null)}
          onSuccess={() => {
            setEditModalRequest(null);
            if (activeTab === "all") loadPricingRequests({ ...filters, pageNumber: pagination.pageNumber, pageSize: pagination.pageSize });
            if (activeTab === "pending") loadPending();
            if (activeTab === "my") loadMyRequests();
          }}
          onSubmit={createPricingRequest}
          request={editModalRequest}
          onUpdate={updatePricingRequest}
          loading={actionPending}
        />
      )}

      {assignModalRequest && (
        <AssignPricingRequestModal
          open={Boolean(assignModalRequest)}
          onClose={() => setAssignModalRequest(null)}
          onSuccess={handleAssignSuccess}
          pricingRequestId={assignModalRequest.id}
          onAssign={assignPricingRequest}
          loading={actionPending}
        />
      )}
    </div>
  );
}
