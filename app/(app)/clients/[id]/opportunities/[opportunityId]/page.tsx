"use client";

import { useEffect } from "react";
import { useParams } from "next/navigation";
import { useClientsState, useClientsActions } from "@/providers/clients-provider";
import { useOpportunitiesState, useOpportunitiesActions } from "@/providers/opportunities-provider";
import { useContactsActions } from "@/providers/contacts-provider";
import { OpportunityDetail } from "@/components/opportunities/OpportunityDetail";

export default function OpportunityDetailPage() {
  const params = useParams();
  const clientId = params?.id as string | undefined;
  const opportunityId = params?.opportunityId as string | undefined;

  const { selectedClient } = useClientsState();
  const { loadClient } = useClientsActions();
  const { loadOpportunity, loadStageHistory, clearSelectedOpportunity } =
    useOpportunitiesActions();
  const { loadContactsByClient } = useContactsActions();

  useEffect(() => {
    if (clientId) {
      loadClient(clientId);
      loadContactsByClient(clientId);
    }
  }, [clientId, loadClient, loadContactsByClient]);

  // Clear selected opportunity only when leaving the page (unmount), not when effect re-runs
  useEffect(() => {
    return () => {
      clearSelectedOpportunity();
    };
  }, [clearSelectedOpportunity]);

  useEffect(() => {
    if (opportunityId) {
      loadOpportunity(opportunityId);
      loadStageHistory(opportunityId);
    }
  }, [opportunityId, loadOpportunity, loadStageHistory]);

  if (!clientId || !opportunityId) {
    return null;
  }

  const clientName = selectedClient?.id === clientId ? selectedClient.name : "Client";

  return <OpportunityDetail clientId={clientId} clientName={clientName} />;
}
