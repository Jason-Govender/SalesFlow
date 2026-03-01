"use client";

import { Modal, Form, Input, InputNumber } from "antd";
import type { IProposalLineItem, ICreateLineItemRequest } from "@/utils/proposals-service";

interface LineItemFormModalProps {
  open: boolean;
  title: string;
  initialValues?: Partial<IProposalLineItem> | null;
  onSave: (values: ICreateLineItemRequest) => Promise<void>;
  onCancel: () => void;
  loading?: boolean;
}

const defaultInitial: ICreateLineItemRequest = {
  productServiceName: "",
  description: "",
  quantity: 1,
  unitPrice: 0,
  discount: 0,
  taxRate: 0,
};

export function LineItemFormModal({
  open,
  title,
  initialValues,
  onSave,
  onCancel,
  loading = false,
}: LineItemFormModalProps) {
  const [form] = Form.useForm();

  const values: ICreateLineItemRequest = initialValues
    ? {
        productServiceName: initialValues.productServiceName ?? "",
        description: initialValues.description ?? "",
        quantity: initialValues.quantity ?? 1,
        unitPrice: initialValues.unitPrice ?? 0,
        discount: initialValues.discount ?? 0,
        taxRate: initialValues.taxRate ?? 0,
      }
    : defaultInitial;

  const handleOk = async () => {
    const v = await form.validateFields();
    await onSave(v);
    form.resetFields();
    onCancel();
  };

  const handleCancel = () => {
    form.resetFields();
    onCancel();
  };

  return (
    <Modal
      title={title}
      open={open}
      onOk={handleOk}
      onCancel={handleCancel}
      confirmLoading={loading}
      destroyOnClose
      width={520}
    >
      <Form form={form} layout="vertical" initialValues={values}>
        <Form.Item
          name="productServiceName"
          label="Product / Service name"
          rules={[{ required: true, message: "Required" }]}
        >
          <Input placeholder="e.g. Implementation" />
        </Form.Item>
        <Form.Item name="description" label="Description">
          <Input.TextArea rows={2} placeholder="Description" />
        </Form.Item>
        <Form.Item
          name="quantity"
          label="Quantity"
          rules={[{ required: true }]}
        >
          <InputNumber min={0.01} step={1} style={{ width: "100%" }} />
        </Form.Item>
        <Form.Item
          name="unitPrice"
          label="Unit price"
          rules={[{ required: true }]}
        >
          <InputNumber min={0} step={100} style={{ width: "100%" }} />
        </Form.Item>
        <Form.Item name="discount" label="Discount %">
          <InputNumber min={0} max={100} step={1} style={{ width: "100%" }} />
        </Form.Item>
        <Form.Item name="taxRate" label="Tax rate %">
          <InputNumber min={0} max={100} step={0.5} style={{ width: "100%" }} />
        </Form.Item>
      </Form>
    </Modal>
  );
}
