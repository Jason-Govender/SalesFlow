"use client";

import { useEffect, useState, useCallback } from "react";
import {
  Table,
  Button,
  Space,
  Alert,
  Spin,
  Dropdown,
  Modal,
} from "antd";
import type { MenuProps } from "antd";
import {
  PlusOutlined,
  MoreOutlined,
  DeleteOutlined,
  DownloadOutlined,
} from "@ant-design/icons";
import { useAuthState } from "@/providers/auth-provider";
import { useDocumentsState, useDocumentsActions } from "@/providers/documents-provider";
import type { IDocument } from "@/utils/documents-service";
import { DOCUMENT_CATEGORY_LABELS, DocumentCategory } from "@/utils/documents-service";
import { documentsService } from "@/utils/documents-service";
import { DocumentUploadModal } from "./DocumentUploadModal";

const ROLES_CAN_DELETE_DOCUMENT: string[] = ["Admin", "SalesManager"];

function formatDate(value: string | undefined): string {
  if (!value) return "—";
  try {
    return new Date(value).toLocaleDateString();
  } catch {
    return value;
  }
}

function getCategoryLabel(category: number | undefined): string {
  if (category == null) return "—";
  return DOCUMENT_CATEGORY_LABELS[category as DocumentCategory] ?? String(category);
}

function triggerDownload(blob: Blob, fileName: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = fileName || "document";
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

interface DocumentListProps {
  /** When set, list is scoped to this client. */
  clientId?: string;
  /** When set, list is scoped to this opportunity (takes precedence over clientId for loading). */
  opportunityId?: string;
}

export function DocumentList({ clientId, opportunityId }: DocumentListProps) {
  const { session } = useAuthState();
  const userRoles = session?.user?.roles ?? [];
  const canDeleteDocument = userRoles.some((r) =>
    ROLES_CAN_DELETE_DOCUMENT.includes(r)
  );

  const {
    documents,
    isPending,
    isError,
    error,
    actionPending,
  } = useDocumentsState();
  const {
    loadDocumentsByClient,
    loadDocumentsByOpportunity,
    clearDocuments,
    deleteDocument,
  } = useDocumentsActions();

  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);

  const handleDownload = useCallback(async (doc: IDocument) => {
    setDownloadingId(doc.id);
    try {
      const { blob, fileName } = await documentsService.downloadDocument(doc.id);
      const name = fileName || doc.fileName || "document";
      triggerDownload(blob, name);
    } catch {
      // Error is thrown; could show a message
    } finally {
      setDownloadingId(null);
    }
  }, []);

  useEffect(() => {
    if (opportunityId) {
      loadDocumentsByOpportunity(opportunityId);
    } else if (clientId) {
      loadDocumentsByClient(clientId);
    }
    return () => {
      clearDocuments();
    };
  }, [clientId, opportunityId, loadDocumentsByClient, loadDocumentsByOpportunity, clearDocuments]);

  const handleUploadSuccess = () => {
    setUploadModalOpen(false);
    if (opportunityId) loadDocumentsByOpportunity(opportunityId);
    else if (clientId) loadDocumentsByClient(clientId);
  };

  const handleDelete = (doc: IDocument) => {
    Modal.confirm({
      title: "Delete document",
      content: `Are you sure you want to delete "${doc.fileName || doc.id}"?`,
      okText: "Delete",
      okType: "danger",
      cancelText: "Cancel",
      onOk: async () => {
        await deleteDocument(doc.id);
      },
    });
  };

  const columns = [
    {
      title: "File name",
      dataIndex: "fileName",
      key: "fileName",
      render: (val: string, record: IDocument) => (
        <a
          onClick={(e) => {
            e.stopPropagation();
            if (downloadingId !== record.id) handleDownload(record);
          }}
          style={{ pointerEvents: downloadingId === record.id ? "none" : undefined }}
        >
          {val || "—"}
        </a>
      ),
    },
    {
      title: "Description",
      dataIndex: "description",
      key: "description",
      render: (val: string) => val || "—",
    },
    {
      title: "Category",
      dataIndex: "documentCategory",
      key: "documentCategory",
      render: (val: number) => getCategoryLabel(val),
    },
    {
      title: "Date",
      key: "date",
      render: (_: unknown, record: IDocument) =>
        formatDate(record.uploadedAt ?? record.createdAt),
    },
    {
      title: "",
      key: "actions",
      width: 80,
      render: (_: unknown, record: IDocument) => {
        const items: MenuProps["items"] = [
          {
            key: "download",
            icon: <DownloadOutlined />,
            label: "Download",
            onClick: (e: unknown) => {
              (e as { domEvent?: { stopPropagation?: () => void } }).domEvent?.stopPropagation?.();
              handleDownload(record);
            },
            disabled: downloadingId === record.id,
          },
          ...(canDeleteDocument
            ? [
                {
                  key: "delete",
                  icon: <DeleteOutlined />,
                  label: "Delete",
                  danger: true,
                  onClick: (e: unknown) => {
                    (e as { domEvent?: { stopPropagation?: () => void } }).domEvent?.stopPropagation?.();
                    handleDelete(record);
                  },
                },
              ]
            : []),
        ];
        return (
          <Dropdown
            menu={{ items }}
            trigger={["click"]}
          >
            <Button
              type="text"
              size="small"
              icon={<MoreOutlined />}
              loading={downloadingId === record.id}
              onClick={(e) => e.stopPropagation()}
            />
          </Dropdown>
        );
      },
    },
  ];

  if (isPending && !documents?.length) {
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
              onClick={() =>
                opportunityId
                  ? loadDocumentsByOpportunity(opportunityId)
                  : clientId
                    ? loadDocumentsByClient(clientId)
                    : undefined
              }
            >
              Retry
            </Button>
          }
        />
      )}
      <div style={{ display: "flex", justifyContent: "flex-end" }}>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => setUploadModalOpen(true)}
        >
          Upload document
        </Button>
      </div>
      <Table
        loading={isPending}
        dataSource={documents ?? []}
        rowKey="id"
        columns={columns}
        pagination={false}
        onRow={(record) => ({
          onClick: () => {
            if (!downloadingId) handleDownload(record);
          },
          style: { cursor: downloadingId ? "wait" : "pointer" },
        })}
      />
      <DocumentUploadModal
        open={uploadModalOpen}
        onClose={() => setUploadModalOpen(false)}
        onSuccess={handleUploadSuccess}
        clientId={clientId}
        opportunityId={opportunityId}
        loading={actionPending}
      />
    </Space>
  );
}
