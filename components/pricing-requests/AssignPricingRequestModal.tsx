"use client";

import { useEffect } from "react";
import { Modal, Form, Input, Button } from "antd";

export interface AssignPricingRequestModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  pricingRequestId: string | null;
  onAssign: (id: string, userId: string) => Promise<void>;
  loading?: boolean;
}

export function AssignPricingRequestModal({
  open,
  onClose,
  onSuccess,
  pricingRequestId,
  onAssign,
  loading = false,
}: AssignPricingRequestModalProps) {
  const [form] = Form.useForm<{ userId: string }>();

  useEffect(() => {
    if (open) {
      form.resetFields();
    }
  }, [open, form]);

  const handleFinish = async (values: { userId: string }) => {
    if (!pricingRequestId) return;
    const userId = values.userId.trim();
    if (!userId) return;
    try {
      await onAssign(pricingRequestId, userId);
      onSuccess();
      onClose();
    } catch {
      // Error handled by provider
    }
  };

  return (
    <Modal
      title="Assign pricing request"
      open={open}
      onCancel={onClose}
      footer={null}
      destroyOnClose
    >
      <Form form={form} layout="vertical" onFinish={handleFinish}>
        <Form.Item
          name="userId"
          label="User ID"
          rules={[{ required: true, message: "User ID is required" }]}
        >
          <Input placeholder="Paste the assignee's user ID (GUID)" />
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
