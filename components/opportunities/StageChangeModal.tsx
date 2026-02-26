"use client";

import { useEffect } from "react";
import { Modal, Form, Select, Input, Button } from "antd";
import type { IOpportunity } from "@/utils/opportunities-service";
import {
  OpportunityStage,
  OPPORTUNITY_STAGE_LABELS,
} from "@/utils/opportunities-service";

const STAGE_OPTIONS = Object.entries(OPPORTUNITY_STAGE_LABELS).map(([value, label]) => ({
  value: Number(value),
  label,
}));

interface StageChangeModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  opportunity: IOpportunity | null;
  onSetStage: (id: string, stage: number, reason?: string) => Promise<void>;
  loading?: boolean;
}

export function StageChangeModal({
  open,
  onClose,
  onSuccess,
  opportunity,
  onSetStage,
  loading = false,
}: StageChangeModalProps) {
  const [form] = Form.useForm<{ stage: number; reason?: string }>();

  useEffect(() => {
    if (open && opportunity) {
      form.setFieldsValue({
        stage: opportunity.stage,
        reason: undefined,
      });
    }
  }, [open, opportunity, form]);

  const handleFinish = async (values: { stage: number; reason?: string }) => {
    if (!opportunity) return;
    try {
      await onSetStage(opportunity.id, values.stage, values.reason?.trim());
      onSuccess();
      onClose();
    } catch {
      // Error handled by provider
    }
  };

  return (
    <Modal
      title="Change stage"
      open={open}
      onCancel={onClose}
      footer={null}
      destroyOnClose
    >
      <Form form={form} layout="vertical" onFinish={handleFinish}>
        <Form.Item
          name="stage"
          label="Stage"
          rules={[{ required: true, message: "Stage is required" }]}
        >
          <Select options={STAGE_OPTIONS} placeholder="Select stage" />
        </Form.Item>
        <Form.Item name="reason" label="Reason (optional)">
          <Input.TextArea rows={2} placeholder="Reason for change" />
        </Form.Item>
        <Form.Item>
          <Button type="primary" htmlType="submit" loading={loading}>
            Update stage
          </Button>
          <Button onClick={onClose} style={{ marginLeft: 8 }}>
            Cancel
          </Button>
        </Form.Item>
      </Form>
    </Modal>
  );
}
