"use client";

import { useEffect, useState } from "react";
import { Card, Tabs, Select, Space } from "antd";
import { usePricingRequestsState, usePricingRequestsActions } from "@/providers/pricing-requests-provider";
import { useAuthState } from "@/providers/auth-provider";
import {
  PRICING_REQUEST_STATUS_LABELS,
  PRIORITY_LABELS,
  PricingRequestStatus,
  Priority,
} from "@/utils/pricing-requests-service";
import {
  PricingRequestList,
  PricingRequestFormModal,
} from "@/components/pricing-requests";
import { useAppPageStyles } from "../pageStyles";

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
  } = usePricingRequestsActions();

  const [activeTab, setActiveTab] = useState<TabKey>("all");
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const showPending = canSeePending(session?.user?.roles);

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
    </div>
  );
}
