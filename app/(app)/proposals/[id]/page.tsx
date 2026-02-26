"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { Card, Button, Space, Alert, Spin, Typography } from "antd";
import { useProposalsState, useProposalsActions } from "@/providers/proposals-provider";
import { useClientsState, useClientsActions } from "@/providers/clients-provider";
import { useOpportunitiesState, useOpportunitiesActions } from "@/providers/opportunities-provider";
import { useAuthState } from "@/providers/auth-provider";
import { ApprovalBanner } from "@/components/proposals/ApprovalBanner";
import { ProposalLineItemTable } from "@/components/proposals/ProposalLineItemTable";
import { ProposalEditor } from "@/components/proposals/ProposalEditor";
import { LineItemFormModal } from "@/components/proposals/LineItemFormModal";
import {
  ProposalStatus,
  PROPOSAL_STATUS_LABELS,
} from "@/utils/proposals-service";
import type { IProposalLineItem, ICreateLineItemRequest } from "@/utils/proposals-service";
import { useAppPageStyles } from "../../pageStyles";

const { Title, Text } = Typography;

const ROLES_CAN_APPROVE_REJECT_DELETE: string[] = ["Admin", "SalesManager"];

export default function ProposalDetailPage() {
  const { styles } = useAppPageStyles();
  const router = useRouter();
  const params = useParams();
  const id = params?.id as string | undefined;

  const { session } = useAuthState();
  const userRoles = session?.user?.roles ?? [];
  const canApproveRejectDelete = userRoles.some((r) =>
    ROLES_CAN_APPROVE_REJECT_DELETE.includes(r)
  );

  const {
    selectedProposal,
    isPending,
    isError,
    error,
    actionPending,
  } = useProposalsState();
  const {
    loadProposal,
    updateProposal,
    addLineItem,
    updateLineItem,
    removeLineItem,
    submitProposal,
    approveProposal,
    rejectProposal,
    deleteProposal,
    clearSelectedProposal,
  } = useProposalsActions();

  const { selectedClient } = useClientsState();
  const { loadClient } = useClientsActions();
  const { selectedOpportunity } = useOpportunitiesState();
  const { loadOpportunity } = useOpportunitiesActions();

  const [lineItemModalOpen, setLineItemModalOpen] = useState(false);
  const [editingLineItem, setEditingLineItem] = useState<IProposalLineItem | null>(null);

  useEffect(() => {
    if (id && id !== "new") {
      loadProposal(id);
    }
    return () => {
      clearSelectedProposal();
    };
  }, [id, loadProposal, clearSelectedProposal]);

  useEffect(() => {
    if (!selectedProposal) return;
    loadClient(selectedProposal.clientId);
    loadOpportunity(selectedProposal.opportunityId);
  }, [selectedProposal, loadClient, loadOpportunity]);

  const handleAddLineItem = () => {
    setEditingLineItem(null);
    setLineItemModalOpen(true);
  };

  const handleEditLineItem = (item: IProposalLineItem) => {
    setEditingLineItem(item);
    setLineItemModalOpen(true);
  };

  const handleSaveLineItem = async (values: ICreateLineItemRequest) => {
    if (!selectedProposal) return;
    if (editingLineItem) {
      await updateLineItem(selectedProposal.id, editingLineItem.id, values);
    } else {
      await addLineItem(selectedProposal.id, values);
    }
    setLineItemModalOpen(false);
    setEditingLineItem(null);
  };

  const handleRemoveLineItem = async (lineItemId: string) => {
    if (!selectedProposal) return;
    await removeLineItem(selectedProposal.id, lineItemId);
  };

  const handleSubmit = async () => {
    if (!selectedProposal) return;
    await submitProposal(selectedProposal.id);
  };

  const handleDelete = async () => {
    if (!selectedProposal) return;
    if (!confirm("Delete this draft proposal?")) return;
    await deleteProposal(selectedProposal.id);
    router.push("/proposals");
  };

  if (!id || id === "new") {
    return null;
  }

  if (isPending && !selectedProposal) {
    return (
      <div style={{ display: "flex", justifyContent: "center", minHeight: "50vh", alignItems: "center" }}>
        <Spin size="large" />
      </div>
    );
  }

  if (isError && error && !selectedProposal) {
    return (
      <div>
        <h1 className={styles.title}>Proposal</h1>
        <Alert
          message="Error"
          description={error}
          type="error"
          showIcon
          action={
            <Button type="link" onClick={() => loadProposal(id)}>
              Retry
            </Button>
          }
        />
      </div>
    );
  }

  if (!selectedProposal) {
    return null;
  }

  const isDraft = selectedProposal.status === ProposalStatus.Draft;

  return (
    <div>
      <Space direction="vertical" size="middle" style={{ width: "100%" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 12 }}>
          <div>
            <Button type="text" onClick={() => router.push("/proposals")}>
              ← Back to proposals
            </Button>
            <Title level={4} style={{ margin: "8px 0 0" }}>
              {selectedProposal.title}
            </Title>
            <Text type="secondary">
              Status: {PROPOSAL_STATUS_LABELS[selectedProposal.status as ProposalStatus]}
            </Text>
            <div style={{ marginTop: 4 }}>
              <Text type="secondary">
                <strong>Client:</strong>{" "}
                {selectedClient?.id === selectedProposal.clientId ? (
                  <Link href={`/clients/${selectedProposal.clientId}`}>
                    {selectedClient.name}
                  </Link>
                ) : (
                  <Link href={`/clients/${selectedProposal.clientId}`}>View client</Link>
                )}
                {" · "}
                <strong>Opportunity:</strong>{" "}
                {selectedOpportunity?.id === selectedProposal.opportunityId ? (
                  <Link href={`/clients/${selectedProposal.clientId}/opportunities/${selectedProposal.opportunityId}`}>
                    {selectedOpportunity.title}
                  </Link>
                ) : (
                  <Link href={`/clients/${selectedProposal.clientId}/opportunities/${selectedProposal.opportunityId}`}>
                    View opportunity
                  </Link>
                )}
              </Text>
            </div>
          </div>
          {isDraft && (
            <Space>
              <Button
                type="primary"
                onClick={handleSubmit}
                loading={actionPending}
              >
                Submit for approval
              </Button>
              {canApproveRejectDelete && (
                <Button danger onClick={handleDelete} loading={actionPending}>
                  Delete
                </Button>
              )}
            </Space>
          )}
        </div>

        {isError && error && (
          <Alert message={error} type="error" showIcon />
        )}

        <ApprovalBanner
          proposal={selectedProposal}
          onApprove={() => approveProposal(selectedProposal.id)}
          onReject={(reason) => rejectProposal(selectedProposal.id, reason)}
          canApproveReject={canApproveRejectDelete}
          actionPending={actionPending}
        />

        {isDraft && (
          <Card title="Edit proposal" size="small">
            <ProposalEditor
              proposal={selectedProposal}
              onSave={(values) => updateProposal(selectedProposal.id, values)}
              actionPending={actionPending}
            />
          </Card>
        )}

        <Card title="Line items" size="small">
          <ProposalLineItemTable
            proposal={selectedProposal}
            onAddLineItem={handleAddLineItem}
            onEditLineItem={isDraft ? handleEditLineItem : undefined}
            onRemoveLineItem={isDraft ? handleRemoveLineItem : undefined}
            actionPending={actionPending}
          />
        </Card>
      </Space>

      <LineItemFormModal
        open={lineItemModalOpen}
        title={editingLineItem ? "Edit line item" : "Add line item"}
        initialValues={editingLineItem}
        onSave={handleSaveLineItem}
        onCancel={() => {
          setLineItemModalOpen(false);
          setEditingLineItem(null);
        }}
        loading={actionPending}
      />
    </div>
  );
}
