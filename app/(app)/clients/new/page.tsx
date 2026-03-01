"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, Form, Input, Select, Button, Alert } from "antd";
import { useClientsActions } from "@/providers/clients-provider";
import {
  ClientType,
  CLIENT_TYPE_LABELS,
} from "@/utils/clients-service";
import type { ICreateClientRequest } from "@/utils/clients-service";
import { useAppPageStyles } from "../../pageStyles";

const CLIENT_TYPE_OPTIONS = [
  { value: ClientType.Government, label: CLIENT_TYPE_LABELS[ClientType.Government] },
  { value: ClientType.Private, label: CLIENT_TYPE_LABELS[ClientType.Private] },
  { value: ClientType.Partner, label: CLIENT_TYPE_LABELS[ClientType.Partner] },
];

export default function NewClientPage() {
  const { styles } = useAppPageStyles();
  const router = useRouter();
  const { createClient } = useClientsActions();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
    setError(null);
    setLoading(true);
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
      router.push(`/clients/${client.id}`);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to create client");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h1 className={styles.title}>Add client</h1>

      {error && (
        <Alert
          message={error}
          type="error"
          showIcon
          closable
          onClose={() => setError(null)}
          style={{ marginBottom: 16 }}
        />
      )}

      <Card>
        <Form
          form={form}
          layout="vertical"
          onFinish={handleFinish}
          initialValues={{
            clientType: ClientType.Private,
          }}
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
            <Button
              style={{ marginLeft: 8 }}
              onClick={() => router.push("/clients")}
            >
              Cancel
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
}
