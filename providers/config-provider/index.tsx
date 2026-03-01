"use client";

import React from "react";
import { App, ConfigProvider, theme } from "antd";

const { defaultAlgorithm } = theme;

const SALESFLOW_ORANGE = "#fd7325";
const SALESFLOW_DARK = "#484d5d";
const SALESFLOW_BG = "#f5f5f5";

export function AppConfigProvider({ children }: { children: React.ReactNode }) {
  return (
    <ConfigProvider
      theme={{
        algorithm: defaultAlgorithm,

        token: {
          colorPrimary: SALESFLOW_ORANGE,
          colorInfo: SALESFLOW_ORANGE,

          colorBgLayout: SALESFLOW_BG,
          colorBgContainer: "#ffffff",

          borderRadius: 12,
          controlHeight: 40,
          fontSize: 14,
        },
        components: {
          Layout: {
            bodyBg: SALESFLOW_BG,
            headerBg: SALESFLOW_BG,
            siderBg: SALESFLOW_DARK,
          },

          Menu: {
            darkItemBg: SALESFLOW_DARK,
            darkSubMenuItemBg: SALESFLOW_DARK,
            darkPopupBg: SALESFLOW_DARK,
            darkItemSelectedBg: SALESFLOW_ORANGE,
            darkItemSelectedColor: "#ffffff",
            darkItemHoverColor: "#ffffff",
            darkItemColor: "rgba(255,255,255,0.75)",
          },

          Card: {
            borderRadiusLG: 12,
            paddingLG: 20,
          },

          Button: {
            borderRadius: 10,
            controlHeight: 44,
            paddingInlineLG: 18,
          },

          Input: {
            borderRadius: 10,
            controlHeight: 44,
          },

          Form: {
            itemMarginBottom: 14,
          },

          Modal: {
            borderRadiusLG: 12,
            titleFontSize: 16,
            titleLineHeight: 1.3,
            paddingMD: 20,
            paddingLG: 24,
            },
          List: {
            itemPaddingSM: "12",
            itemPaddingLG: "16",
            },
          Tag: {
            borderRadiusSM: 999,
            },

          Progress: {
            },  

          Spin: {
            },
        },
      }}
    >
      {}
      <App>{children}</App>
    </ConfigProvider>
  );
}