import { handleActions } from "redux-actions";
import { INITIAL_AUTH_STATE, IAuthStateContext } from "./context";
import { AuthActionEnums } from "./actions";

export const AuthReducer = handleActions<IAuthStateContext, IAuthStateContext>(
  {
    [AuthActionEnums.initAuthPending]: (state, action) => ({
      ...state,
      ...action.payload,
    }),
    [AuthActionEnums.initAuthSuccess]: (state, action) => ({
      ...state,
      ...action.payload,
    }),
    [AuthActionEnums.loginPending]: (state, action) => ({
      ...state,
      ...action.payload,
    }),
    [AuthActionEnums.loginSuccess]: (state, action) => ({
      ...state,
      ...action.payload,
    }),
    [AuthActionEnums.loginError]: (state, action) => ({
      ...state,
      ...action.payload,
    }),

    [AuthActionEnums.logout]: (state, action) => ({
      ...state,
      ...action.payload,
    }),
  },
  INITIAL_AUTH_STATE
);