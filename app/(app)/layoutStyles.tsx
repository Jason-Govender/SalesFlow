import { createStyles } from "antd-style";

export const useAppLayoutStyles = createStyles(({ token }) => ({
  spinWrapper: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    minHeight: "100vh",
  },
}));
