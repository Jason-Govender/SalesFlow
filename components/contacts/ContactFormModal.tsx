"use client";

import { useEffect } from "react";
import { Modal, Form, Input, Checkbox, Button } from "antd";
import type { IContact } from "@/utils/contacts-service";

export interface ContactFormValues {
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber?: string;
  position?: string;
  isPrimaryContact?: boolean;
}

interface ContactFormModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  clientId: string;
  contact?: IContact | null;
  onSubmit: (
    clientId: string,
    values: ContactFormValues
  ) => Promise<unknown>;
  onUpdate?: (id: string, values: ContactFormValues) => Promise<unknown>;
  loading?: boolean;
}

export function ContactFormModal({
  open,
  onClose,
  onSuccess,
  clientId,
  contact,
  onSubmit,
  onUpdate,
  loading = false,
}: ContactFormModalProps) {
  const [form] = Form.useForm<ContactFormValues>();
  const isEdit = Boolean(contact?.id);

  useEffect(() => {
    if (open) {
      form.resetFields();
      if (contact) {
        form.setFieldsValue({
          firstName: contact.firstName,
          lastName: contact.lastName,
          email: contact.email,
          phoneNumber: contact.phoneNumber ?? "",
          position: contact.position ?? "",
          isPrimaryContact: contact.isPrimaryContact ?? false,
        });
      } else {
        form.setFieldsValue({
          firstName: "",
          lastName: "",
          email: "",
          phoneNumber: "",
          position: "",
          isPrimaryContact: false,
        });
      }
    }
  }, [open, contact, form]);

  const handleFinish = async (values: ContactFormValues) => {
    const payload = {
      ...values,
      phoneNumber: values.phoneNumber?.trim() || undefined,
      position: values.position?.trim() || undefined,
      isPrimaryContact: values.isPrimaryContact ?? false,
    };
    try {
      if (isEdit && contact && onUpdate) {
        await onUpdate(contact.id, payload);
      } else {
        await onSubmit(clientId, payload);
      }
      form.resetFields();
      onClose();
      onSuccess();
    } catch {
      // Error is handled by provider; keep modal open
    }
  };

  return (
    <Modal
      title={isEdit ? "Edit contact" : "Add contact"}
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
        <Form.Item
          name="firstName"
          label="First name"
          rules={[{ required: true, message: "First name is required" }]}
        >
          <Input placeholder="First name" />
        </Form.Item>
        <Form.Item
          name="lastName"
          label="Last name"
          rules={[{ required: true, message: "Last name is required" }]}
        >
          <Input placeholder="Last name" />
        </Form.Item>
        <Form.Item
          name="email"
          label="Email"
          rules={[
            { required: true, message: "Email is required" },
            { type: "email", message: "Enter a valid email" },
          ]}
        >
          <Input placeholder="email@example.com" type="email" />
        </Form.Item>
        <Form.Item name="phoneNumber" label="Phone number">
          <Input placeholder="+27 11 123 4567" />
        </Form.Item>
        <Form.Item name="position" label="Position">
          <Input placeholder="e.g. Procurement Manager" />
        </Form.Item>
        <Form.Item name="isPrimaryContact" valuePropName="checked">
          <Checkbox>Primary contact for this client</Checkbox>
        </Form.Item>
        <Form.Item>
          <Button type="primary" htmlType="submit" loading={loading}>
            {isEdit ? "Save" : "Add contact"}
          </Button>
          <Button onClick={onClose} style={{ marginLeft: 8 }}>
            Cancel
          </Button>
        </Form.Item>
      </Form>
    </Modal>
  );
}
