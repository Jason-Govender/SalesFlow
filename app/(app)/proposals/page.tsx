"use client";

import { useEffect, useState } from "react";
import { Card, Select, Space } from "antd";
import { useProposalsState, useProposalsActions } from "@/providers/proposals-provider";
import { useClientsState, useClientsActions } from "@/providers/clients-provider";
import { useOpportunitiesState, useOpportunitiesActions } from "@/providers/opportunities-provider";
import {
  PROPOSAL_STATUS_LABELS,
  ProposalStatus,
} from "@/utils/proposals-service";
import { ProposalList } from "@/components/proposals";
import { useAppPageStyles } from "../pageStyles";

const STATUS_OPTIONS = [
  { value: undefined, label: "All statuses" },
  { value: ProposalStatus.Draft, label: PROPOSAL_STATUS_LABELS[ProposalStatus.Draft] },
  { value: ProposalStatus.Submitted, label: PROPOSAL_STATUS_LABELS[ProposalStatus.Submitted] },
  { value: ProposalStatus.Rejected, label: PROPOSAL_STATUS_LABELS[ProposalStatus.Rejected] },
  { value: ProposalStatus.Approved, label: PROPOSAL_STATUS_LABELS[ProposalStatus.Approved] },
];

export default function ProposalsPage() {
  const { styles } = useAppPageStyles();
  const { filters, pagination } = useProposalsState();
  const {
    loadProposals,
    setFilters,
    setPagination,
  } = useProposalsActions();

  const { clients } = useClientsState();
  const { loadClients } = useClientsActions();
  const { opportunities } = useOpportunitiesState();
  const { loadOpportunitiesByClient } = useOpportunitiesActions();

  const [clientOptionsLoaded, setClientOptionsLoaded] = useState(false);

  useEffect(() => {
    loadProposals({
      ...filters,
      pageNumber: pagination.pageNumber,
      pageSize: pagination.pageSize,
    });
  }, [filters.clientId, filters.opportunityId, filters.status, pagination.pageNumber, pagination.pageSize]);

  useEffect(() => {
    if (!clientOptionsLoaded) {
      loadClients({ pageSize: 200 });
      setClientOptionsLoaded(true);
    }
  }, [clientOptionsLoaded, loadClients]);

  useEffect(() => {
    if (filters.clientId) {
      loadOpportunitiesByClient(filters.clientId, { pageSize: 100 });
    }
  }, [filters.clientId, loadOpportunitiesByClient]);

  const clientOptions = (clients ?? []).map((c) => ({
    value: c.id,
    label: c.name,
  }));

  const opportunityOptions = (opportunities ?? []).map((o) => ({
    value: o.id,
    label: o.title,
  }));

  const handleClientChange = (value: string | undefined) => {
    setFilters({ clientId: value, opportunityId: undefined });
    setPagination(1);
  };

  const handleOpportunityChange = (value: string | undefined) => {
    setFilters({ opportunityId: value });
    setPagination(1);
  };

  const handleStatusChange = (value: ProposalStatus | undefined) => {
    setFilters({ status: value });
    setPagination(1);
  };

  return (
    <div>
      <h1 className={styles.title}>Proposals & Pricing</h1>

      <Card>
        <Space direction="vertical" size="middle" style={{ width: "100%" }}>
          <Space wrap>
            <Select
              placeholder="Client"
              allowClear
              showSearch
              optionFilterProp="label"
              value={filters.clientId}
              onChange={handleClientChange}
              options={clientOptions}
              style={{ minWidth: 200 }}
            />
            <Select
              placeholder="Opportunity"
              allowClear
              showSearch
              optionFilterProp="label"
              value={filters.opportunityId}
              onChange={handleOpportunityChange}
              options={opportunityOptions}
              disabled={!filters.clientId}
              style={{ minWidth: 200 }}
            />
            <Select
              placeholder="Status"
              allowClear
              value={filters.status}
              onChange={handleStatusChange}
              options={STATUS_OPTIONS}
              style={{ minWidth: 140 }}
            />
          </Space>

          <ProposalList
            showCreateButton
            createHref="/proposals/new"
          />
        </Space>
      </Card>
    </div>
  );
}
