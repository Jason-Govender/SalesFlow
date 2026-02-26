"use client";

import { useEffect } from "react";
import { Modal, Form, Input, Select, Button } from "antd";
import { useAuthState } from "@/providers/auth-provider";
import { useClientsState, useClientsActions } from "@/providers/clients-provider";
import { useOpportunitiesState, useOpportunitiesActions } from "@/providers/opportunities-provider";
import { Priority, PRIORITY_LABELS } from "@/utils/pricing-requests-service";
import type { ICreatePricingRequestRequest } from "@/utils/pricing-requests-service";

const PRIORITY_OPTIONS = [
  { value: Priority.Low, label: PRIORITY_LABELS[Priority.Low] },
  { value: Priority.Medium, label: PRIORITY_LABELS[Priority.Medium] },
  { value: Priority.High, label: PRIORITY_LABELS[Priority.High] },
  { value: Priority.Urgent, label: PRIORITY_LABELS[Priority.Urgent] },
];

export interface PricingRequestFormValues {
  title: string;
  description?: string;
  clientId: string;
  opportunityId?: string;
  priority: number;
  requiredByDate: string;
}

export interface PricingRequestFormModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  onSubmit: (body: ICreatePricingRequestRequest) => Promise<unknown>;
  loading?: boolean;
}

export function PricingRequestFormModal({
  open,
  onClose,
  onSuccess,
  onSubmit,
  loading = false,
}: PricingRequestFormModalProps) {
  const [form] = Form.useForm<PricingRequestFormValues>();
  const { session } = useAuthState();
  const { clients, isPending: clientsLoading } = useClientsState();
  const { loadClients } = useClientsActions();
  const { opportunities } = useOpportunitiesState();
  const { loadOpportunitiesByClient } = useOpportunitiesActions();

  const clientId = Form.useWatch("clientId", form);

  useEffect(() => {
    if (open) {
      form.resetFields();
      loadClients({ pageSize: 200 });
    }
  }, [open, form, loadClients]);

  useEffect(() => {
    if (open && clientId) {
      form.setFieldValue("opportunityId", undefined);
      loadOpportunitiesByClient(clientId, { pageSize: 100 });
    }
  }, [open, clientId, loadOpportunitiesByClient, form]);

  const clientOptions = (clients ?? []).map((c) => ({
    value: c.id,
    label: c.name,
  }));

  const opportunityOptions = (opportunities ?? []).map((o) => ({
    value: o.id,
    label: o.title,
  }));

  const handleFinish = async (values: PricingRequestFormValues) => {
    const userId = session?.user?.userId;
    if (!userId) {
      form.setFields([{ name: "title", errors: ["You must be logged in to create a pricing request."] }]);
      return;
    }
    try {
      await onSubmit({
        title: values.title.trim(),
        description: values.description?.trim() || undefined,
        clientId: values.clientId,
        opportunityId: values.opportunityId || undefined,
        requestedById: userId,
        priority: values.priority,
        requiredByDate: values.requiredByDate,
      });
      onSuccess();
      onClose();
    } catch {
      // Error handled by provider
    }
  };

  return (
    <Modal
      title="Create pricing request"
      open={open}
      onCancel={onClose}
      footer={null}
      destroyOnClose
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={handleFinish}
        initialValues={{
          priority: Priority.Medium,
        }}
      >
        <Form.Item
          name="title"
          label="Title"
          rules={[{ required: true, message: "Title is required" }]}
        >
          <Input placeholder="e.g. Custom pricing for Client X" />
        </Form.Item>

        <Form.Item name="description" label="Description">
          <Input.TextArea rows={3} placeholder="Optional details" />
        </Form.Item>

        <Form.Item
          name="clientId"
          label="Client"
          rules={[{ required: true, message: "Client is required" }]}
        >
          <Select
            placeholder="Select client"
            allowClear
            showSearch
            optionFilterProp="label"
            options={clientOptions}
            loading={clientsLoading && (clientOptions.length === 0)}
          />
        </Form.Item>

        <Form.Item name="opportunityId" label="Opportunity">
          <Select
            placeholder="Select opportunity (optional)"
            allowClear
            showSearch
            optionFilterProp="label"
            options={opportunityOptions}
            disabled={!clientId}
          />
        </Form.Item>

        <Form.Item
          name="priority"
          label="Priority"
          rules={[{ required: true }]}
        >
          <Select options={PRIORITY_OPTIONS} />
        </Form.Item>

        <Form.Item
          name="requiredByDate"
          label="Required by date"
          rules={[{ required: true, message: "Required by date is required" }]}
        >
          <Input type="date" />
        </Form.Item>

        <Form.Item>
          <Button type="primary" htmlType="submit" loading={loading}>
            Create
          </Button>
          <Button onClick={onClose} style={{ marginLeft: 8 }}>
            Cancel
          </Button>
        </Form.Item>
      </Form>
    </Modal>
  );
}
