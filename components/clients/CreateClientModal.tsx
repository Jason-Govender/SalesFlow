"use client";

import { Modal, Form, Input, Select, Button } from "antd";
import { useClientsActions } from "@/providers/clients-provider";
import {
  ClientType,
  CLIENT_TYPE_LABELS,
} from "@/utils/clients-service";
import type { ICreateClientRequest } from "@/utils/clients-service";

const CLIENT_TYPE_OPTIONS = [
  { value: ClientType.Government, label: CLIENT_TYPE_LABELS[ClientType.Government] },
  { value: ClientType.Private, label: CLIENT_TYPE_LABELS[ClientType.Private] },
  { value: ClientType.Partner, label: CLIENT_TYPE_LABELS[ClientType.Partner] },
];

interface CreateClientModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess: (clientId: string) => void;
  loading?: boolean;
}

export function CreateClientModal({ open, onClose, onSuccess, loading = false }: CreateClientModalProps) {
  const { createClient } = useClientsActions();
  const [form] = Form.useForm();

  const handleFinish = async (values: {
    name: string;
    industry?: string;
    clientType: ClientType | number;
    website?: string;
    billingAddress?: string;
    taxNumber?: string;
    companySize?: string;
  }) => {
    try {
      const body: ICreateClientRequest = {
        name: values.name.trim(),
        industry: values.industry?.trim() || undefined,
        clientType: values.clientType,
        website: values.website?.trim() || undefined,
        billingAddress: values.billingAddress?.trim() || undefined,
        taxNumber: values.taxNumber?.trim() || undefined,
        companySize: values.companySize?.trim() || undefined,
      };
      const client = await createClient(body);
      form.resetFields();
      onSuccess(client.id);
      onClose();
    } catch {
      // Error handled by provider; keep modal open
    }
  };

  return (
    <Modal
      title="Create client"
      open={open}
      onCancel={onClose}
      footer={null}
      destroyOnClose
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={handleFinish}
        initialValues={{ clientType: ClientType.Private }}
      >
        <Form.Item
          name="name"
          label="Name"
          rules={[{ required: true, message: "Name is required" }]}
        >
          <Input placeholder="Client or company name" />
        </Form.Item>
        <Form.Item name="industry" label="Industry">
          <Input placeholder="e.g. Technology, Finance" />
        </Form.Item>
        <Form.Item
          name="clientType"
          label="Client type"
          rules={[{ required: true, message: "Client type is required" }]}
        >
          <Select options={CLIENT_TYPE_OPTIONS} placeholder="Select type" />
        </Form.Item>
        <Form.Item name="website" label="Website">
          <Input placeholder="https://..." />
        </Form.Item>
        <Form.Item name="billingAddress" label="Billing address">
          <Input.TextArea rows={2} placeholder="Address" />
        </Form.Item>
        <Form.Item name="taxNumber" label="Tax number">
          <Input placeholder="Tax / VAT number" />
        </Form.Item>
        <Form.Item name="companySize" label="Company size">
          <Input placeholder="e.g. 50 - 100" />
        </Form.Item>
        <Form.Item>
          <Button type="primary" htmlType="submit" loading={loading}>
            Create client
          </Button>
          <Button onClick={onClose} style={{ marginLeft: 8 }}>
            Cancel
          </Button>
        </Form.Item>
      </Form>
    </Modal>
  );
}
