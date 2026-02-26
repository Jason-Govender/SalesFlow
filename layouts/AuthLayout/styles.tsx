import { createStyles } from "antd-style";

export const useAuthLayoutStyles = createStyles(({ token }) => ({
  layout: {
    minHeight: "100vh",
  },
  content: {
    display: "grid",
    placeItems: "center",
    padding: token.paddingLG,
  },
}));