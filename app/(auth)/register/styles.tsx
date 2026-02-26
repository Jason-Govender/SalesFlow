"use client";

import { createStyles } from "antd-style";

export const useRegisterStyles = createStyles(({ token }) => ({
  card: {
    width: "100%",
    maxWidth: 520,
    borderRadius: token.borderRadiusLG,
    boxShadow: token.boxShadowSecondary,
  },
  header: {
    textAlign: "center",
    marginBottom: token.marginLG,
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: token.marginSM,
  },
  subtitle: {
    fontWeight: 600,
    fontSize: token.fontSizeLG,
  },
  alert: {
    marginBottom: token.marginMD,
  },
  footer: {
    textAlign: "center",
    marginTop: token.marginSM,
  },
}));

