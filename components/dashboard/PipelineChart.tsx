"use client";

import { Column, ConfigProvider } from "@ant-design/charts";
import type { IPipelineMetricsStage } from "@/utils/dashboard-service";

const ORANGE_PRIMARY = "#e85d04";

const ORANGE_THEME = {
  color: ORANGE_PRIMARY,
  category10: [ORANGE_PRIMARY],
  category20: [ORANGE_PRIMARY],
};

export interface PipelineChartProps {
  stages: IPipelineMetricsStage[];
  weightedValue?: number;
}

function buildChartData(
  stages: IPipelineMetricsStage[]
): Array<{ stage: string; value: number; series: string }> {
  return stages
    .filter(
      (s) =>
        (s.stageName != null || s.value != null || s.count != null) &&
        (s.value != null || s.count != null)
    )
    .map((s) => ({
      stage: s.stageName ?? "Unknown",
      value: s.value ?? s.count ?? 0,
      series: "pipeline",
    }));
}

export function PipelineChart({ stages, weightedValue }: PipelineChartProps) {
  const data = buildChartData(stages);

  if (data.length === 0) {
    return (
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          minHeight: 200,
          color: "var(--ant-color-text-tertiary)",
        }}
      >
        No pipeline data
      </div>
    );
  }

  const config = {
    data,
    xField: "stage",
    yField: "value",
    seriesField: "series",
    color: [ORANGE_PRIMARY],
    columnStyle: {
      radius: [4, 4, 0, 0],
    },
    xAxis: {
      label: {
        autoRotate: true,
        autoHide: false,
      },
    },
    yAxis: {
      label: {
        formatter: (v: string) => v,
      },
    },
    tooltip: false,
    meta: {
      stage: { alias: "Stage" },
      value: { alias: "Value" },
    },
  };

  return (
    <ConfigProvider common={{ theme: ORANGE_THEME }}>
      <div>
        {weightedValue != null && (
          <div
            style={{
              marginBottom: 8,
              fontSize: 12,
              color: "var(--ant-color-text-secondary)",
            }}
          >
            Weighted pipeline value:{" "}
            {new Intl.NumberFormat("en-ZA", {
              style: "currency",
              currency: "ZAR",
              minimumFractionDigits: 0,
              maximumFractionDigits: 0,
            }).format(weightedValue)}
          </div>
        )}
        <Column {...config} />
      </div>
    </ConfigProvider>
  );
}
