"use client";

import { useState } from "react";
import { Modal, Form, Input, Select, Button, Alert } from "antd";
import { useDocumentsActions } from "@/providers/documents-provider";
import {
  DocumentCategory,
  DOCUMENT_CATEGORY_LABELS,
  MAX_UPLOAD_BYTES,
} from "@/utils/documents-service";

const CATEGORY_OPTIONS = Object.entries(DOCUMENT_CATEGORY_LABELS).map(
  ([value, label]) => ({ value: Number(value), label })
);

interface DocumentUploadModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  clientId: string;
  loading?: boolean;
}

export function DocumentUploadModal({
  open,
  onClose,
  onSuccess,
  clientId,
  loading = false,
}: DocumentUploadModalProps) {
  const { uploadDocument } = useDocumentsActions();
  const [file, setFile] = useState<File | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);
  const [form] = Form.useForm();
  const [submitError, setSubmitError] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) {
      if (f.size > MAX_UPLOAD_BYTES) {
        setFileError("File must be 50 MB or smaller");
        setFile(null);
        return;
      }
      setFileError(null);
      setFile(f);
    } else {
      setFileError(null);
      setFile(null);
    }
  };

  const handleFinish = async (values: { description?: string; documentCategory?: number }) => {
    if (!file) return;
    setSubmitError(null);
    try {
      await uploadDocument({
        file,
        clientId,
        description: values.description?.trim() || undefined,
        documentCategory: values.documentCategory,
      });
      form.resetFields();
      setFile(null);
      onClose();
      onSuccess();
    } catch {
      setSubmitError("Upload failed. Please try again.");
    }
  };

  const handleClose = () => {
    form.resetFields();
    setFile(null);
    setSubmitError(null);
    onClose();
  };

  return (
    <Modal
      title="Upload document"
      open={open}
      onCancel={handleClose}
      footer={null}
      destroyOnClose
    >
      {submitError && (
        <Alert
          message={submitError}
          type="error"
          showIcon
          closable
          onClose={() => setSubmitError(null)}
          style={{ marginBottom: 16 }}
        />
      )}
      <Form form={form} layout="vertical" onFinish={handleFinish}>
        <Form.Item label="File" required>
          <input
            type="file"
            onChange={handleFileChange}
            accept="*/*"
            style={{ display: "block" }}
          />
        </Form.Item>
        {fileError && (
          <p style={{ marginTop: -16, marginBottom: 16, color: "#ff4d4f", fontSize: 12 }}>
            {fileError}
          </p>
        )}
        {file && !fileError && (
          <p style={{ marginTop: -16, marginBottom: 16, color: "#666", fontSize: 12 }}>
            {file.name} ({(file.size / 1024).toFixed(1)} KB). Max 50 MB.
          </p>
        )}
        <Form.Item name="description" label="Description">
          <Input.TextArea rows={2} placeholder="Optional description" />
        </Form.Item>
        <Form.Item name="documentCategory" label="Category">
          <Select
            placeholder="Optional category"
            allowClear
            options={CATEGORY_OPTIONS}
          />
        </Form.Item>
        <Form.Item>
          <Button
            type="primary"
            htmlType="submit"
            loading={loading}
            disabled={!file}
          >
            Upload
          </Button>
          <Button onClick={handleClose} style={{ marginLeft: 8 }}>
            Cancel
          </Button>
        </Form.Item>
      </Form>
    </Modal>
  );
}
