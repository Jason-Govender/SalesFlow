"use client";

import { useEffect, useState } from "react";
import {
  Table,
  Button,
  Space,
  Alert,
  Spin,
  Dropdown,
  Modal,
  Form,
  Input,
  Checkbox,
  Tag,
} from "antd";
import type { MenuProps } from "antd";
import { PlusOutlined, MoreOutlined, EditOutlined, DeleteOutlined } from "@ant-design/icons";
import { useAuthState } from "@/providers/auth-provider";
import { useNotesState, useNotesActions } from "@/providers/notes-provider";
import type { INote } from "@/utils/notes-service";

const MAX_CONTENT_PREVIEW = 80;

function formatDate(value: string | undefined): string {
  if (!value) return "—";
  try {
    return new Date(value).toLocaleString();
  } catch {
    return value;
  }
}

function truncate(str: string, max: number): string {
  if (!str) return "—";
  if (str.length <= max) return str;
  return str.slice(0, max) + "…";
}

interface NoteListProps {
  clientId: string;
}

export function NoteList({ clientId }: NoteListProps) {
  const { session } = useAuthState();
  const currentUserId = session?.user?.userId;

  const { notes, isPending, isError, error, actionPending } = useNotesState();
  const {
    loadNotesByClient,
    clearNotes,
    createNote,
    updateNote,
    deleteNote,
  } = useNotesActions();

  const [formModalOpen, setFormModalOpen] = useState(false);
  const [editingNote, setEditingNote] = useState<INote | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [form] = Form.useForm();

  useEffect(() => {
    if (clientId) {
      loadNotesByClient(clientId);
    }
    return () => {
      clearNotes();
    };
  }, [clientId, loadNotesByClient, clearNotes]);

  const handleAdd = () => {
    setEditingNote(null);
    setFormError(null);
    form.setFieldsValue({ content: "", isPrivate: false });
    setFormModalOpen(true);
  };

  const handleEdit = (note: INote) => {
    setEditingNote(note);
    setFormError(null);
    form.setFieldsValue({
      content: note.content ?? "",
      isPrivate: note.isPrivate ?? false,
    });
    setFormModalOpen(true);
  };

  const handleFormFinish = async (values: { content: string; isPrivate?: boolean }) => {
    setFormError(null);
    const content = values.content?.trim();
    if (!content) return;
    try {
      if (editingNote) {
        await updateNote(editingNote.id, { content, isPrivate: values.isPrivate ?? false });
      } else {
        await createNote({
          content,
          clientId,
          isPrivate: values.isPrivate ?? false,
        });
      }
      form.resetFields();
      setFormModalOpen(false);
      setEditingNote(null);
    } catch (e) {
      setFormError(e instanceof Error ? e.message : "Something went wrong.");
    }
  };

  const handleDelete = (note: INote) => {
    Modal.confirm({
      title: "Delete note",
      content: "Are you sure you want to delete this note?",
      okText: "Delete",
      okType: "danger",
      cancelText: "Cancel",
      onOk: async () => {
        await deleteNote(note.id);
      },
    });
  };

  const canEditNote = (note: INote): boolean => {
    if (note.createdById && currentUserId) return note.createdById === currentUserId;
    return true;
  };

  const list = notes ?? [];

  const columns = [
    {
      title: "Content",
      key: "content",
      render: (_: unknown, record: INote) => truncate(record.content ?? "", MAX_CONTENT_PREVIEW),
    },
    {
      title: "Date",
      key: "date",
      width: 180,
      render: (_: unknown, record: INote) => formatDate(record.createdAt),
    },
    {
      title: "Private",
      key: "isPrivate",
      width: 80,
      render: (_: unknown, record: INote) =>
        record.isPrivate ? <Tag color="default">Private</Tag> : null,
    },
    {
      title: "",
      key: "actions",
      width: 80,
      render: (_: unknown, record: INote) => {
        const items: MenuProps["items"] = [
          ...(canEditNote(record)
            ? [
                {
                  key: "edit",
                  icon: <EditOutlined />,
                  label: "Edit",
                  onClick: () => handleEdit(record),
                },
              ]
            : []),
          {
            key: "delete",
            icon: <DeleteOutlined />,
            label: "Delete",
            danger: true,
            onClick: () => handleDelete(record),
          },
        ];
        return (
          <Dropdown menu={{ items }} trigger={["click"]}>
            <Button type="text" size="small" icon={<MoreOutlined />} />
          </Dropdown>
        );
      },
    },
  ];

  if (isPending && !list.length) {
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
            <Button type="link" size="small" onClick={() => loadNotesByClient(clientId)}>
              Retry
            </Button>
          }
        />
      )}
      <div style={{ display: "flex", justifyContent: "flex-end" }}>
        <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
          Add note
        </Button>
      </div>
      <Table
        loading={isPending}
        dataSource={list}
        rowKey="id"
        columns={columns}
        pagination={false}
      />
      <Modal
        title={editingNote ? "Edit note" : "Add note"}
        open={formModalOpen}
        onCancel={() => {
          setFormModalOpen(false);
          setEditingNote(null);
          setFormError(null);
        }}
        footer={null}
        destroyOnClose
      >
        {formError && (
          <Alert
            message={formError}
            type="error"
            showIcon
            closable
            onClose={() => setFormError(null)}
            style={{ marginBottom: 16 }}
          />
        )}
        <Form form={form} layout="vertical" onFinish={handleFormFinish}>
          <Form.Item
            name="content"
            label="Content"
            rules={[{ required: true, message: "Content is required" }]}
          >
            <Input.TextArea rows={4} placeholder="Note content" />
          </Form.Item>
          <Form.Item name="isPrivate" valuePropName="checked">
            <Checkbox>Private (only visible to you)</Checkbox>
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" loading={actionPending}>
              {editingNote ? "Save" : "Add"}
            </Button>
            <Button
              onClick={() => {
                setFormModalOpen(false);
                setEditingNote(null);
              }}
              style={{ marginLeft: 8 }}
            >
              Cancel
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </Space>
  );
}
