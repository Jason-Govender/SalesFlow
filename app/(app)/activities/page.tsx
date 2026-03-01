"use client";

import { useEffect, useState } from "react";
import { Card, Tabs, Alert, Spin, Button } from "antd";
import { useAppPageStyles } from "../pageStyles";
import { useActivitiesState, useActivitiesActions } from "@/providers/activities-provider";
import { ActivityList } from "@/components/activities/ActivityList";
import { ActivityFormModal, type ActivityFormValues } from "@/components/activities/ActivityFormModal";
import type { RelatedToType } from "@/utils/activities-service";

type TabKey = "my" | "upcoming" | "overdue";

export default function ActivitiesPage() {
  const { styles } = useAppPageStyles();
  const [activeTab, setActiveTab] = useState<TabKey>("my");
  const [createModalOpen, setCreateModalOpen] = useState(false);

  const { isPending, isError, error, actionPending } = useActivitiesState();
  const { loadList, createActivity } = useActivitiesActions();

  useEffect(() => {
    loadList({ mode: activeTab, params: { pageNumber: 1, pageSize: 10 } });
  }, [activeTab]);

  const handleCreateSuccess = () => {
    setCreateModalOpen(false);
    loadList({ mode: activeTab, params: { pageNumber: 1, pageSize: 10 } });
  };

  const handleSubmitCreate = async (values: ActivityFormValues) => {
    await createActivity({
      type: values.type,
      subject: values.subject,
      description: values.description,
      priority: values.priority,
      dueDate: values.dueDate,
      assignedToId: values.assignedToId,
      relatedToType: values.relatedToType as RelatedToType | undefined,
      relatedToId: values.relatedToId,
      duration: values.duration,
      location: values.location,
    });
  };

  return (
    <div>
      <h1 className={styles.title}>Activities</h1>

      <Card
        extra={
          <Button type="primary" onClick={() => setCreateModalOpen(true)}>
            Create activity
          </Button>
        }
      >
        {isError && error && (
          <Alert
            message="Error"
            description={error}
            type="error"
            showIcon
            style={{ marginBottom: 16 }}
            action={
              <Button size="small" onClick={() => loadList({ mode: activeTab })}>
                Retry
              </Button>
            }
          />
        )}

        <Tabs
          activeKey={activeTab}
          onChange={(key) => setActiveTab(key as TabKey)}
          items={[
            { key: "my", label: "My activities" },
            { key: "upcoming", label: "Upcoming" },
            { key: "overdue", label: "Overdue" },
          ]}
        />

        {isPending ? (
          <div style={{ padding: 24, textAlign: "center" }}>
            <Spin size="large" />
          </div>
        ) : (
          <ActivityList showCreateButton={false} />
        )}
      </Card>

      <ActivityFormModal
        open={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        onSuccess={handleCreateSuccess}
        onSubmit={handleSubmitCreate}
        loading={actionPending}
      />
    </div>
  );
}
