"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { Card, Button, Space, Alert, Spin, Typography, Tabs, Statistic, Row, Col, Modal, Form, Input, Select } from "antd";
import { ArrowLeftOutlined, EditOutlined, DeleteOutlined } from "@ant-design/icons";
import { useAuthState } from "@/providers/auth-provider";
import { useClientsState, useClientsActions } from "@/providers/clients-provider";
import { CLIENT_TYPE_LABELS, ClientType } from "@/utils/clients-service";
import type { IUpdateClientRequest } from "@/utils/clients-service";
import { ContactList } from "@/components/contacts/ContactList";
import { OpportunityList } from "@/components/opportunities/OpportunityList";
import { useAppPageStyles } from "../../pageStyles";

const { Title, Text } = Typography;

const ROLES_CAN_DELETE_CLIENT: string[] = ["Admin", "SalesManager"];

const CLIENT_TYPE_OPTIONS = [
  { value: ClientType.Government, label: CLIENT_TYPE_LABELS[ClientType.Government] },
  { value: ClientType.Private, label: CLIENT_TYPE_LABELS[ClientType.Private] },
  { value: ClientType.Partner, label: CLIENT_TYPE_LABELS[ClientType.Partner] },
];

function formatCurrency(value: number): string {
  return new Intl.NumberFormat("en-ZA", {
    style: "currency",
    currency: "ZAR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

export default function ClientDetailPage() {
  const { styles } = useAppPageStyles();
  const router = useRouter();
  const params = useParams();
  const id = params?.id as string | undefined;

  const { session } = useAuthState();
  const userRoles = session?.user?.roles ?? [];
  const canDeleteClient = userRoles.some((r) => ROLES_CAN_DELETE_CLIENT.includes(r));

  const {
    selectedClient,
    clientStats,
    isPending,
    isError,
    error,
    actionPending,
  } = useClientsState();
  const {
    loadClient,
    loadClientStats,
    clearSelectedClient,
    updateClient,
    deleteClient,
  } = useClientsActions();

  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editError, setEditError] = useState<string | null>(null);
  const [form] = Form.useForm();

  useEffect(() => {
    if (id) {
      loadClient(id);
      loadClientStats(id);
    }
    return () => {
      clearSelectedClient();
    };
  }, [id]);

  const openEditModal = () => {
    if (!selectedClient) return;
    setEditError(null);
    form.setFieldsValue({
      name: selectedClient.name,
      industry: selectedClient.industry ?? "",
      clientType: selectedClient.clientType,
      website: selectedClient.website ?? "",
      billingAddress: selectedClient.billingAddress ?? "",
      taxNumber: selectedClient.taxNumber ?? "",
      companySize: selectedClient.companySize ?? "",
      isActive: selectedClient.isActive !== false,
    });
    setEditModalOpen(true);
  };

  const handleEditFinish = async (values: {
    name: string;
    industry?: string;
    clientType: ClientType | number;
    website?: string;
    billingAddress?: string;
    taxNumber?: string;
    companySize?: string;
    isActive: boolean;
  }) => {
    if (!id) return;
    setEditError(null);
    try {
      const body: IUpdateClientRequest = {
        name: values.name.trim(),
        industry: values.industry?.trim() || undefined,
        clientType: values.clientType,
        website: values.website?.trim() || undefined,
        billingAddress: values.billingAddress?.trim() || undefined,
        taxNumber: values.taxNumber?.trim() || undefined,
        companySize: values.companySize?.trim() || undefined,
        isActive: values.isActive,
      };
      await updateClient(id, body);
      setEditModalOpen(false);
    } catch (e) {
      setEditError(e instanceof Error ? e.message : "Failed to update client");
    }
  };

  const handleDelete = () => {
    if (!id) return;
    Modal.confirm({
      title: "Soft-delete client",
      content: "Are you sure you want to soft-delete this client?",
      okText: "Delete",
      okType: "danger",
      cancelText: "Cancel",
      onOk: async () => {
        await deleteClient(id);
        router.push("/clients");
      },
    });
  };

  if (isPending && !selectedClient) {
    return (
      <div style={{ display: "flex", justifyContent: "center", minHeight: "50vh", alignItems: "center" }}>
        <Spin size="large" />
      </div>
    );
  }

  if (isError && error) {
    return (
      <div>
        <Button type="link" icon={<ArrowLeftOutlined />} onClick={() => router.push("/clients")}>
          Back to clients
        </Button>
        <Alert
          message="Error"
          description={error}
          type="error"
          showIcon
          style={{ marginTop: 16 }}
        />
      </div>
    );
  }

  if (!selectedClient || selectedClient.id !== id) {
    return (
      <div>
        <Button type="link" icon={<ArrowLeftOutlined />} onClick={() => router.push("/clients")}>
          Back to clients
        </Button>
        <Alert
          message="Client not found"
          description="The client may have been removed or the link is invalid."
          type="warning"
          showIcon
          style={{ marginTop: 16 }}
        />
      </div>
    );
  }

  const client = selectedClient;
  const typeLabel = CLIENT_TYPE_LABELS[client.clientType as ClientType] ?? client.clientType;

  return (
    <div>
      <Space direction="vertical" size="middle" style={{ width: "100%" }}>
        <Space wrap>
          <Link href="/clients">
            <Button type="link" icon={<ArrowLeftOutlined />}>
              Back to clients
            </Button>
          </Link>
          <Button
            type="primary"
            icon={<EditOutlined />}
            onClick={openEditModal}
            loading={actionPending}
          >
            Edit
          </Button>
          {canDeleteClient && (
            <Button
              danger
              icon={<DeleteOutlined />}
              onClick={handleDelete}
              loading={actionPending}
            >
              Delete
            </Button>
          )}
        </Space>

        <Card>
          <Space direction="vertical" size="small" style={{ width: "100%" }}>
            <Title level={4} style={{ margin: 0 }}>
              {client.name}
            </Title>
            <Space wrap>
              {client.industry && <Text type="secondary">Industry: {client.industry}</Text>}
              <Text type="secondary">Type: {typeLabel}</Text>
              {client.website && (
                <a href={client.website} target="_blank" rel="noopener noreferrer">
                  {client.website}
                </a>
              )}
              {client.companySize && <Text type="secondary">Size: {client.companySize}</Text>}
              <Text type="secondary">
                Status: {client.isActive !== false ? "Active" : "Inactive"}
              </Text>
            </Space>
            {client.billingAddress && (
              <Text type="secondary">Address: {client.billingAddress}</Text>
            )}
            {client.taxNumber && (
              <Text type="secondary">Tax number: {client.taxNumber}</Text>
            )}
          </Space>
        </Card>

        {clientStats && (
          <Card title="Statistics">
            <Row gutter={24}>
              {clientStats.opportunityCount != null && (
                <Col span={8}>
                  <Statistic title="Opportunities" value={clientStats.opportunityCount} />
                </Col>
              )}
              {clientStats.contractCount != null && (
                <Col span={8}>
                  <Statistic title="Contracts" value={clientStats.contractCount} />
                </Col>
              )}
              {clientStats.totalContractValue != null && (
                <Col span={8}>
                  <Statistic
                    title="Total contract value"
                    value={formatCurrency(clientStats.totalContractValue)}
                  />
                </Col>
              )}
            </Row>
          </Card>
        )}

        <Card>
          <Tabs
            defaultActiveKey="contacts"
            items={[
              { key: "contacts", label: "Contacts", children: id ? <ContactList clientId={id} /> : null },
              { key: "opportunities", label: "Opportunities", children: id ? <OpportunityList clientId={id} /> : null },
              { key: "contracts", label: "Contracts", children: <Text type="secondary">Coming soon</Text> },
              { key: "documents", label: "Documents", children: <Text type="secondary">Coming soon</Text> },
              { key: "notes", label: "Notes", children: <Text type="secondary">Coming soon</Text> },
            ]}
          />
        </Card>
      </Space>

      <Modal
        title="Edit client"
        open={editModalOpen}
        onCancel={() => setEditModalOpen(false)}
        footer={null}
        destroyOnClose
      >
        {editError && (
          <Alert
            message={editError}
            type="error"
            showIcon
            closable
            onClose={() => setEditError(null)}
            style={{ marginBottom: 16 }}
          />
        )}
        <Form
          form={form}
          layout="vertical"
          onFinish={handleEditFinish}
        >
          <Form.Item
            name="name"
            label="Name"
            rules={[{ required: true, message: "Name is required" }]}
          >
            <Input placeholder="Client or company name" />
          </Form.Item>
          <Form.Item name="industry" label="Industry">
            <Input placeholder="e.g. Technology, Finance" />
          </Form.Item>
          <Form.Item
            name="clientType"
            label="Client type"
            rules={[{ required: true, message: "Client type is required" }]}
          >
            <Select options={CLIENT_TYPE_OPTIONS} placeholder="Select type" />
          </Form.Item>
          <Form.Item name="website" label="Website">
            <Input placeholder="https://..." />
          </Form.Item>
          <Form.Item name="billingAddress" label="Billing address">
            <Input.TextArea rows={2} placeholder="Address" />
          </Form.Item>
          <Form.Item name="taxNumber" label="Tax number">
            <Input placeholder="Tax / VAT number" />
          </Form.Item>
          <Form.Item name="companySize" label="Company size">
            <Input placeholder="e.g. 50 - 100" />
          </Form.Item>
          <Form.Item
            name="isActive"
            label="Status"
            rules={[{ required: true }]}
          >
            <Select
              options={[
                { value: true, label: "Active" },
                { value: false, label: "Inactive" },
              ]}
            />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" loading={actionPending}>
              Save
            </Button>
            <Button onClick={() => setEditModalOpen(false)} style={{ marginLeft: 8 }}>
              Cancel
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
