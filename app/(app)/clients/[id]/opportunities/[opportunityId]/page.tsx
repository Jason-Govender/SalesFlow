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
    // #region agent log
    fetch("http://127.0.0.1:7550/ingest/2a3a292b-d656-4762-8562-b6e2ce0817a8", {
      method: "POST",
      headers: { "Content-Type": "application/json", "X-Debug-Session-Id": "8dbc10" },
      body: JSON.stringify({
        sessionId: "8dbc10",
        location: "opportunityId-page.tsx:effect",
        message: "Opportunity effect run",
        data: { opportunityId, clientId, hasOpportunityId: !!opportunityId },
        timestamp: Date.now(),
        hypothesisId: "H3",
      }),
    }).catch(() => {});
    // #endregion
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
