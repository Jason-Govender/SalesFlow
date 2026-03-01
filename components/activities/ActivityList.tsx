"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Table,
  Button,
  Space,
  Alert,
  Spin,
  Tag,
  Dropdown,
  Modal,
  Input,
} from "antd";
import type { MenuProps } from "antd";
import {
  PlusOutlined,
  MoreOutlined,
  EditOutlined,
  CheckOutlined,
  StopOutlined,
  DeleteOutlined,
} from "@ant-design/icons";
import { useAuthState } from "@/providers/auth-provider";
import { useActivitiesState, useActivitiesActions } from "@/providers/activities-provider";
import { useClientsState, useClientsActions } from "@/providers/clients-provider";
import type { IActivity } from "@/utils/activities-service";
import {
  ACTIVITY_TYPE_LABELS,
  ACTIVITY_STATUS_LABELS,
  PRIORITY_LABELS,
  ActivityType,
  ActivityStatus,
  RelatedToType,
} from "@/utils/activities-service";
import { ActivityFormModal, type ActivityFormValues } from "./ActivityFormModal";

const ROLES_CAN_DELETE_ACTIVITY: string[] = ["Admin", "SalesManager"];

interface ActivityListProps {
  relatedToType?: RelatedToType;
  relatedToId?: string;
  compact?: boolean;
  showCreateButton?: boolean;
}

export function ActivityList({
  relatedToType,
  relatedToId,
  compact = false,
  showCreateButton = true,
}: ActivityListProps) {
  const { session } = useAuthState();
  const userRoles = session?.user?.roles ?? [];
  const canDelete = userRoles.some((r) => ROLES_CAN_DELETE_ACTIVITY.includes(r));
  const router = useRouter();
  const { clients } = useClientsState();
  const { loadClients } = useClientsActions();

  const { items, isPending, isError, error, actionPending } = useActivitiesState();
  const {
    loadList,
    createActivity,
    updateActivity,
    completeActivity,
    cancelActivity,
    deleteActivity,
  } = useActivitiesActions();

  const [formModalOpen, setFormModalOpen] = useState(false);
  const [editingActivity, setEditingActivity] = useState<IActivity | null>(null);
  const [completeModalOpen, setCompleteModalOpen] = useState(false);
  const [completingId, setCompletingId] = useState<string | null>(null);
  const [outcome, setOutcome] = useState("");

  useEffect(() => {
    if (relatedToType != null && relatedToId) {
      loadList({ mode: "related", relatedToType, relatedToId });
    }
    // Intentionally omit loadList: it is recreated when provider state updates after load,
    // which would cause this effect to re-run and trigger an infinite reload loop.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [relatedToType, relatedToId]);

  const showClientColumn = relatedToType == null && relatedToId == null;
  useEffect(() => {
    if (showClientColumn && !clients?.length) {
      loadClients({ pageSize: 500 });
    }
  }, [showClientColumn, clients?.length, loadClients]);

  const clientIdToName = (clients ?? []).reduce<Record<string, string>>(
    (acc, c) => {
      acc[c.id] = c.name;
      return acc;
    },
    {}
  );

  const handleCreate = () => {
    setEditingActivity(null);
    setFormModalOpen(true);
  };

  const handleEdit = (activity: IActivity) => {
    setEditingActivity(activity);
    setFormModalOpen(true);
  };

  const handleFormSuccess = () => {
    setFormModalOpen(false);
    setEditingActivity(null);
    if (relatedToType != null && relatedToId) {
      loadList({ mode: "related", relatedToType, relatedToId });
    } else {
      loadList();
    }
  };

  const handleSubmitCreate = async (values: ActivityFormValues) => {
    await createActivity({
      type: values.type,
      subject: values.subject,
      description: values.description,
      priority: values.priority,
      dueDate: values.dueDate,
      relatedToType: values.relatedToType as RelatedToType | undefined,
      relatedToId: values.relatedToId,
      duration: values.duration,
      location: values.location,
    });
  };

  const handleSubmitUpdate = async (id: string, values: ActivityFormValues) => {
    await updateActivity(id, {
      type: values.type,
      subject: values.subject,
      description: values.description,
      priority: values.priority,
      dueDate: values.dueDate,
      relatedToType: values.relatedToType as RelatedToType | undefined,
      relatedToId: values.relatedToId,
      duration: values.duration,
      location: values.location,
    });
  };

  const openCompleteModal = (id: string) => {
    setCompletingId(id);
    setOutcome("");
    setCompleteModalOpen(true);
  };

  const handleCompleteConfirm = async () => {
    if (!completingId) return;
    try {
      await completeActivity(completingId, outcome || undefined);
      setCompleteModalOpen(false);
      setCompletingId(null);
      setOutcome("");
    } catch {
      // Error from provider
    }
  };

  const handleCancel = async (id: string) => {
    try {
      await cancelActivity(id);
    } catch {
      // Error from provider
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteActivity(id);
    } catch {
      // Error from provider
    }
  };

  const list = items ?? [];

  const columns = [
    {
      title: "Type",
      dataIndex: "type",
      key: "type",
      width: compact ? 100 : 120,
      render: (type: number) =>
        ACTIVITY_TYPE_LABELS[type as ActivityType] ?? type,
    },
    ...(showClientColumn
      ? [
          {
            title: "Client",
            key: "client",
            width: 160,
            render: (_: unknown, record: IActivity) => {
              if (
                record.relatedToType === RelatedToType.Client &&
                record.relatedToId
              ) {
                const name = clientIdToName[record.relatedToId] ?? record.relatedToId;
                return (
                  <a
                    onClick={(e) => {
                      e.stopPropagation();
                      router.push(`/clients/${record.relatedToId}`);
                    }}
                  >
                    {name}
                  </a>
                );
              }
              return "—";
            },
          },
        ]
      : []),
    {
      title: "Subject",
      dataIndex: "subject",
      key: "subject",
      ellipsis: true,
    },
    {
      title: "Due",
      dataIndex: "dueDate",
      key: "dueDate",
      width: compact ? 140 : 160,
      render: (val: string) => (val ? new Date(val).toLocaleString() : "—"),
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      width: 100,
      render: (status: number) => {
        const s = status as ActivityStatus;
        const color =
          s === ActivityStatus.Completed
            ? "green"
            : s === ActivityStatus.Cancelled
              ? "default"
              : "orange";
        return (
          <Tag color={color}>
            {ACTIVITY_STATUS_LABELS[s] ?? status}
          </Tag>
        );
      },
    },
    ...(compact
      ? []
      : [
          {
            title: "Priority",
            dataIndex: "priority",
            key: "priority",
            width: 90,
            render: (p: number) =>
              p != null ? (PRIORITY_LABELS[p as keyof typeof PRIORITY_LABELS] ?? p) : "—",
          },
        ]),
    {
      title: "",
      key: "actions",
      width: 80,
      render: (_: unknown, record: IActivity) => {
        const status = record.status as ActivityStatus;
        const isScheduled = status === ActivityStatus.Scheduled;
        const items: MenuProps["items"] = [];
        if (isScheduled) {
          items.push({
            key: "complete",
            icon: <CheckOutlined />,
            label: "Complete",
            onClick: () => openCompleteModal(record.id),
          });
          items.push({
            key: "cancel",
            icon: <StopOutlined />,
            label: "Cancel",
            onClick: () => handleCancel(record.id),
          });
        }
        items.push({
          key: "edit",
          icon: <EditOutlined />,
          label: "Edit",
          onClick: () => handleEdit(record),
        });
        if (canDelete) {
          items.push({
            key: "delete",
            icon: <DeleteOutlined />,
            label: "Delete",
            danger: true,
            onClick: () => handleDelete(record.id),
          });
        }
        return (
          <Dropdown menu={{ items }} trigger={["click"]}>
            <Button type="text" size="small" icon={<MoreOutlined />} />
          </Dropdown>
        );
      },
    },
  ];

  return (
    <>
      {showCreateButton && (
        <div style={{ marginBottom: 12 }}>
          <Button type="primary" icon={<PlusOutlined />} onClick={handleCreate}>
            New activity
          </Button>
        </div>
      )}
      {isError && error && (
        <Alert
          message="Error"
          description={error}
          type="error"
          showIcon
          style={{ marginBottom: 12 }}
        />
      )}
      {isPending ? (
        <Spin />
      ) : (
        <Table
          dataSource={list}
          rowKey="id"
          columns={columns}
          pagination={compact ? false : { pageSize: 10, showSizeChanger: true }}
          size={compact ? "small" : "middle"}
        />
      )}

      <ActivityFormModal
        open={formModalOpen}
        onClose={() => {
          setFormModalOpen(false);
          setEditingActivity(null);
        }}
        onSuccess={handleFormSuccess}
        activity={editingActivity}
        relatedToType={relatedToType}
        relatedToId={relatedToId}
        onSubmit={handleSubmitCreate}
        onUpdate={handleSubmitUpdate}
        loading={actionPending}
      />

      <Modal
        title="Complete activity"
        open={completeModalOpen}
        onOk={handleCompleteConfirm}
        onCancel={() => {
          setCompleteModalOpen(false);
          setCompletingId(null);
          setOutcome("");
        }}
        okText="Complete"
      >
        <p>Optionally add an outcome note:</p>
        <Input.TextArea
          rows={3}
          value={outcome}
          onChange={(e) => setOutcome(e.target.value)}
          placeholder="e.g. Client confirmed interest. Follow-up scheduled."
        />
      </Modal>
    </>
  );
}
