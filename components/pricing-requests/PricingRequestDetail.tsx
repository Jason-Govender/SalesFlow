"use client";

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
} from "antd";
import { ArrowLeftOutlined } from "@ant-design/icons";
import { useRouter } from "next/navigation";
import {
  PRICING_REQUEST_STATUS_LABELS,
  PRIORITY_LABELS,
  PricingRequestStatus,
  Priority,
} from "@/utils/pricing-requests-service";
import type { IPricingRequest } from "@/utils/pricing-requests-service";

const ROLES_CAN_ASSIGN: string[] = ["Admin", "SalesManager"];

export interface PricingRequestDetailProps {
  request: IPricingRequest | null;
  loading: boolean;
  error?: string;
  actionPending: boolean;
  canAssign: boolean;
  onAssignClick: () => void;
  onCompleteClick: () => void;
}

export function PricingRequestDetail({
  request,
  loading,
  error,
  actionPending,
  canAssign,
  onAssignClick,
  onCompleteClick,
}: PricingRequestDetailProps) {
  const router = useRouter();

  if (loading && !request) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          minHeight: "40vh",
          alignItems: "center",
        }}
      >
        <Spin size="large" />
      </div>
    );
  }

  if (!request) {
    return (
      <Alert
        message="Not found"
        description="Pricing request not found or you don't have access."
        type="warning"
        showIcon
        action={
          <Button type="link" onClick={() => router.push("/pricing-requests")}>
            Back to list
          </Button>
        }
      />
    );
  }

  const status = request.status as PricingRequestStatus;
  const statusLabel =
    PRICING_REQUEST_STATUS_LABELS[status] ?? String(request.status);
  const priorityLabel =
    PRIORITY_LABELS[request.priority as Priority] ?? String(request.priority);
  const canComplete =
    status === PricingRequestStatus.InProgress;
  const showAssign =
    canAssign && status === PricingRequestStatus.Pending;

  return (
    <Space direction="vertical" size="middle" style={{ width: "100%" }}>
      <Space>
        <Button
          icon={<ArrowLeftOutlined />}
          onClick={() => router.push("/pricing-requests")}
        >
          Back
        </Button>
      </Space>

      {error && (
        <Alert
          message="Error"
          description={error}
          type="error"
          showIcon
        />
      )}

      <Card title={request.title}>
        <Descriptions column={1} bordered size="small">
          <Descriptions.Item label="Status">
            <Tag
              color={
                status === PricingRequestStatus.Completed
                  ? "green"
                  : status === PricingRequestStatus.InProgress
                    ? "orange"
                    : "default"
              }
            >
              {statusLabel}
            </Tag>
          </Descriptions.Item>
          <Descriptions.Item label="Priority">
            {priorityLabel}
          </Descriptions.Item>
          <Descriptions.Item label="Required by">
            {request.requiredByDate
              ? new Date(request.requiredByDate).toLocaleDateString()
              : "—"}
          </Descriptions.Item>
          {request.description && (
            <Descriptions.Item label="Description">
              {request.description}
            </Descriptions.Item>
          )}
          <Descriptions.Item label="Client">
            <Link href={`/clients/${request.clientId}`}>View client</Link>
          </Descriptions.Item>
          {request.opportunityId && (
            <Descriptions.Item label="Opportunity">
              <Link
                href={`/clients/${request.clientId}/opportunities/${request.opportunityId}`}
              >
                View opportunity
              </Link>
            </Descriptions.Item>
          )}
          <Descriptions.Item label="Assigned to">
            {request.assignedToId ? "Yes (see API for user details)" : "Unassigned"}
          </Descriptions.Item>
        </Descriptions>

        <div style={{ marginTop: 16 }}>
          <Space>
            {showAssign && (
              <Button
                type="primary"
                onClick={onAssignClick}
                loading={actionPending}
              >
                Assign
              </Button>
            )}
            {canComplete && (
              <Button
                onClick={onCompleteClick}
                loading={actionPending}
              >
                Mark complete
              </Button>
            )}
          </Space>
        </div>
      </Card>
    </Space>
  );
}
