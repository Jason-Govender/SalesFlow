"use client";

import { useEffect, useState } from "react";
import { Modal, Form, Input, InputNumber, Button, message } from "antd";
import type { IContract } from "@/utils/contracts-service";
import { contractsService } from "@/utils/contracts-service";

interface ContractRenewalModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  contract: IContract | null;
}

interface RenewalFormValues {
  proposedStartDate: string;
  proposedEndDate: string;
  proposedValue: number;
  notes?: string;
}

export function ContractRenewalModal({
  open,
  onClose,
  onSuccess,
  contract,
}: ContractRenewalModalProps) {
  const [form] = Form.useForm<RenewalFormValues>();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open && contract) {
      form.resetFields();
      const endDate = contract.endDate ? contract.endDate.split("T")[0] : undefined;
      form.setFieldsValue({
        proposedStartDate: endDate ?? "",
        proposedEndDate: "",
        proposedValue: contract.contractValue ?? 0,
        notes: "",
      });
    }
  }, [open, contract, form]);

  const handleFinish = async (values: RenewalFormValues) => {
    if (!contract) return;
    setLoading(true);
    try {
      await contractsService.createRenewal(contract.id, {
        proposedStartDate: values.proposedStartDate,
        proposedEndDate: values.proposedEndDate,
        proposedValue: values.proposedValue ?? 0,
        notes: values.notes?.trim() || undefined,
      });
      message.success("Renewal created");
      onSuccess();
      onClose();
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : "Failed to create renewal.";
      message.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      title="Create renewal"
      open={open && !!contract}
      onCancel={onClose}
      footer={null}
      destroyOnClose
    >
      {contract && (
        <Form
          form={form}
          layout="vertical"
          onFinish={handleFinish}
        >
          <Form.Item
            name="proposedStartDate"
            label="Proposed start date"
            rules={[{ required: true, message: "Start date is required" }]}
          >
            <Input type="date" />
          </Form.Item>
          <Form.Item
            name="proposedEndDate"
            label="Proposed end date"
            rules={[{ required: true, message: "End date is required" }]}
          >
            <Input type="date" />
          </Form.Item>
          <Form.Item
            name="proposedValue"
            label="Proposed value"
            rules={[{ required: true, message: "Value is required" }]}
          >
            <InputNumber min={0} style={{ width: "100%" }} />
          </Form.Item>
          <Form.Item name="notes" label="Notes">
            <Input.TextArea rows={3} placeholder="Optional notes" />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" loading={loading}>
              Create renewal
            </Button>
            <Button onClick={onClose} style={{ marginLeft: 8 }}>
              Cancel
            </Button>
          </Form.Item>
        </Form>
      )}
    </Modal>
  );
}
