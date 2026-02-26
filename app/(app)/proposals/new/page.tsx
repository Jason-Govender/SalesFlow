"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, Form, Input, Select, DatePicker, Button, Alert } from "antd";
import dayjs from "dayjs";
import { useProposalsActions } from "@/providers/proposals-provider";
import type { ICreateProposalRequest } from "@/utils/proposals-service";
import { useAppPageStyles } from "../../pageStyles";

const CURRENCIES = [
  { value: "ZAR", label: "ZAR" },
  { value: "USD", label: "USD" },
  { value: "EUR", label: "EUR" },
  { value: "GBP", label: "GBP" },
];

export default function NewProposalPage() {
  const { styles } = useAppPageStyles();
  const router = useRouter();
  const { createProposal } = useProposalsActions();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [form] = Form.useForm();

  const handleFinish = async (values: {
    title: string;
    description?: string;
    currency: string;
    validUntil: ReturnType<typeof dayjs>;
    opportunityId: string;
    clientId: string;
  }) => {
    setError(null);
    setLoading(true);
    try {
      const body: ICreateProposalRequest = {
        opportunityId: values.opportunityId.trim(),
        clientId: values.clientId.trim(),
        title: values.title,
        description: values.description || undefined,
        currency: values.currency,
        validUntil: values.validUntil ? values.validUntil.format("YYYY-MM-DD") : "",
      };
      const proposal = await createProposal(body);
      router.push(`/proposals/${proposal.id}`);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to create proposal");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h1 className={styles.title}>Create proposal</h1>

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
            currency: "ZAR",
            validUntil: dayjs().add(30, "day"),
          }}
        >
          <Form.Item
            name="opportunityId"
            label="Opportunity ID"
            rules={[{ required: true, message: "Opportunity ID is required" }]}
          >
            <Input placeholder="Paste opportunity GUID" />
          </Form.Item>
          <Form.Item
            name="clientId"
            label="Client ID"
            rules={[{ required: true, message: "Client ID is required" }]}
          >
            <Input placeholder="Paste client GUID" />
          </Form.Item>
          <Form.Item
            name="title"
            label="Title"
            rules={[{ required: true, message: "Title is required" }]}
          >
            <Input placeholder="Proposal title" />
          </Form.Item>
          <Form.Item name="description" label="Description">
            <Input.TextArea rows={2} placeholder="Description" />
          </Form.Item>
          <Form.Item
            name="currency"
            label="Currency"
            rules={[{ required: true }]}
          >
            <Select options={CURRENCIES} />
          </Form.Item>
          <Form.Item
            name="validUntil"
            label="Valid until"
            rules={[{ required: true, message: "Valid until is required" }]}
          >
            <DatePicker style={{ width: "100%" }} format="YYYY-MM-DD" />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" loading={loading}>
              Create proposal
            </Button>
            <Button
              style={{ marginLeft: 8 }}
              onClick={() => router.push("/proposals")}
            >
              Cancel
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
}
