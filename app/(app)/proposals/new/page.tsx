"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Card, Form, Input, Select, DatePicker, Button, Alert } from "antd";
import dayjs from "dayjs";
import { useProposalsActions } from "@/providers/proposals-provider";
import { useClientsState, useClientsActions } from "@/providers/clients-provider";
import { useOpportunitiesState, useOpportunitiesActions } from "@/providers/opportunities-provider";
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
  const searchParams = useSearchParams();
  const clientIdFromQuery = searchParams.get("clientId") ?? undefined;
  const opportunityIdFromQuery = searchParams.get("opportunityId") ?? undefined;
  const prefilledFromContext = Boolean(clientIdFromQuery && opportunityIdFromQuery);

  const { createProposal } = useProposalsActions();
  const { clients } = useClientsState();
  const { loadClients } = useClientsActions();
  const { loadOpportunitiesByClient } = useOpportunitiesActions();
  const { opportunities } = useOpportunitiesState();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form] = Form.useForm();

  useEffect(() => {
    loadClients({ pageSize: 200 });
  }, [loadClients]);

  useEffect(() => {
    if (clientIdFromQuery) {
      loadOpportunitiesByClient(clientIdFromQuery, { pageSize: 100 });
    }
  }, [clientIdFromQuery, loadOpportunitiesByClient]);

  const clientOptions = (clients ?? []).map((c) => ({
    value: c.id,
    label: c.name,
  }));

  const opportunityOptions = (opportunities ?? []).map((o) => ({
    value: o.id,
    label: o.title,
  }));

  const selectedClientId = Form.useWatch("clientId", form) || clientIdFromQuery;
  useEffect(() => {
    if (selectedClientId && !prefilledFromContext) {
      loadOpportunitiesByClient(selectedClientId, { pageSize: 100 });
    }
  }, [selectedClientId, prefilledFromContext, loadOpportunitiesByClient]);

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
            clientId: clientIdFromQuery,
            opportunityId: opportunityIdFromQuery,
          }}
        >
          <Form.Item
            name="clientId"
            label="Client"
            rules={[{ required: true, message: "Client is required" }]}
          >
            <Select
              placeholder="Select client"
              showSearch
              optionFilterProp="label"
              options={clientOptions}
              disabled={prefilledFromContext}
              allowClear={!prefilledFromContext}
              onClear={() => form.setFieldValue("opportunityId", undefined)}
            />
          </Form.Item>
          <Form.Item
            name="opportunityId"
            label="Opportunity"
            rules={[{ required: true, message: "Opportunity is required" }]}
          >
            <Select
              placeholder="Select opportunity"
              showSearch
              optionFilterProp="label"
              options={opportunityOptions}
              disabled={prefilledFromContext || !selectedClientId}
              allowClear={!prefilledFromContext}
            />
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
