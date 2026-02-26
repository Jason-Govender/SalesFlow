import { handleActions } from "redux-actions";
import {
  INITIAL_ACTIVITIES_STATE,
  IActivitiesStateContext,
} from "./context";
import { ActivitiesActionEnums } from "./actions";

export const ActivitiesReducer = handleActions<
  IActivitiesStateContext,
  Partial<IActivitiesStateContext>
>(
  {
    [ActivitiesActionEnums.loadListPending]: (state, action) => ({
      ...state,
      ...action.payload,
    }),

    [ActivitiesActionEnums.loadListSuccess]: (state, action) => ({
      ...state,
      ...action.payload,
    }),

    [ActivitiesActionEnums.loadListError]: (state, action) => ({
      ...state,
      ...action.payload,
    }),

    [ActivitiesActionEnums.loadActivityPending]: (state, action) => ({
      ...state,
      ...action.payload,
    }),

    [ActivitiesActionEnums.loadActivitySuccess]: (state, action) => ({
      ...state,
      ...action.payload,
    }),

    [ActivitiesActionEnums.loadActivityError]: (state, action) => ({
      ...state,
      ...action.payload,
    }),

    [ActivitiesActionEnums.clearSelectedActivity]: (state, action) => ({
      ...state,
      ...action.payload,
    }),

    [ActivitiesActionEnums.actionPending]: (state, action) => ({
      ...state,
      ...action.payload,
    }),

    [ActivitiesActionEnums.actionSuccess]: (state, action) => ({
      ...state,
      ...action.payload,
    }),

    [ActivitiesActionEnums.actionError]: (state, action) => ({
      ...state,
      ...action.payload,
    }),
  },
  INITIAL_ACTIVITIES_STATE
);
