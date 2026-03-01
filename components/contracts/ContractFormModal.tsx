"use client";

import { useEffect } from "react";
import { Modal, Form, Input, InputNumber, Select, Button, Checkbox } from "antd";
import type { IContract } from "@/utils/contracts-service";
import { useClientsState, useClientsActions } from "@/providers/clients-provider";

export interface ContractFormValues {
  clientId?: string;
  title: string;
  contractValue?: number;
  currency: string;
  startDate?: string;
  endDate?: string;
  opportunityId?: string;
  proposalId?: string;
  ownerId?: string;
  renewalNoticePeriod?: number;
  autoRenew?: boolean;
  terms?: string;
}

interface ContractFormModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  clientId?: string;
  contract?: IContract | null;
  onSubmit: (values: ContractFormValues) => Promise<unknown>;
  onUpdate?: (id: string, values: ContractFormValues) => Promise<unknown>;
  loading?: boolean;
}

const CURRENCY_OPTIONS = [
  { value: "ZAR", label: "ZAR" },
  { value: "USD", label: "USD" },
  { value: "EUR", label: "EUR" },
];

export function ContractFormModal({
  open,
  onClose,
  onSuccess,
  clientId,
  contract,
  onSubmit,
  onUpdate,
  loading = false,
}: ContractFormModalProps) {
  const [form] = Form.useForm<ContractFormValues>();
  const isEdit = Boolean(contract?.id);
  const showClientSelect = open && !clientId && !isEdit;
  const { clients } = useClientsState();
  const { loadClients } = useClientsActions();

  useEffect(() => {
    if (showClientSelect) {
      loadClients({ pageNumber: 1, pageSize: 100 });
    }
  }, [showClientSelect, loadClients]);

  useEffect(() => {
    if (open) {
      form.resetFields();
      if (contract) {
        form.setFieldsValue({
          title: contract.title,
          contractValue: contract.contractValue ?? undefined,
          currency: contract.currency ?? "ZAR",
          startDate: contract.startDate ? contract.startDate.split("T")[0] : undefined,
          endDate: contract.endDate ? contract.endDate.split("T")[0] : undefined,
          opportunityId: contract.opportunityId || undefined,
          proposalId: contract.proposalId || undefined,
          ownerId: contract.ownerId || undefined,
          renewalNoticePeriod: contract.renewalNoticePeriod ?? undefined,
          autoRenew: contract.autoRenew ?? false,
          terms: contract.terms ?? "",
        });
      } else {
        form.setFieldsValue({
          clientId: undefined,
          title: "",
          contractValue: undefined,
          currency: "ZAR",
          startDate: undefined,
          endDate: undefined,
          opportunityId: undefined,
          proposalId: undefined,
          ownerId: undefined,
          renewalNoticePeriod: undefined,
          autoRenew: false,
          terms: "",
        });
      }
    }
  }, [open, contract, form]);

  const handleFinish = async (values: ContractFormValues) => {
    const payload: ContractFormValues = {
      ...values,
      title: values.title.trim(),
      terms: values.terms?.trim() || undefined,
    };
    try {
      if (isEdit && contract && onUpdate) {
        await onUpdate(contract.id, payload);
      } else {
        await onSubmit(payload);
      }
      onSuccess();
      onClose();
    } catch {
      // Error handled by provider; keep modal open
    }
  };

  return (
    <Modal
      title={isEdit ? "Edit contract" : "Add contract"}
      open={open}
      onCancel={onClose}
      footer={null}
      destroyOnClose
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={handleFinish}
      >
        {showClientSelect && (
          <Form.Item
            name="clientId"
            label="Client"
            rules={[{ required: true, message: "Client is required" }]}
          >
            <Select
              placeholder="Select client"
              showSearch
              optionFilterProp="label"
              options={(clients ?? []).map((c) => ({
                value: c.id,
                label: c.name ?? c.id,
              }))}
            />
          </Form.Item>
        )}
        <Form.Item
          name="title"
          label="Title"
          rules={[{ required: true, message: "Title is required" }]}
        >
          <Input placeholder="e.g. Annual SLA Agreement" />
        </Form.Item>
        <Form.Item
          name="contractValue"
          label="Contract value"
          rules={[{ required: true, message: "Value is required" }]}
        >
          <InputNumber min={0} style={{ width: "100%" }} placeholder="Value" />
        </Form.Item>
        <Form.Item
          name="currency"
          label="Currency"
          rules={[{ required: true, message: "Currency is required" }]}
        >
          <Select options={CURRENCY_OPTIONS} placeholder="Select currency" />
        </Form.Item>
        <Form.Item name="startDate" label="Start date">
          <Input type="date" />
        </Form.Item>
        <Form.Item name="endDate" label="End date">
          <Input type="date" />
        </Form.Item>
        <Form.Item name="opportunityId" label="Opportunity ID">
          <Input placeholder="Optional opportunity ID" />
        </Form.Item>
        <Form.Item name="proposalId" label="Proposal ID">
          <Input placeholder="Optional proposal ID" />
        </Form.Item>
        <Form.Item name="ownerId" label="Owner ID">
          <Input placeholder="Optional owner user ID" />
        </Form.Item>
        <Form.Item name="renewalNoticePeriod" label="Renewal notice period (days)">
          <InputNumber min={0} style={{ width: "100%" }} placeholder="e.g. 90" />
        </Form.Item>
        <Form.Item name="autoRenew" valuePropName="checked">
          <Checkbox>Auto-renew</Checkbox>
        </Form.Item>
        <Form.Item name="terms" label="Terms">
          <Input.TextArea rows={3} placeholder="Terms and conditions" />
        </Form.Item>
        <Form.Item>
          <Button type="primary" htmlType="submit" loading={loading}>
            {isEdit ? "Save" : "Create contract"}
          </Button>
          <Button onClick={onClose} style={{ marginLeft: 8 }}>
            Cancel
          </Button>
        </Form.Item>
      </Form>
    </Modal>
  );
}
