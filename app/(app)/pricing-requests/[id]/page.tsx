"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { usePricingRequestsState, usePricingRequestsActions } from "@/providers/pricing-requests-provider";
import { useAuthState } from "@/providers/auth-provider";
import { PricingRequestDetail } from "@/components/pricing-requests/PricingRequestDetail";
import { AssignPricingRequestModal } from "@/components/pricing-requests/AssignPricingRequestModal";
import { useAppPageStyles } from "../../pageStyles";

const ROLES_CAN_ASSIGN: string[] = ["Admin", "SalesManager"];

export default function PricingRequestDetailPage() {
  const { styles } = useAppPageStyles();
  const params = useParams();
  const id = params?.id as string | undefined;

  const { session } = useAuthState();
  const userRoles = session?.user?.roles ?? [];
  const canAssign = userRoles.some((r) => ROLES_CAN_ASSIGN.includes(r));

  const {
    selectedPricingRequest,
    isPending,
    isError,
    error,
    actionPending,
  } = usePricingRequestsState();
  const {
    loadPricingRequest,
    assignPricingRequest,
    completePricingRequest,
    clearSelectedPricingRequest,
  } = usePricingRequestsActions();

  const [assignModalOpen, setAssignModalOpen] = useState(false);

  useEffect(() => {
    if (id) {
      loadPricingRequest(id);
    }
    return () => {
      clearSelectedPricingRequest();
    };
  }, [id, loadPricingRequest, clearSelectedPricingRequest]);

  const handleAssignSuccess = () => {
    setAssignModalOpen(false);
    if (id) loadPricingRequest(id);
  };

  return (
    <div>
      <h1 className={styles.title}>Pricing Request</h1>

      <PricingRequestDetail
        request={selectedPricingRequest}
        loading={isPending}
        error={isError ? error : undefined}
        actionPending={actionPending}
        canAssign={canAssign}
        onAssignClick={() => setAssignModalOpen(true)}
        onCompleteClick={() => {
          if (selectedPricingRequest)
            completePricingRequest(selectedPricingRequest.id);
        }}
      />

      <AssignPricingRequestModal
        open={assignModalOpen}
        onClose={() => setAssignModalOpen(false)}
        onSuccess={handleAssignSuccess}
        pricingRequestId={selectedPricingRequest?.id ?? null}
        onAssign={assignPricingRequest}
        loading={actionPending}
      />
    </div>
  );
}
