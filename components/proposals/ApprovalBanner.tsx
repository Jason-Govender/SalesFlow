"use client";

import { Button, Alert, Modal, Input } from "antd";
import { useState } from "react";
import { ProposalStatus } from "@/utils/proposals-service";
import type { IProposal } from "@/utils/proposals-service";

const { TextArea } = Input;

interface ApprovalBannerProps {
  proposal: IProposal;
  onApprove: () => Promise<void>;
  onReject: (reason: string) => Promise<void>;
  canApproveReject: boolean;
  actionPending?: boolean;
}

export function ApprovalBanner({
  proposal,
  onApprove,
  onReject,
  canApproveReject,
  actionPending = false,
}: ApprovalBannerProps) {
  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [rejectReason, setRejectReason] = useState("");

  const isSubmitted = proposal.status === ProposalStatus.Submitted;
  const isRejected = proposal.status === ProposalStatus.Rejected;

  const handleReject = async () => {
    if (!rejectReason.trim()) return;
    try {
      await onReject(rejectReason.trim());
      setRejectModalOpen(false);
      setRejectReason("");
    } catch {
      // Error surfaced by provider
    }
  };

  if (isRejected && proposal.rejectionReason) {
    return (
      <Alert
        message="Proposal rejected"
        description={proposal.rejectionReason}
        type="error"
        showIcon
        style={{ marginBottom: 16 }}
      />
    );
  }

  if (isSubmitted && canApproveReject) {
    return (
      <>
        <Alert
          message="Awaiting approval"
          description={
            <div style={{ marginTop: 8 }}>
              <Button
                type="primary"
                onClick={() => onApprove()}
                loading={actionPending}
                style={{ marginRight: 8 }}
              >
                Approve
              </Button>
              <Button
                danger
                onClick={() => setRejectModalOpen(true)}
                loading={actionPending}
              >
                Reject
              </Button>
            </div>
          }
          type="info"
          showIcon
          style={{ marginBottom: 16 }}
        />
        <Modal
          title="Reject proposal"
          open={rejectModalOpen}
          onOk={handleReject}
          onCancel={() => {
            setRejectModalOpen(false);
            setRejectReason("");
          }}
          okText="Reject"
          okButtonProps={{ danger: true }}
          destroyOnClose
        >
          <p>Please provide a reason for rejection (required by API).</p>
          <TextArea
            rows={3}
            value={rejectReason}
            onChange={(e) => setRejectReason(e.target.value)}
            placeholder="Reason for rejection"
          />
        </Modal>
      </>
    );
  }

  if (isSubmitted && !canApproveReject) {
    return (
      <Alert
        message="Awaiting approval"
        description="This proposal has been submitted and is pending approval from an Admin or Sales Manager."
        type="info"
        showIcon
        style={{ marginBottom: 16 }}
      />
    );
  }

  return null;
}
