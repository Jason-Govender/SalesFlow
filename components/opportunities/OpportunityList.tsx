"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Table,
  Button,
  Space,
  Alert,
  Spin,
  Tag,
  Dropdown,
  Modal,
  Select,
} from "antd";
import type { MenuProps } from "antd";
import {
  PlusOutlined,
  MoreOutlined,
  EditOutlined,
  DeleteOutlined,
  SwapOutlined,
  UserAddOutlined,
  EyeOutlined,
} from "@ant-design/icons";
import { useAuthState } from "@/providers/auth-provider";
import { useOpportunitiesState, useOpportunitiesActions } from "@/providers/opportunities-provider";
import { useContactsState, useContactsActions } from "@/providers/contacts-provider";
import { useClientsState, useClientsActions } from "@/providers/clients-provider";
import type { IOpportunity } from "@/utils/opportunities-service";
import {
  OPPORTUNITY_STAGE_LABELS,
  OpportunityStage,
} from "@/utils/opportunities-service";
import type { OpportunityFormValues } from "./OpportunityFormModal";
import { OpportunityFormModal } from "./OpportunityFormModal";
import { StageChangeModal } from "./StageChangeModal";
import { AssignOpportunityModal } from "./AssignOpportunityModal";

const ROLES_CAN_ASSIGN_OR_DELETE_OPPORTUNITY: string[] = ["Admin", "SalesManager"];

function formatCurrency(value: number, currency = "ZAR"): string {
  // #region agent log
  fetch("http://127.0.0.1:7550/ingest/2a3a292b-d656-4762-8562-b6e2ce0817a8", {
    method: "POST",
    headers: { "Content-Type": "application/json", "X-Debug-Session-Id": "ae026c" },
    body: JSON.stringify({
      sessionId: "ae026c",
      location: "OpportunityList.tsx:formatCurrency",
      message: "formatCurrency called",
      data: { currency, value, hypothesisId: "H3" },
      timestamp: Date.now(),
    }),
  }).catch(() => {});
  // #endregion
  const isoCurrency = currency === "R" ? "ZAR" : currency;
  return new Intl.NumberFormat("en-ZA", {
    style: "currency",
    currency: isoCurrency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

interface OpportunityListProps {
  /** When set, list is scoped to this client. When undefined, lists all opportunities with a Client column. */
  clientId?: string;
}

export function OpportunityList({ clientId }: OpportunityListProps) {
  const router = useRouter();
  const { session } = useAuthState();
  const userRoles = session?.user?.roles ?? [];
  const canAssignOrDelete = userRoles.some((r) =>
    ROLES_CAN_ASSIGN_OR_DELETE_OPPORTUNITY.includes(r)
  );

  const {
    opportunities,
    isPending,
    isError,
    error,
    actionPending,
    pageNumber,
    pageSize,
    totalCount,
  } = useOpportunitiesState();
  const {
    loadOpportunitiesByClient,
    loadOpportunities,
    clearOpportunities,
    createOpportunity,
    updateOpportunity,
    setStage,
    assignOpportunity,
    deleteOpportunity,
  } = useOpportunitiesActions();

  const { contacts } = useContactsState();
  const { loadContactsByClient } = useContactsActions();
  const { clients } = useClientsState();
  const { loadClients } = useClientsActions();

  const clientIdToName = (clients ?? []).reduce<Record<string, string>>(
    (acc, c) => {
      acc[c.id] = c.name;
      return acc;
    },
    {}
  );

  const [formModalOpen, setFormModalOpen] = useState(false);
  const [editingOpportunity, setEditingOpportunity] = useState<IOpportunity | null>(null);
  const [stageModalOpen, setStageModalOpen] = useState(false);
  const [stageModalOpportunity, setStageModalOpportunity] = useState<IOpportunity | null>(null);
  const [assignModalOpen, setAssignModalOpen] = useState(false);
  const [assignModalOpportunity, setAssignModalOpportunity] = useState<IOpportunity | null>(null);
  const [stageFilter, setStageFilter] = useState<number | undefined>(undefined);

  useEffect(() => {
    if (clientId != null) {
      loadOpportunitiesByClient(clientId, {
        pageNumber: 1,
        pageSize: 10,
        stage: stageFilter,
      });
    } else {
      loadOpportunities({
        pageNumber: 1,
        pageSize: 10,
        stage: stageFilter,
      });
    }
    return () => {
      clearOpportunities();
    };
  }, [clientId, stageFilter, loadOpportunitiesByClient, loadOpportunities, clearOpportunities]);

  useEffect(() => {
    if (clientId == null && !clients?.length) {
      loadClients({ pageSize: 500 });
    }
  }, [clientId, clients?.length, loadClients]);

  const handlePageChange = (page: number, newPageSize?: number) => {
    if (clientId != null) {
      loadOpportunitiesByClient(clientId, {
        pageNumber: page,
        pageSize: newPageSize ?? pageSize,
        stage: stageFilter,
      });
    } else {
      loadOpportunities({
        pageNumber: page,
        pageSize: newPageSize ?? pageSize,
        stage: stageFilter,
      });
    }
  };

  const handleAdd = () => {
    setEditingOpportunity(null);
    setFormModalOpen(true);
  };

  const handleEdit = (record: IOpportunity) => {
    setEditingOpportunity(record);
    setFormModalOpen(true);
  };

  const handleFormSuccess = () => {
    setFormModalOpen(false);
    setEditingOpportunity(null);
    if (clientId != null) {
      loadOpportunitiesByClient(clientId, { pageNumber, pageSize, stage: stageFilter });
    } else {
      loadOpportunities({ pageNumber, pageSize, stage: stageFilter });
    }
  };

  const handleCreateSubmit = async (values: OpportunityFormValues) => {
    if (clientId == null) return;
    await createOpportunity({
      ...values,
      clientId,
    });
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

  const openStageModal = (record: IOpportunity) => {
    setStageModalOpportunity(record);
    setStageModalOpen(true);
  };

  const openAssignModal = (record: IOpportunity) => {
    setAssignModalOpportunity(record);
    setAssignModalOpen(true);
  };

  const handleAssignSuccess = () => {
    setAssignModalOpen(false);
    setAssignModalOpportunity(null);
    if (clientId != null) {
      loadOpportunitiesByClient(clientId, { pageNumber, pageSize, stage: stageFilter });
    } else {
      loadOpportunities({ pageNumber, pageSize, stage: stageFilter });
    }
  };

  const handleStageSuccess = () => {
    setStageModalOpen(false);
    setStageModalOpportunity(null);
    if (clientId != null) {
      loadOpportunitiesByClient(clientId, { pageNumber, pageSize, stage: stageFilter });
    } else {
      loadOpportunities({ pageNumber, pageSize, stage: stageFilter });
    }
  };

  const handleDelete = (record: IOpportunity) => {
    Modal.confirm({
      title: "Delete opportunity",
      content: `Are you sure you want to delete "${record.title}"?`,
      okText: "Delete",
      okType: "danger",
      cancelText: "Cancel",
      onOk: async () => {
        await deleteOpportunity(record.id);
        if (clientId != null) {
          loadOpportunitiesByClient(clientId, { pageNumber, pageSize, stage: stageFilter });
        } else {
          loadOpportunities({ pageNumber, pageSize, stage: stageFilter });
        }
      },
    });
  };

  const effectiveClientId = (record: IOpportunity) => clientId ?? record.clientId;

  const stageOptions = [
    { value: undefined, label: "All stages" },
    ...Object.entries(OPPORTUNITY_STAGE_LABELS).map(([value, label]) => ({
      value: Number(value),
      label,
    })),
  ];

  const columns = [
    ...(clientId == null
      ? [
          {
            title: "Client",
            dataIndex: "clientId",
            key: "clientId",
            render: (id: string) => (id ? clientIdToName[id] ?? id : "—"),
          },
        ]
      : []),
    {
      title: "Title",
      dataIndex: "title",
      key: "title",
      render: (val: string, record: IOpportunity) => (
        <a
          onClick={(e) => {
            e.stopPropagation();
            router.push(`/clients/${effectiveClientId(record)}/opportunities/${record.id}`);
          }}
        >
          {val || "—"}
        </a>
      ),
    },
    {
      title: "Stage",
      dataIndex: "stage",
      key: "stage",
      render: (stage: number) => {
        const label = OPPORTUNITY_STAGE_LABELS[stage as OpportunityStage] ?? stage;
        const color =
          stage === OpportunityStage.ClosedWon
            ? "green"
            : stage === OpportunityStage.ClosedLost
              ? "red"
              : "orange";
        return <Tag color={color}>{label}</Tag>;
      },
    },
    {
      title: "Value",
      key: "value",
      render: (_: unknown, record: IOpportunity) =>
        record.estimatedValue != null
          ? formatCurrency(record.estimatedValue, record.currency)
          : "—",
    },
    {
      title: "Expected close",
      dataIndex: "expectedCloseDate",
      key: "expectedCloseDate",
      render: (val: string) => (val ? val.split("T")[0] : "—"),
    },
    {
      title: "",
      key: "actions",
      width: 80,
      render: (_: unknown, record: IOpportunity) => {
        const items: MenuProps["items"] = [
          {
            key: "view",
            icon: <EyeOutlined />,
            label: "View",
            onClick: () => router.push(`/clients/${effectiveClientId(record)}/opportunities/${record.id}`),
          },
          {
            key: "edit",
            icon: <EditOutlined />,
            label: "Edit",
            onClick: () => handleEdit(record),
          },
          {
            key: "stage",
            icon: <SwapOutlined />,
            label: "Change stage",
            onClick: () => openStageModal(record),
          },
          ...(canAssignOrDelete
            ? [
                {
                  key: "assign",
                  icon: <UserAddOutlined />,
                  label: "Assign to sales rep",
                  onClick: () => openAssignModal(record),
                },
                {
                  key: "delete",
                  icon: <DeleteOutlined />,
                  label: "Delete",
                  danger: true,
                  onClick: () => handleDelete(record),
                },
              ]
            : []),
        ];
        return (
          <Dropdown menu={{ items }} trigger={["click"]}>
            <Button type="text" size="small" icon={<MoreOutlined />} />
          </Dropdown>
        );
      },
    },
  ];

  if (isPending && !opportunities?.length) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          minHeight: 120,
          alignItems: "center",
        }}
      >
        <Spin />
      </div>
    );
  }

  return (
    <Space direction="vertical" size="middle" style={{ width: "100%" }}>
      {isError && error && (
        <Alert
          message="Error"
          description={error}
          type="error"
          showIcon
          action={
            <Button
              type="link"
              size="small"
              onClick={() =>
                clientId != null
                  ? loadOpportunitiesByClient(clientId, { pageNumber, pageSize, stage: stageFilter })
                  : loadOpportunities({ pageNumber, pageSize, stage: stageFilter })
              }
            >
              Retry
            </Button>
          }
        />
      )}
      <div style={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: 8 }}>
        <Select
          value={stageFilter}
          onChange={setStageFilter}
          options={stageOptions}
          style={{ minWidth: 140 }}
          placeholder="Filter by stage"
          allowClear
        />
        {clientId != null && (
          <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
            Add opportunity
          </Button>
        )}
      </div>
      <Table
        loading={isPending}
        dataSource={opportunities ?? []}
        rowKey="id"
        columns={columns}
        pagination={{
          current: pageNumber,
          pageSize,
          total: totalCount,
          showSizeChanger: true,
          showTotal: (total) => `Total ${total} opportunities`,
          onChange: handlePageChange,
        }}
      />
      <OpportunityFormModal
        open={formModalOpen}
        onClose={() => {
          setFormModalOpen(false);
          setEditingOpportunity(null);
        }}
        onSuccess={handleFormSuccess}
        clientId={clientId ?? editingOpportunity?.clientId ?? ""}
        opportunity={editingOpportunity}
        contacts={contacts ?? []}
        onSubmit={handleCreateSubmit}
        onUpdate={handleUpdateSubmit}
        loading={actionPending}
        loadContacts={loadContactsByClient}
      />
      <StageChangeModal
        open={stageModalOpen}
        onClose={() => {
          setStageModalOpen(false);
          setStageModalOpportunity(null);
        }}
        onSuccess={handleStageSuccess}
        opportunity={stageModalOpportunity}
        onSetStage={setStage}
        loading={actionPending}
      />
      <AssignOpportunityModal
        open={assignModalOpen}
        onClose={() => {
          setAssignModalOpen(false);
          setAssignModalOpportunity(null);
        }}
        onSuccess={handleAssignSuccess}
        opportunity={assignModalOpportunity}
        onAssign={assignOpportunity}
        loading={actionPending}
      />
    </Space>
  );
}
