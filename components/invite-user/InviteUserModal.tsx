"use client";

import { useEffect, useState } from "react";
import { Modal, Form, Input, Select, Button, Alert } from "antd";
import { MailOutlined } from "@ant-design/icons";
import emailjs from "@emailjs/browser";
import type { RegisterRoleOption } from "@/providers/auth-provider/context";

const ROLE_OPTIONS: { label: string; value: RegisterRoleOption }[] = [
  { label: "Sales Rep", value: "SalesRep" },
  { label: "Sales Manager", value: "SalesManager" },
  { label: "Business Development Manager", value: "BusinessDevelopmentManager" },
];

export type InviteFormValues = {
  email: string;
  role: RegisterRoleOption;
};

export interface InviteUserModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  tenantId: string;
}

export function InviteUserModal({
  open,
  onClose,
  onSuccess,
  tenantId,
}: InviteUserModalProps) {
  const [form] = Form.useForm<InviteFormValues>();
  const [sending, setSending] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      form.resetFields();
      setSubmitError(null);
    }
  }, [open, form]);

  const handleFinish = async (values: InviteFormValues) => {
    const serviceId = process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID;
    const templateId = process.env.NEXT_PUBLIC_EMAILJS_TEMPLATE_ID;
    const publicKey = process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY;

    if (!serviceId || !templateId || !publicKey) {
      setSubmitError("Email service is not configured. Please contact support.");
      return;
    }

    const origin =
      typeof window !== "undefined" ? window.location.origin : "";
    const activationLink = `${origin}/register?tenantId=${encodeURIComponent(tenantId)}&role=${encodeURIComponent(values.role)}`;
    const roleLabel =
      ROLE_OPTIONS.find((o) => o.value === values.role)?.label ?? values.role;

    setSending(true);
    setSubmitError(null);

    try {
      await emailjs.send(
        serviceId,
        templateId,
        {
          email: values.email,
          activation_link: activationLink,
          role: roleLabel,
        },
        publicKey
      );
      form.resetFields();
      onClose();
      onSuccess?.();
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to send invite email.";
      setSubmitError(message);
    } finally {
      setSending(false);
    }
  };

  return (
    <Modal
      title="Invite user"
      open={open}
      onCancel={onClose}
      footer={null}
      destroyOnClose
    >
      {submitError ? (
        <Alert
          type="error"
          message={submitError}
          showIcon
          closable
          onClose={() => setSubmitError(null)}
          style={{ marginBottom: 16 }}
        />
      ) : null}
      <Form<InviteFormValues>
        form={form}
        layout="vertical"
        onFinish={handleFinish}
        initialValues={{ role: "SalesRep" }}
      >
        <Form.Item
          name="email"
          label="Email"
          rules={[
            { required: true, message: "Email is required." },
            { type: "email", message: "Enter a valid email address." },
          ]}
        >
          <Input
            prefix={<MailOutlined />}
            placeholder="invitee@company.com"
            type="email"
          />
        </Form.Item>
        <Form.Item
          name="role"
          label="Role"
          rules={[{ required: true, message: "Role is required." }]}
        >
          <Select options={ROLE_OPTIONS} placeholder="Select role" />
        </Form.Item>
        <Form.Item>
          <Button type="primary" htmlType="submit" loading={sending}>
            Send invite
          </Button>
          <Button onClick={onClose} style={{ marginLeft: 8 }}>
            Cancel
          </Button>
        </Form.Item>
      </Form>
    </Modal>
  );
}
