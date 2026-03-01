"use client";

import { useEffect } from "react";
import { Form, Input, Select, DatePicker, Button } from "antd";
import dayjs from "dayjs";
import type { IProposal, IUpdateProposalRequest } from "@/utils/proposals-service";

const CURRENCIES = [
  { value: "ZAR", label: "ZAR" },
  { value: "USD", label: "USD" },
  { value: "EUR", label: "EUR" },
  { value: "GBP", label: "GBP" },
];

interface ProposalEditorProps {
  proposal: IProposal;
  onSave: (values: IUpdateProposalRequest) => Promise<void>;
  actionPending?: boolean;
}

export function ProposalEditor({
  proposal,
  onSave,
  actionPending = false,
}: ProposalEditorProps) {
  const [form] = Form.useForm();

  useEffect(() => {
    form.setFieldsValue({
      title: proposal.title,
      description: proposal.description ?? "",
      currency: proposal.currency,
      validUntil: proposal.validUntil ? dayjs(proposal.validUntil) : null,
    });
  }, [proposal.id, proposal.title, proposal.description, proposal.currency, proposal.validUntil, form]);

  const handleFinish = async (values: {
    title: string;
    description?: string;
    currency: string;
    validUntil: ReturnType<typeof dayjs> | null;
  }) => {
    await onSave({
      title: values.title,
      description: values.description || undefined,
      currency: values.currency,
      validUntil: values.validUntil ? values.validUntil.format("YYYY-MM-DD") : "",
    });
  };

  return (
    <Form
      form={form}
      layout="vertical"
      onFinish={handleFinish}
    >
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
        <Select options={CURRENCIES} placeholder="Currency" />
      </Form.Item>
      <Form.Item
        name="validUntil"
        label="Valid until"
        rules={[{ required: true, message: "Valid until is required" }]}
      >
        <DatePicker style={{ width: "100%" }} format="YYYY-MM-DD" />
      </Form.Item>
      <Form.Item>
        <Button type="primary" htmlType="submit" loading={actionPending}>
          Save changes
        </Button>
      </Form.Item>
    </Form>
  );
}
