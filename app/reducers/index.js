import { combineReducers } from "redux";
import { routerReducer as routing } from "react-router-redux";
import grpc from "./grpc";
import walletLoader from "./walletLoader";
import notifications from "./notifications";
import api from "./api";
import control from "./control";
import version from "./version";
import settings from "./settings";
import stakepool from "./stakepool";
import daemon from "./daemon";
import locales from "./locales";
import sidebar from "./sidebar";
import snackbar from "./snackbar";
import statistics from "./statistics";

const rootReducer = combineReducers({
  api,
  control,
  daemon,
  grpc,
  locales,
  notifications,
  routing,
  settings,
  sidebar,
  snackbar,
  stakepool,
  statistics,
  version,
  walletLoader
});

export default rootReducer;
