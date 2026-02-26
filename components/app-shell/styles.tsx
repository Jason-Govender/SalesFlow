import { createStyles } from "antd-style";

const SIDEBAR_DARK = "#282a36";
const SIDEBAR_SELECTED = "#3c3f4a";
const ACCENT_ORANGE = "#e85d04";
const MAIN_BG = "#f0f2f5";

export const useAppShellStyles = createStyles(({ token }) => ({
  layoutRoot: {
    minHeight: "100vh",
  },
  sider: {
    display: "flex",
    flexDirection: "column",
    background: SIDEBAR_DARK,
    position: "fixed",
    left: 0,
    top: 0,
    bottom: 0,
    zIndex: 100,
    overflow: "auto",
  },
  logo: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: token.paddingLG,
    minHeight: 64,
  },
  logoImage: {
    flexShrink: 0,
    objectFit: "contain",
  },
  menu: {
    flex: 1,
    marginTop: token.marginMD,
    background: "transparent",
    border: "none",
    "& .ant-menu-item": {
      color: "rgba(255, 255, 255, 0.85)",
      height: 48,
      lineHeight: "48px",
      margin: "4px 8px",
      width: "calc(100% - 16px)",
      borderRadius: token.borderRadius,
    },
    "& .ant-menu-submenu-title": {
      color: "rgba(255, 255, 255, 0.85)",
      height: 48,
      lineHeight: "48px",
      margin: "4px 8px",
      width: "calc(100% - 16px)",
      borderRadius: token.borderRadius,
    },
    "& .ant-menu-item:hover": {
      color: "#fff",
      background: "rgba(255, 255, 255, 0.08)",
    },
    "& .ant-menu-submenu-title:hover": {
      color: "#fff",
      background: "rgba(255, 255, 255, 0.08)",
    },
    "& .ant-menu-item-selected": {
      background: `${SIDEBAR_SELECTED} !important`,
      color: "#fff !important",
      borderLeft: `3px solid ${ACCENT_ORANGE}`,
      marginLeft: 8,
      paddingLeft: "13px !important",
    },
    "& .ant-menu-item-selected::after": {
      display: "none",
    },
    "& .ant-menu-item .anticon, & .ant-menu-submenu-title .anticon": {
      color: "inherit",
    },
  },
  userSection: {
    padding: token.padding,
    borderTop: "1px solid rgba(255, 255, 255, 0.1)",
    marginTop: "auto",
  },
  userButton: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    width: "100%",
    padding: token.paddingSM,
    background: "transparent",
    border: "none",
    borderRadius: token.borderRadius,
    color: "rgba(255, 255, 255, 0.85)",
    cursor: "pointer",
    textAlign: "left",
    transition: "background 0.2s",
    "&:hover": {
      background: "rgba(255, 255, 255, 0.08)",
      color: "#fff",
    },
  },
  userInfo: {
    display: "flex",
    flexDirection: "column",
    minWidth: 0,
  },
  userName: {
    fontWeight: 600,
    fontSize: token.fontSize,
    color: "#fff",
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
  },
  userRole: {
    fontSize: token.fontSizeSM,
    color: "rgba(255, 255, 255, 0.65)",
    marginTop: 2,
  },
  userChevron: {
    marginLeft: token.marginXS,
    fontSize: token.fontSizeSM,
    color: "rgba(255, 255, 255, 0.5)",
  },
  mainLayout: {
    marginLeft: 256,
    background: MAIN_BG,
  },
  content: {
    flex: 1,
    background: MAIN_BG,
    minHeight: "100vh",
    padding: token.paddingLG,
  },
}));
