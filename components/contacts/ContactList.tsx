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
import { PlusOutlined, MoreOutlined, EditOutlined, UserOutlined, DeleteOutlined } from "@ant-design/icons";
import { useAuthState } from "@/providers/auth-provider";
import { useContactsState, useContactsActions } from "@/providers/contacts-provider";
import type { IContact } from "@/utils/contacts-service";
import type { ContactFormValues } from "./ContactFormModal";
import { ContactFormModal } from "./ContactFormModal";

const ROLES_CAN_DELETE_CONTACT: string[] = ["Admin", "SalesManager", "BDM"];

interface ContactListProps {
  clientId: string;
}

export function ContactList({ clientId }: ContactListProps) {
  const { session } = useAuthState();
  const userRoles = session?.user?.roles ?? [];
  const canDeleteContact = userRoles.some((r) =>
    ROLES_CAN_DELETE_CONTACT.includes(r)
  );

  const {
    contacts,
    isPending,
    isError,
    error,
    actionPending,
  } = useContactsState();
  const {
    loadContactsByClient,
    clearContacts,
    createContact,
    updateContact,
    setPrimaryContact,
    deleteContact,
  } = useContactsActions();

  const [modalOpen, setModalOpen] = useState(false);
  const [editingContact, setEditingContact] = useState<IContact | null>(null);

  useEffect(() => {
    if (clientId) {
      loadContactsByClient(clientId);
    }
    return () => {
      clearContacts();
    };
  }, [clientId, loadContactsByClient, clearContacts]);

  const handleAdd = () => {
    setEditingContact(null);
    setModalOpen(true);
  };

  const handleEdit = (contact: IContact) => {
    setEditingContact(contact);
    setModalOpen(true);
  };

  const handleModalSuccess = () => {
    setModalOpen(false);
    setEditingContact(null);
    if (clientId) loadContactsByClient(clientId);
  };

  const handleSetPrimary = (contact: IContact) => {
    setPrimaryContact(contact.id);
  };

  const handleDelete = (contact: IContact) => {
    Modal.confirm({
      title: "Delete contact",
      content: `Are you sure you want to delete ${contact.firstName} ${contact.lastName}?`,
      okText: "Delete",
      okType: "danger",
      cancelText: "Cancel",
      onOk: async () => {
        await deleteContact(contact.id);
      },
    });
  };

  const columns = [
    {
      title: "Name",
      key: "name",
      render: (_: unknown, record: IContact) =>
        `${record.firstName} ${record.lastName}`.trim() || "—",
    },
    {
      title: "Email",
      dataIndex: "email",
      key: "email",
      render: (val: string) => val || "—",
    },
    {
      title: "Phone",
      dataIndex: "phoneNumber",
      key: "phoneNumber",
      render: (val: string) => val || "—",
    },
    {
      title: "Position",
      dataIndex: "position",
      key: "position",
      render: (val: string) => val || "—",
    },
    {
      title: "Primary",
      key: "primary",
      render: (_: unknown, record: IContact) =>
        record.isPrimaryContact ? (
          <Tag color="blue">Primary</Tag>
        ) : null,
    },
    {
      title: "",
      key: "actions",
      width: 80,
      render: (_: unknown, record: IContact) => {
        const items: MenuProps["items"] = [
          {
            key: "edit",
            icon: <EditOutlined />,
            label: "Edit",
            onClick: () => handleEdit(record),
          },
          ...(record.isPrimaryContact
            ? []
            : [
                {
                  key: "setPrimary",
                  icon: <UserOutlined />,
                  label: "Set as primary",
                  onClick: () => handleSetPrimary(record),
                },
              ]),
          ...(canDeleteContact
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

  if (isPending && !contacts?.length) {
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
              onClick={() => loadContactsByClient(clientId)}
            >
              Retry
            </Button>
          }
        />
      )}
      <div style={{ display: "flex", justifyContent: "flex-end" }}>
        <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
          Add contact
        </Button>
      </div>
      <Table
        loading={isPending}
        dataSource={contacts ?? []}
        rowKey="id"
        columns={columns}
        pagination={false}
      />
      <ContactFormModal
        open={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setEditingContact(null);
        }}
        onSuccess={handleModalSuccess}
        clientId={clientId}
        contact={editingContact}
        onSubmit={async (cid, values: ContactFormValues) =>
          createContact(cid, values)
        }
        onUpdate={async (id, values: ContactFormValues) =>
          updateContact(id, values)
        }
        loading={actionPending}
      />
    </Space>
  );
}
