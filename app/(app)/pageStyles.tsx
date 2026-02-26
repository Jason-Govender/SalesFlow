import { createStyles } from "antd-style";

const ORANGE = "#e85d04";
const ORANGE_LIGHT = "rgba(232, 93, 4, 0.08)";

export const useDashboardPageStyles = createStyles(({ token }) => ({
  loadingWrapper: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    minHeight: "50vh",
  },
  title: {
    marginBottom: token.marginLG,
    fontWeight: 700,
    color: ORANGE,
    fontSize: token.fontSizeHeading3,
    paddingBottom: token.paddingSM,
    borderBottom: `3px solid ${ORANGE}`,
  },
  retryButton: {
    marginLeft: token.marginSM,
  },
  statisticItem: {
    marginTop: token.marginSM,
  },
  pipelineRow: {
    marginTop: token.marginLG,
  },
  cardAccent: {
    "& .ant-card-head": {
      borderLeft: `4px solid ${ORANGE}`,
      borderBottomColor: token.colorBorderSecondary,
      "& .ant-card-head-title": {
        color: ORANGE,
        fontWeight: 600,
      },
    },
    "& .ant-statistic-content-value": {
      fontWeight: 600,
    },
    "& .ant-statistic:first-child .ant-statistic-content-value": {
      color: ORANGE,
      fontSize: token.fontSizeHeading4,
    },
    "& .ant-statistic:not(:first-child) .ant-statistic-content-value": {
      color: token.colorTextHeading,
    },
  },
  pipelineCard: {
    "& .ant-card-head": {
      background: ORANGE_LIGHT,
      borderLeft: `4px solid ${ORANGE}`,
      "& .ant-card-head-title": {
        color: ORANGE,
        fontWeight: 600,
      },
    },
    "& .ant-table-thead > tr > th": {
      background: ORANGE_LIGHT,
      color: ORANGE,
      fontWeight: 600,
      borderBottomColor: "rgba(232, 93, 4, 0.2)",
    },
  },
}));

export const useAppPageStyles = createStyles(({ token }) => ({
  title: {
    marginBottom: token.marginLG,
    fontWeight: 700,
    color: token.colorTextHeading,
    fontSize: token.fontSizeHeading4,
  },
  description: {
    color: token.colorTextSecondary,
  },
}));
