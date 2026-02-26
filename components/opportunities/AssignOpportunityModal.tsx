"use client";

import { useEffect } from "react";
import { Modal, Form, Input, Button } from "antd";
import type { IOpportunity } from "@/utils/opportunities-service";

interface AssignOpportunityModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  opportunity: IOpportunity | null;
  onAssign: (opportunityId: string, userId: string) => Promise<void>;
  loading?: boolean;
}

export function AssignOpportunityModal({
  open,
  onClose,
  onSuccess,
  opportunity,
  onAssign,
  loading = false,
}: AssignOpportunityModalProps) {
  const [form] = Form.useForm<{ userId: string }>();

  useEffect(() => {
    if (open) {
      form.resetFields();
    }
  }, [open, form]);

  const handleFinish = async (values: { userId: string }) => {
    if (!opportunity) return;
    const userId = values.userId.trim();
    if (!userId) return;
    try {
      await onAssign(opportunity.id, userId);
      onSuccess();
      onClose();
    } catch {
      // Error handled by provider
    }
  };

  return (
    <Modal
      title="Assign opportunity to sales rep"
      open={open}
      onCancel={onClose}
      footer={null}
      destroyOnClose
    >
      <Form form={form} layout="vertical" onFinish={handleFinish}>
        <Form.Item
          name="userId"
          label="Sales rep user ID"
          rules={[{ required: true, message: "User ID is required" }]}
        >
          <Input placeholder="Paste the sales rep's user ID (GUID)" />
        </Form.Item>
        <Form.Item>
          <Button type="primary" htmlType="submit" loading={loading}>
            Assign
          </Button>
          <Button onClick={onClose} style={{ marginLeft: 8 }}>
            Cancel
          </Button>
        </Form.Item>
      </Form>
    </Modal>
  );
}
