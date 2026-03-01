"use client";

import { useState, useEffect } from "react";
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
  Dropdown,
  Modal,
  Tabs,
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
import { useDashboardActions } from "@/providers/dashboard-provider";
import { useOpportunitiesState, useOpportunitiesActions } from "@/providers/opportunities-provider";
import { useContactsState, useContactsActions } from "@/providers/contacts-provider";
import { usePricingRequestsState, usePricingRequestsActions } from "@/providers/pricing-requests-provider";
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
import { ActivityList } from "@/components/activities/ActivityList";
import { ProposalList } from "@/components/proposals";
import { PricingRequestList } from "@/components/pricing-requests";
import { ContractList } from "@/components/contracts/ContractList";
import { NoteList } from "@/components/notes/NoteList";
import { DocumentList } from "@/components/documents/DocumentList";
import { RelatedToType } from "@/utils/activities-service";

const ROLES_CAN_ASSIGN_OR_DELETE_OPPORTUNITY: string[] = ["Admin", "SalesManager"];

function formatCurrency(value: number, currency = "ZAR"): string {
  const isoCurrency = currency === "R" ? "ZAR" : currency;
  return new Intl.NumberFormat("en-ZA", {
    style: "currency",
    currency: isoCurrency,
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
    isPending,
    isError,
    error,
    actionPending,
  } = useOpportunitiesState();

  const {
    updateOpportunity,
    setStage,
    assignOpportunity,
    deleteOpportunity,
    loadOpportunity,
  } = useOpportunitiesActions();
  const { loadDashboard } = useDashboardActions();

  const { contacts } = useContactsState();
  const { loadContactsByClient } = useContactsActions();
  const {
    pricingRequests,
    isPending: pricingRequestsPending,
    error: pricingRequestsError,
    pagination: pricingRequestsPagination,
  } = usePricingRequestsState();
  const { loadPricingRequestsByOpportunity } = usePricingRequestsActions();

  const [editModalOpen, setEditModalOpen] = useState(false);
  const [stageModalOpen, setStageModalOpen] = useState(false);
  const [assignModalOpen, setAssignModalOpen] = useState(false);

  useEffect(() => {
    if (selectedOpportunity?.id) {
      loadPricingRequestsByOpportunity(selectedOpportunity.id);
    }
  }, [selectedOpportunity?.id, loadPricingRequestsByOpportunity]);

  const handleEditSuccess = () => {
    setEditModalOpen(false);
    if (selectedOpportunity) {
      loadOpportunity(selectedOpportunity.id);
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
    }
    loadDashboard();
  };

  const handleAssignSuccess = () => {
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
            <Tag color="orange">{stageLabel}</Tag>
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

      <Card>
        <Tabs
          defaultActiveKey="proposals"
          items={[
            {
              key: "proposals",
              label: "Proposals",
              children: (
                <ProposalList
                  clientId={clientId}
                  opportunityId={opp.id}
                  showCreateButton
                  createHref={`/opportunities/proposals/new?clientId=${clientId}&opportunityId=${opp.id}`}
                />
              ),
            },
            {
              key: "pricing-requests",
              label: "Pricing requests",
              children: (
                <PricingRequestList
                  items={pricingRequests}
                  loading={pricingRequestsPending}
                  error={pricingRequestsError}
                  onRetry={() => loadPricingRequestsByOpportunity(opp.id)}
                  pagination={
                    pricingRequestsPagination
                      ? {
                          pageNumber: pricingRequestsPagination.pageNumber,
                          pageSize: pricingRequestsPagination.pageSize,
                          totalCount: pricingRequestsPagination.totalCount,
                          onChange: (page: number, pageSize?: number) => {
                            loadPricingRequestsByOpportunity(opp.id, {
                              pageNumber: page,
                              pageSize,
                            });
                          },
                        }
                      : undefined
                  }
                />
              ),
            },
            {
              key: "contracts",
              label: "Contracts",
              children: (
                <ContractList clientId={clientId} opportunityId={opp.id} />
              ),
            },
            {
              key: "activities",
              label: "Activities",
              children: (
                <ActivityList
                  relatedToType={RelatedToType.Opportunity}
                  relatedToId={opp.id}
                  compact
                />
              ),
            },
            {
              key: "documents",
              label: "Documents",
              children: <DocumentList opportunityId={opp.id} />,
            },
            {
              key: "notes",
              label: "Notes",
              children: <NoteList opportunityId={opp.id} />,
            },
          ]}
        />
      </Card>

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
