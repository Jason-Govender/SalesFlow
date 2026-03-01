"use client";

import { useEffect, useState } from "react";
import {
  Table,
  Button,
  Space,
  Alert,
  Spin,
  Tag,
  Dropdown,
  Modal,
} from "antd";
import type { MenuProps } from "antd";
import {
  PlusOutlined,
  MoreOutlined,
  EditOutlined,
  DeleteOutlined,
  CheckOutlined,
  StopOutlined,
} from "@ant-design/icons";
import { useAuthState } from "@/providers/auth-provider";
import { useContractsState, useContractsActions } from "@/providers/contracts-provider";
import type { IContract } from "@/utils/contracts-service";
import {
  ContractStatus,
  CONTRACT_STATUS_LABELS,
} from "@/utils/contracts-service";
import type { ContractFormValues } from "./ContractFormModal";
import { ContractFormModal } from "./ContractFormModal";

const ROLES_CAN_ACTIVATE_OR_CANCEL: string[] = ["Admin", "SalesManager"];
const ROLES_CAN_DELETE: string[] = ["Admin"];

function formatCurrency(value: number, currency = "ZAR"): string {
  return new Intl.NumberFormat("en-ZA", {
    style: "currency",
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

interface ContractListProps {
  clientId: string;
}

export function ContractList({ clientId }: ContractListProps) {
  const { session } = useAuthState();
  const userRoles = session?.user?.roles ?? [];
  const canActivateOrCancel = userRoles.some((r) =>
    ROLES_CAN_ACTIVATE_OR_CANCEL.includes(r)
  );
  const canDelete = userRoles.some((r) => ROLES_CAN_DELETE.includes(r));

  const {
    contracts,
    isPending,
    isError,
    error,
    actionPending,
  } = useContractsState();
  const {
    loadContractsByClient,
    clearContracts,
    createContract,
    updateContract,
    activateContract,
    cancelContract,
    deleteContract,
  } = useContractsActions();

  const [formModalOpen, setFormModalOpen] = useState(false);
  const [editingContract, setEditingContract] = useState<IContract | null>(null);

  useEffect(() => {
    if (clientId) {
      loadContractsByClient(clientId);
    }
    return () => {
      clearContracts();
    };
  }, [clientId, loadContractsByClient, clearContracts]);

  const handleAdd = () => {
    setEditingContract(null);
    setFormModalOpen(true);
  };

  const handleEdit = (record: IContract) => {
    setEditingContract(record);
    setFormModalOpen(true);
  };

  const handleFormSuccess = () => {
    setFormModalOpen(false);
    setEditingContract(null);
    if (clientId) loadContractsByClient(clientId);
  };

  const handleCreateSubmit = async (values: ContractFormValues) => {
    await createContract(clientId, {
      title: values.title,
      contractValue: values.contractValue ?? 0,
      currency: values.currency,
      startDate: values.startDate ?? "",
      endDate: values.endDate ?? "",
      opportunityId: values.opportunityId || undefined,
      proposalId: values.proposalId || undefined,
      ownerId: values.ownerId || undefined,
      renewalNoticePeriod: values.renewalNoticePeriod,
      autoRenew: values.autoRenew,
      terms: values.terms,
    });
  };

  const handleUpdateSubmit = async (id: string, values: ContractFormValues) => {
    await updateContract(id, {
      title: values.title,
      contractValue: values.contractValue,
      currency: values.currency,
      startDate: values.startDate,
      endDate: values.endDate,
      ownerId: values.ownerId || undefined,
      renewalNoticePeriod: values.renewalNoticePeriod,
      autoRenew: values.autoRenew,
      terms: values.terms,
    });
  };

  const handleActivate = (record: IContract) => {
    Modal.confirm({
      title: "Activate contract",
      content: `Activate "${record.title}"? Status will change to Active.`,
      okText: "Activate",
      cancelText: "Cancel",
      onOk: async () => {
        await activateContract(record.id);
        if (clientId) loadContractsByClient(clientId);
      },
    });
  };

  const handleCancel = (record: IContract) => {
    Modal.confirm({
      title: "Cancel contract",
      content: `Are you sure you want to cancel "${record.title}"?`,
      okText: "Cancel contract",
      okType: "danger",
      cancelText: "Back",
      onOk: async () => {
        await cancelContract(record.id);
        if (clientId) loadContractsByClient(clientId);
      },
    });
  };

  const handleDelete = (record: IContract) => {
    Modal.confirm({
      title: "Delete contract",
      content: `Are you sure you want to delete "${record.title}"? This action cannot be undone.`,
      okText: "Delete",
      okType: "danger",
      cancelText: "Cancel",
      onOk: async () => {
        await deleteContract(record.id);
        if (clientId) loadContractsByClient(clientId);
      },
    });
  };

  const getStatusColor = (status: ContractStatus): string => {
    switch (status) {
      case ContractStatus.Draft:
        return "default";
      case ContractStatus.Active:
        return "green";
      case ContractStatus.Expired:
        return "orange";
      case ContractStatus.Renewed:
        return "orange";
      case ContractStatus.Cancelled:
        return "red";
      default:
        return "default";
    }
  };

  const columns = [
    {
      title: "Title",
      dataIndex: "title",
      key: "title",
      render: (val: string) => val || "—",
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (status: number) => {
        const label = CONTRACT_STATUS_LABELS[status as ContractStatus] ?? status;
        return <Tag color={getStatusColor(status as ContractStatus)}>{label}</Tag>;
      },
    },
    {
      title: "Value",
      key: "value",
      render: (_: unknown, record: IContract) =>
        record.contractValue != null
          ? formatCurrency(record.contractValue, record.currency)
          : "—",
    },
    {
      title: "Start date",
      dataIndex: "startDate",
      key: "startDate",
      render: (val: string) => (val ? val.split("T")[0] : "—"),
    },
    {
      title: "End date",
      dataIndex: "endDate",
      key: "endDate",
      render: (val: string) => (val ? val.split("T")[0] : "—"),
    },
    {
      title: "",
      key: "actions",
      width: 80,
      render: (_: unknown, record: IContract) => {
        const status = record.status as ContractStatus;
        const items: MenuProps["items"] = [
          {
            key: "edit",
            icon: <EditOutlined />,
            label: "Edit",
            onClick: () => handleEdit(record),
          },
          ...(canActivateOrCancel && status === ContractStatus.Draft
            ? [
                {
                  key: "activate",
                  icon: <CheckOutlined />,
                  label: "Activate",
                  onClick: () => handleActivate(record),
                },
              ]
            : []),
          ...(canActivateOrCancel &&
          (status === ContractStatus.Draft || status === ContractStatus.Active)
            ? [
                {
                  key: "cancel",
                  icon: <StopOutlined />,
                  label: "Cancel contract",
                  danger: true,
                  onClick: () => handleCancel(record),
                },
              ]
            : []),
          ...(canDelete
            ? [
                {
                  key: "delete",
                  icon: <DeleteOutlined />,
                  label: "Delete",
                  danger: true,
                  onClick: () => handleDelete(record),
                },
              ]
            : []),
        ];
        return (
          <Dropdown menu={{ items }} trigger={["click"]}>
            <Button type="text" size="small" icon={<MoreOutlined />} />
          </Dropdown>
        );
      },
    },
  ];

  if (isPending && !contracts?.length) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          minHeight: 120,
          alignItems: "center",
        }}
      >
        <Spin />
      </div>
    );
  }

  return (
    <Space direction="vertical" size="middle" style={{ width: "100%" }}>
      {isError && error && (
        <Alert
          message="Error"
          description={error}
          type="error"
          showIcon
          action={
            <Button
              type="link"
              size="small"
              onClick={() => clientId && loadContractsByClient(clientId)}
            >
              Retry
            </Button>
          }
        />
      )}
      <div style={{ display: "flex", justifyContent: "flex-end" }}>
        <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
          Add contract
        </Button>
      </div>
      <Table
        loading={isPending}
        dataSource={contracts ?? []}
        rowKey="id"
        columns={columns}
        pagination={false}
      />
      <ContractFormModal
        open={formModalOpen}
        onClose={() => {
          setFormModalOpen(false);
          setEditingContract(null);
        }}
        onSuccess={handleFormSuccess}
        clientId={clientId}
        contract={editingContract}
        onSubmit={handleCreateSubmit}
        onUpdate={handleUpdateSubmit}
        loading={actionPending}
      />
    </Space>
  );
}
