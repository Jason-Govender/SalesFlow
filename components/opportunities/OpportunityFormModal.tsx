"use client";

import { useEffect } from "react";
import { Modal, Form, Input, InputNumber, Select, Button } from "antd";
import type { IOpportunity } from "@/utils/opportunities-service";
import {
  OpportunityStage,
  OPPORTUNITY_STAGE_LABELS,
  OpportunitySource,
  OPPORTUNITY_SOURCE_LABELS,
} from "@/utils/opportunities-service";
import type { IContact } from "@/utils/contacts-service";

export interface ClientOption {
  id: string;
  name: string;
}

const STAGE_OPTIONS = Object.entries(OPPORTUNITY_STAGE_LABELS).map(([value, label]) => ({
  value: Number(value),
  label,
}));

const SOURCE_OPTIONS = Object.entries(OPPORTUNITY_SOURCE_LABELS).map(([value, label]) => ({
  value: Number(value),
  label,
}));

export interface OpportunityFormValues {
  title: string;
  clientId?: string;
  contactId?: string;
  estimatedValue?: number;
  currency: string;
  stage: number;
  source?: number;
  probability?: number;
  expectedCloseDate?: string;
  description?: string;
}

interface OpportunityFormModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  clientId?: string;
  opportunity?: IOpportunity | null;
  contacts: IContact[];
  clients?: ClientOption[];
  onSubmit: (values: OpportunityFormValues) => Promise<unknown>;
  onUpdate?: (id: string, values: OpportunityFormValues) => Promise<unknown>;
  loading?: boolean;
  loadContacts?: (clientId: string) => void;
}

export function OpportunityFormModal({
  open,
  onClose,
  onSuccess,
  clientId: contextClientId,
  opportunity,
  contacts,
  clients = [],
  onSubmit,
  onUpdate,
  loading = false,
  loadContacts,
}: OpportunityFormModalProps) {
  const [form] = Form.useForm<OpportunityFormValues>();
  const isEdit = Boolean(opportunity?.id);
  const requireClientSelect = !contextClientId && !isEdit;

  const effectiveClientId = contextClientId ?? form.getFieldValue("clientId");

  useEffect(() => {
    if (open && effectiveClientId && loadContacts) {
      loadContacts(effectiveClientId);
    }
  }, [open, effectiveClientId, loadContacts]);

  useEffect(() => {
    if (open) {
      form.resetFields();
      if (opportunity) {
        form.setFieldsValue({
          title: opportunity.title,
          contactId: opportunity.contactId || undefined,
          estimatedValue: opportunity.estimatedValue ?? undefined,
          currency: opportunity.currency ?? "ZAR",
          stage: opportunity.stage ?? OpportunityStage.Lead,
          source: opportunity.source ?? undefined,
          probability: opportunity.probability ?? undefined,
          expectedCloseDate: opportunity.expectedCloseDate
            ? opportunity.expectedCloseDate.split("T")[0]
            : undefined,
          description: opportunity.description ?? "",
        });
      } else {
        form.setFieldsValue({
          title: "",
          clientId: undefined,
          contactId: undefined,
          estimatedValue: undefined,
          currency: "ZAR",
          stage: OpportunityStage.Lead,
          source: undefined,
          probability: undefined,
          expectedCloseDate: undefined,
          description: "",
        });
      }
    }
  }, [open, opportunity, form]);

  const handleFinish = async (values: OpportunityFormValues) => {
    const payload: OpportunityFormValues = {
      ...values,
      title: values.title.trim(),
      description: values.description?.trim() || undefined,
    };
    try {
      if (isEdit && opportunity && onUpdate) {
        await onUpdate(opportunity.id, payload);
      } else {
        await onSubmit(payload);
      }
      onSuccess();
      onClose();
    } catch {
      // Error handled by provider; keep modal open
    }
  };

  const contactOptions = contacts.map((c) => ({
    value: c.id,
    label: `${c.firstName} ${c.lastName}`.trim() || c.email,
  }));

  const clientOptions = clients.map((c) => ({ value: c.id, label: c.name }));

  return (
    <Modal
      title={isEdit ? "Edit opportunity" : "Create opportunity"}
      open={open}
      onCancel={onClose}
      footer={null}
      destroyOnClose
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={handleFinish}
        onValuesChange={(_, all) => {
          if (requireClientSelect && all.clientId && loadContacts) {
            loadContacts(all.clientId);
          }
        }}
      >
        {requireClientSelect && (
          <Form.Item
            name="clientId"
            label="Client"
            rules={[{ required: true, message: "Client is required" }]}
          >
            <Select
              placeholder="Select client"
              options={clientOptions}
              showSearch
              optionFilterProp="label"
            />
          </Form.Item>
        )}
        <Form.Item
          name="title"
          label="Title"
          rules={[{ required: true, message: "Title is required" }]}
        >
          <Input placeholder="Opportunity title" />
        </Form.Item>
        <Form.Item name="contactId" label="Contact">
          <Select
            allowClear
            placeholder="Select contact"
            options={contactOptions}
          />
        </Form.Item>
        <Form.Item name="estimatedValue" label="Estimated value">
          <InputNumber
            min={0}
            style={{ width: "100%" }}
            placeholder="Value"
          />
        </Form.Item>
        <Form.Item name="currency" label="Currency" initialValue="ZAR">
          <Select
            options={[
              { value: "ZAR", label: "ZAR" },
              { value: "USD", label: "USD" },
              { value: "EUR", label: "EUR" },
            ]}
          />
        </Form.Item>
        <Form.Item
          name="stage"
          label="Stage"
          rules={[{ required: true, message: "Stage is required" }]}
        >
          <Select options={STAGE_OPTIONS} placeholder="Select stage" />
        </Form.Item>
        <Form.Item name="source" label="Source">
          <Select allowClear options={SOURCE_OPTIONS} placeholder="Select source" />
        </Form.Item>
        <Form.Item name="probability" label="Probability (%)">
          <InputNumber min={0} max={100} style={{ width: "100%" }} />
        </Form.Item>
        <Form.Item name="expectedCloseDate" label="Expected close date">
          <Input type="date" />
        </Form.Item>
        <Form.Item name="description" label="Description">
          <Input.TextArea rows={3} placeholder="Description" />
        </Form.Item>
        <Form.Item>
          <Button type="primary" htmlType="submit" loading={loading}>
            {isEdit ? "Save" : "Create"}
          </Button>
          <Button onClick={onClose} style={{ marginLeft: 8 }}>
            Cancel
          </Button>
        </Form.Item>
      </Form>
    </Modal>
  );
}
