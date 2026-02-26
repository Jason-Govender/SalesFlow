"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Card,
  Button,
  Space,
  Alert,
  Spin,
  Typography,
  Descriptions,
  Tag,
  Table,
  Dropdown,
  Modal,
} from "antd";
import type { MenuProps } from "antd";
import {
  ArrowLeftOutlined,
  EditOutlined,
  DeleteOutlined,
  SwapOutlined,
  UserAddOutlined,
  MoreOutlined,
} from "@ant-design/icons";
import { useAuthState } from "@/providers/auth-provider";
import { useOpportunitiesState, useOpportunitiesActions } from "@/providers/opportunities-provider";
import { useContactsState, useContactsActions } from "@/providers/contacts-provider";
import type { IOpportunity } from "@/utils/opportunities-service";
import {
  OPPORTUNITY_STAGE_LABELS,
  OPPORTUNITY_SOURCE_LABELS,
  OpportunityStage,
  OpportunitySource,
} from "@/utils/opportunities-service";
import type { OpportunityFormValues } from "./OpportunityFormModal";
import { OpportunityFormModal } from "./OpportunityFormModal";
import { StageChangeModal } from "./StageChangeModal";
import { AssignOpportunityModal } from "./AssignOpportunityModal";

const ROLES_CAN_ASSIGN_OR_DELETE_OPPORTUNITY: string[] = ["Admin", "SalesManager"];

function formatCurrency(value: number, currency = "ZAR"): string {
  return new Intl.NumberFormat("en-ZA", {
    style: "currency",
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

interface OpportunityDetailProps {
  clientId: string;
  clientName: string;
}

export function OpportunityDetail({ clientId, clientName }: OpportunityDetailProps) {
  const { session } = useAuthState();
  const userRoles = session?.user?.roles ?? [];
  const canAssignOrDelete = userRoles.some((r) =>
    ROLES_CAN_ASSIGN_OR_DELETE_OPPORTUNITY.includes(r)
  );

  const {
    selectedOpportunity,
    stageHistory,
    isPending,
    isError,
    error,
    actionPending,
  } = useOpportunitiesState();

  // #region agent log
  fetch("http://127.0.0.1:7550/ingest/2a3a292b-d656-4762-8562-b6e2ce0817a8", {
    method: "POST",
    headers: { "Content-Type": "application/json", "X-Debug-Session-Id": "8dbc10" },
    body: JSON.stringify({
      sessionId: "8dbc10",
      location: "OpportunityDetail.tsx:render",
      message: "OpportunityDetail render",
      data: {
        clientId,
        clientName,
        selectedOpportunityId: selectedOpportunity?.id ?? null,
        isPending,
        isError,
        errorSnippet: error?.slice(0, 80) ?? null,
        stageHistoryLength: stageHistory?.length ?? 0,
      },
      timestamp: Date.now(),
      hypothesisId: "H1_H5",
    }),
  }).catch(() => {});
  // #endregion
  const {
    updateOpportunity,
    setStage,
    assignOpportunity,
    deleteOpportunity,
    loadOpportunity,
    loadStageHistory,
  } = useOpportunitiesActions();

  const { contacts } = useContactsState();
  const { loadContactsByClient } = useContactsActions();

  const [editModalOpen, setEditModalOpen] = useState(false);
  const [stageModalOpen, setStageModalOpen] = useState(false);
  const [assignModalOpen, setAssignModalOpen] = useState(false);

  const handleEditSuccess = () => {
    // #region agent log
    fetch("http://127.0.0.1:7550/ingest/2a3a292b-d656-4762-8562-b6e2ce0817a8", {
      method: "POST",
      headers: { "Content-Type": "application/json", "X-Debug-Session-Id": "8dbc10" },
      body: JSON.stringify({
        sessionId: "8dbc10",
        location: "OpportunityDetail.tsx:handleEditSuccess",
        message: "Edit success handler",
        data: { selectedOpportunityId: selectedOpportunity?.id ?? null },
        timestamp: Date.now(),
        hypothesisId: "H4",
      }),
    }).catch(() => {});
    // #endregion
    setEditModalOpen(false);
    if (selectedOpportunity) {
      loadOpportunity(selectedOpportunity.id);
      loadStageHistory(selectedOpportunity.id);
    }
  };

  const handleUpdateSubmit = async (id: string, values: OpportunityFormValues) => {
    await updateOpportunity(id, {
      title: values.title,
      contactId: values.contactId,
      estimatedValue: values.estimatedValue,
      currency: values.currency,
      stage: values.stage,
      source: values.source,
      probability: values.probability,
      expectedCloseDate: values.expectedCloseDate,
      description: values.description,
    });
  };

  const handleStageSuccess = () => {
    setStageModalOpen(false);
    if (selectedOpportunity) {
      loadOpportunity(selectedOpportunity.id);
      loadStageHistory(selectedOpportunity.id);
    }
  };

  const handleAssignSuccess = () => {
    // #region agent log
    fetch("http://127.0.0.1:7550/ingest/2a3a292b-d656-4762-8562-b6e2ce0817a8", {
      method: "POST",
      headers: { "Content-Type": "application/json", "X-Debug-Session-Id": "8dbc10" },
      body: JSON.stringify({
        sessionId: "8dbc10",
        location: "OpportunityDetail.tsx:handleAssignSuccess",
        message: "Assign success handler",
        data: { selectedOpportunityId: selectedOpportunity?.id ?? null },
        timestamp: Date.now(),
        hypothesisId: "H4",
      }),
    }).catch(() => {});
    // #endregion
    setAssignModalOpen(false);
    if (selectedOpportunity) {
      loadOpportunity(selectedOpportunity.id);
    }
  };

  const handleDelete = () => {
    if (!selectedOpportunity) return;
    Modal.confirm({
      title: "Delete opportunity",
      content: `Are you sure you want to delete "${selectedOpportunity.title}"?`,
      okText: "Delete",
      okType: "danger",
      cancelText: "Cancel",
      onOk: async () => {
        await deleteOpportunity(selectedOpportunity.id);
        window.location.href = `/clients/${clientId}`;
      },
    });
  };

  if (isPending && !selectedOpportunity) {
    // #region agent log
    fetch("http://127.0.0.1:7550/ingest/2a3a292b-d656-4762-8562-b6e2ce0817a8", {
      method: "POST",
      headers: { "Content-Type": "application/json", "X-Debug-Session-Id": "8dbc10" },
      body: JSON.stringify({
        sessionId: "8dbc10",
        location: "OpportunityDetail.tsx:loading-branch",
        message: "Rendering loading spinner",
        data: { isPending, hasSelected: !!selectedOpportunity },
        timestamp: Date.now(),
        hypothesisId: "H1",
      }),
    }).catch(() => {});
    // #endregion
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          minHeight: 200,
          alignItems: "center",
        }}
      >
        <Spin size="large" />
      </div>
    );
  }

  if (isError && error) {
    return (
      <Space direction="vertical">
        <Link href={`/clients/${clientId}`}>
          <Button type="link" icon={<ArrowLeftOutlined />}>
            Back to {clientName}
          </Button>
        </Link>
        <Alert message="Error" description={error} type="error" showIcon />
      </Space>
    );
  }

  if (!selectedOpportunity) {
    // #region agent log
    fetch("http://127.0.0.1:7550/ingest/2a3a292b-d656-4762-8562-b6e2ce0817a8", {
      method: "POST",
      headers: { "Content-Type": "application/json", "X-Debug-Session-Id": "8dbc10" },
      body: JSON.stringify({
        sessionId: "8dbc10",
        location: "OpportunityDetail.tsx:not-found-branch",
        message: "Rendering opportunity not found",
        data: { isPending, isError, clientId },
        timestamp: Date.now(),
        hypothesisId: "H1_H3",
      }),
    }).catch(() => {});
    // #endregion
    return (
      <Space direction="vertical">
        <Link href={`/clients/${clientId}`}>
          <Button type="link" icon={<ArrowLeftOutlined />}>
            Back to {clientName}
          </Button>
        </Link>
        <Alert message="Opportunity not found" type="warning" showIcon />
      </Space>
    );
  }

  const opp = selectedOpportunity;
  const stageLabel = OPPORTUNITY_STAGE_LABELS[opp.stage as OpportunityStage] ?? opp.stage;
  const sourceLabel = opp.source != null
    ? (OPPORTUNITY_SOURCE_LABELS[opp.source as OpportunitySource] ?? opp.source)
    : null;

  const actionItems: MenuProps["items"] = [
    {
      key: "edit",
      icon: <EditOutlined />,
      label: "Edit",
      onClick: () => setEditModalOpen(true),
    },
    {
      key: "stage",
      icon: <SwapOutlined />,
      label: "Change stage",
      onClick: () => setStageModalOpen(true),
    },
    ...(canAssignOrDelete
      ? [
          {
            key: "assign",
            icon: <UserAddOutlined />,
            label: "Assign to sales rep",
            onClick: () => setAssignModalOpen(true),
          },
          {
            key: "delete",
            icon: <DeleteOutlined />,
            label: "Delete",
            danger: true,
            onClick: handleDelete,
          },
        ]
      : []),
  ];

  const stageHistoryColumns = [
    {
      title: "Stage",
      dataIndex: "stage",
      key: "stage",
      render: (stage: number) =>
        OPPORTUNITY_STAGE_LABELS[stage as OpportunityStage] ?? stage,
    },
    {
      title: "Changed at",
      dataIndex: "changedAt",
      key: "changedAt",
      render: (val: string) => (val ? new Date(val).toLocaleString() : "—"),
    },
    {
      title: "Reason",
      dataIndex: "reason",
      key: "reason",
      render: (val: string) => val || "—",
    },
  ];

  return (
    <Space direction="vertical" size="middle" style={{ width: "100%" }}>
      <Space wrap>
        <Link href={`/clients/${clientId}`}>
          <Button type="link" icon={<ArrowLeftOutlined />}>
            Back to {clientName}
          </Button>
        </Link>
        <Dropdown menu={{ items: actionItems }} trigger={["click"]}>
          <Button icon={<MoreOutlined />}>Actions</Button>
        </Dropdown>
      </Space>

      <Card>
        <Space direction="vertical" size="small" style={{ width: "100%" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 8 }}>
            <Typography.Title level={4} style={{ margin: 0 }}>
              {opp.title}
            </Typography.Title>
            <Tag color="blue">{stageLabel}</Tag>
          </div>
          <Descriptions column={1} size="small">
            {opp.estimatedValue != null && (
              <Descriptions.Item label="Estimated value">
                {formatCurrency(opp.estimatedValue, opp.currency)}
              </Descriptions.Item>
            )}
            {opp.expectedCloseDate && (
              <Descriptions.Item label="Expected close date">
                {opp.expectedCloseDate.split("T")[0]}
              </Descriptions.Item>
            )}
            {opp.probability != null && (
              <Descriptions.Item label="Probability">{opp.probability}%</Descriptions.Item>
            )}
            {sourceLabel && (
              <Descriptions.Item label="Source">{sourceLabel}</Descriptions.Item>
            )}
            {opp.description && (
              <Descriptions.Item label="Description">{opp.description}</Descriptions.Item>
            )}
          </Descriptions>
        </Space>
      </Card>

      {stageHistory && stageHistory.length > 0 && (
        <Card title="Stage history">
          <Table
            dataSource={stageHistory}
            rowKey={(r) => r.changedAt ?? r.opportunityId + String(r.stage)}
            columns={stageHistoryColumns}
            pagination={false}
            size="small"
          />
        </Card>
      )}

      <OpportunityFormModal
        onSubmit={async () => {}}
        open={editModalOpen}
        onClose={() => setEditModalOpen(false)}
        onSuccess={handleEditSuccess}
        clientId={clientId}
        opportunity={opp}
        contacts={contacts ?? []}
        onUpdate={handleUpdateSubmit}
        loading={actionPending}
        loadContacts={loadContactsByClient}
      />
      <StageChangeModal
        open={stageModalOpen}
        onClose={() => setStageModalOpen(false)}
        onSuccess={handleStageSuccess}
        opportunity={opp}
        onSetStage={setStage}
        loading={actionPending}
      />
      <AssignOpportunityModal
        open={assignModalOpen}
        onClose={() => setAssignModalOpen(false)}
        onSuccess={handleAssignSuccess}
        opportunity={opp}
        onAssign={assignOpportunity}
        loading={actionPending}
      />
    </Space>
  );
}
