"use client";

import { Table, Button, Space } from "antd";
import {
  computeLineTotal,
  type IProposalLineItem,
  type IProposal,
} from "@/utils/proposals-service";
import { ProposalStatus } from "@/utils/proposals-service";

function formatCurrency(value: number, currency: string = "ZAR"): string {
  return new Intl.NumberFormat("en-ZA", {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

interface ProposalLineItemTableProps {
  proposal: IProposal;
  onAddLineItem: () => void;
  onEditLineItem?: (item: IProposalLineItem) => void;
  onRemoveLineItem?: (lineItemId: string) => void;
  actionPending?: boolean;
}

export function ProposalLineItemTable({
  proposal,
  onAddLineItem,
  onEditLineItem,
  onRemoveLineItem,
  actionPending = false,
}: ProposalLineItemTableProps) {
  const isDraft = proposal.status === ProposalStatus.Draft;
  const currency = proposal.currency ?? "ZAR";
  const items = proposal.lineItems ?? [];

  const columns = [
    {
      title: "Product / Service",
      dataIndex: "productServiceName",
      key: "productServiceName",
      render: (val: string) => val || "—",
    },
    {
      title: "Description",
      dataIndex: "description",
      key: "description",
      render: (val: string) => val || "—",
    },
    {
      title: "Qty",
      dataIndex: "quantity",
      key: "quantity",
      width: 80,
      render: (val: number) => (val != null ? val : "—"),
    },
    {
      title: "Unit price",
      dataIndex: "unitPrice",
      key: "unitPrice",
      render: (val: number) => (val != null ? formatCurrency(val, currency) : "—"),
    },
    {
      title: "Discount %",
      dataIndex: "discount",
      key: "discount",
      width: 90,
      render: (val: number) => (val != null ? `${val}%` : "—"),
    },
    {
      title: "Tax %",
      dataIndex: "taxRate",
      key: "taxRate",
      width: 80,
      render: (val: number) => (val != null ? `${val}%` : "—"),
    },
    {
      title: "Line total",
      key: "lineTotal",
      render: (_: unknown, record: IProposalLineItem) => {
        const total =
          record.lineTotal ??
          computeLineTotal(
            record.quantity,
            record.unitPrice,
            record.discount,
            record.taxRate
          );
        return formatCurrency(total, currency);
      },
    },
    ...(isDraft && (onEditLineItem || onRemoveLineItem)
      ? [
          {
            title: "Actions",
            key: "actions",
            width: 120,
            render: (_: unknown, record: IProposalLineItem) => (
              <Space>
                {onEditLineItem && (
                  <Button
                    type="link"
                    size="small"
                    onClick={(e) => {
                      e.stopPropagation();
                      onEditLineItem(record);
                    }}
                  >
                    Edit
                  </Button>
                )}
                {onRemoveLineItem && (
                  <Button
                    type="link"
                    danger
                    size="small"
                    onClick={(e) => {
                      e.stopPropagation();
                      onRemoveLineItem(record.id);
                    }}
                    disabled={actionPending}
                  >
                    Remove
                  </Button>
                )}
              </Space>
            ),
          },
        ]
      : []),
  ];

  return (
    <div>
      {isDraft && (
        <div style={{ marginBottom: 12 }}>
          <Button type="primary" onClick={onAddLineItem} loading={actionPending}>
            Add line item
          </Button>
        </div>
      )}
      <Table
        dataSource={items.map((i) => ({ ...i, key: i.id }))}
        columns={columns}
        pagination={false}
        size="small"
      />
      {(proposal.subtotal != null || proposal.total != null) && (
        <div style={{ marginTop: 16, textAlign: "right" }}>
          {proposal.subtotal != null && (
            <div>
              Subtotal: {formatCurrency(proposal.subtotal, currency)}
            </div>
          )}
          {proposal.total != null && (
            <div style={{ fontWeight: 600, fontSize: "1.05em" }}>
              Total: {formatCurrency(proposal.total, currency)}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
