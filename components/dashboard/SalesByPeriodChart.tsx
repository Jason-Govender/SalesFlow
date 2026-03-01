"use client";

import { Column, ConfigProvider } from "@ant-design/charts";
import type { ISalesByPeriodItem } from "@/utils/reports-service";

const ORANGE_PRIMARY = "#e85d04";
const ORANGE_THEME = {
  color: ORANGE_PRIMARY,
  category10: [ORANGE_PRIMARY],
  category20: [ORANGE_PRIMARY],
};

export interface SalesByPeriodChartProps {
  data: ISalesByPeriodItem[];
}

export function SalesByPeriodChart({ data }: SalesByPeriodChartProps) {
  const chartData = (data ?? [])
    .filter((d) => d.period != null && d.value != null)
    .map((d) => ({ period: String(d.period), value: Number(d.value) }));

  if (chartData.length === 0) {
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
        No data for the selected period
      </div>
    );
  }

  const config = {
    data: chartData,
    xField: "period",
    yField: "value",
    color: ORANGE_PRIMARY,
    columnStyle: { radius: [4, 4, 0, 0] },
    xAxis: { label: { autoRotate: true } },
    tooltip: false,
  };

  return (
    <ConfigProvider common={{ theme: ORANGE_THEME }}>
      <Column {...config} />
    </ConfigProvider>
  );
}
