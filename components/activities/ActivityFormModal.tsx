"use client";

import { useEffect } from "react";
import { Modal, Form, Input, InputNumber, Select, Button } from "antd";
import type { IActivity } from "@/utils/activities-service";
import {
  ActivityType,
  ACTIVITY_TYPE_LABELS,
  Priority,
  PRIORITY_LABELS,
  RelatedToType,
  RELATED_TO_TYPE_LABELS,
} from "@/utils/activities-service";

const TYPE_OPTIONS = Object.entries(ACTIVITY_TYPE_LABELS).map(([value, label]) => ({
  value: Number(value),
  label,
}));

const PRIORITY_OPTIONS = Object.entries(PRIORITY_LABELS).map(([value, label]) => ({
  value: Number(value),
  label,
}));

const RELATED_TO_OPTIONS = Object.entries(RELATED_TO_TYPE_LABELS).map(([value, label]) => ({
  value: Number(value),
  label,
}));

export interface ActivityFormValues {
  type: number;
  subject: string;
  description?: string;
  priority?: number;
  dueDate: string;
  assignedToId?: string;
  relatedToType?: number;
  relatedToId?: string;
  duration?: number;
  location?: string;
}

interface ActivityFormModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  activity?: IActivity | null;
  relatedToType?: RelatedToType;
  relatedToId?: string;
  onSubmit: (values: ActivityFormValues) => Promise<unknown>;
  onUpdate?: (id: string, values: ActivityFormValues) => Promise<unknown>;
  loading?: boolean;
}

function toDateTimeLocal(iso?: string): string {
  if (!iso) return "";
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export function ActivityFormModal({
  open,
  onClose,
  onSuccess,
  activity,
  relatedToType: presetRelatedToType,
  relatedToId: presetRelatedToId,
  onSubmit,
  onUpdate,
  loading = false,
}: ActivityFormModalProps) {
  const [form] = Form.useForm<ActivityFormValues>();
  const isEdit = Boolean(activity?.id);

  useEffect(() => {
    if (open) {
      form.resetFields();
      if (activity) {
        form.setFieldsValue({
          type: activity.type ?? ActivityType.Call,
          subject: activity.subject ?? "",
          description: activity.description ?? "",
          priority: activity.priority ?? undefined,
          dueDate: toDateTimeLocal(activity.dueDate),
          assignedToId: activity.assignedToId ?? "",
          relatedToType: activity.relatedToType ?? undefined,
          relatedToId: activity.relatedToId ?? "",
          duration: activity.duration ?? undefined,
          location: activity.location ?? "",
        });
      } else {
        form.setFieldsValue({
          type: ActivityType.Call,
          subject: "",
          description: "",
          priority: Priority.Medium,
          dueDate: "",
          assignedToId: "",
          relatedToType: presetRelatedToType ?? undefined,
          relatedToId: presetRelatedToId ?? "",
          duration: undefined,
          location: "",
        });
      }
    }
  }, [open, activity, presetRelatedToType, presetRelatedToId, form]);

  const handleFinish = async (values: ActivityFormValues) => {
    const dueDate = values.dueDate?.endsWith("Z")
      ? values.dueDate
      : values.dueDate
        ? new Date(values.dueDate).toISOString()
        : "";
    const payload: ActivityFormValues = {
      ...values,
      subject: values.subject.trim(),
      description: values.description?.trim() || undefined,
      dueDate,
      relatedToId: values.relatedToId || undefined,
      assignedToId: values.assignedToId || undefined,
    };
    try {
      if (isEdit && activity && onUpdate) {
        await onUpdate(activity.id, payload);
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
      title={isEdit ? "Edit activity" : "New activity"}
      open={open}
      onCancel={onClose}
      footer={null}
      destroyOnClose
    >
      <Form form={form} layout="vertical" onFinish={handleFinish}>
        <Form.Item
          name="type"
          label="Type"
          rules={[{ required: true, message: "Type is required" }]}
        >
          <Select options={TYPE_OPTIONS} placeholder="Select type" />
        </Form.Item>
        <Form.Item
          name="subject"
          label="Subject"
          rules={[{ required: true, message: "Subject is required" }]}
        >
          <Input placeholder="Activity subject" />
        </Form.Item>
        <Form.Item name="description" label="Description">
          <Input.TextArea rows={3} placeholder="Description" />
        </Form.Item>
        <Form.Item name="priority" label="Priority">
          <Select allowClear options={PRIORITY_OPTIONS} placeholder="Select priority" />
        </Form.Item>
        <Form.Item
          name="dueDate"
          label="Due date & time"
          rules={[{ required: true, message: "Due date is required" }]}
        >
          <Input type="datetime-local" />
        </Form.Item>
        <Form.Item name="duration" label="Duration (minutes)">
          <InputNumber min={1} style={{ width: "100%" }} placeholder="e.g. 60" />
        </Form.Item>
        <Form.Item name="location" label="Location">
          <Input placeholder="e.g. Microsoft Teams" />
        </Form.Item>
        {!isEdit && (
          <>
            <Form.Item name="relatedToType" label="Related to">
              <Select
                allowClear
                options={RELATED_TO_OPTIONS}
                placeholder="Client, Opportunity, etc."
              />
            </Form.Item>
            <Form.Item name="relatedToId" label="Related entity ID">
              <Input placeholder="Paste entity ID (optional)" />
            </Form.Item>
          </>
        )}
        <Form.Item name="assignedToId" label="Assigned to (user ID)">
          <Input placeholder="Optional user ID" />
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
