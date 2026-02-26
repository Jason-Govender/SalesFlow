import { handleActions } from "redux-actions";
import {
  INITIAL_DASHBOARD_STATE,
  IDashboardStateContext,
} from "./context";
import { DashboardActionEnums } from "./actions";

export const DashboardReducer = handleActions<
  IDashboardStateContext,
  IDashboardStateContext
>(
  {
    [DashboardActionEnums.loadDashboardPending]: (state, action) => ({
      ...state,
      ...action.payload,
    }),

    [DashboardActionEnums.loadDashboardSuccess]: (state, action) => ({
      ...state,
      ...action.payload,
    }),

    [DashboardActionEnums.loadDashboardError]: (state, action) => ({
      ...state,
      ...action.payload,
    }),
  },
  INITIAL_DASHBOARD_STATE
);
