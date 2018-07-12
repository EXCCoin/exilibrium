import { loaderRequest } from "./WalletLoaderActions";
import { getVersionService, getVersionResponse } from "wallet";
import { push as pushHistory } from "react-router-redux";
import { ipcRenderer } from "electron";
import { isTestNet } from "selectors";

export const GETVERSIONSERVICE_ATTEMPT = "GETVERSIONSERVICE_ATTEMPT";
export const GETVERSIONSERVICE_FAILED = "GETVERSIONSERVICE_FAILED";
export const GETVERSIONSERVICE_SUCCESS = "GETVERSIONSERVICE_SUCCESS";

export const getVersionServiceAttempt = () => (dispatch, getState) => {
  dispatch({ type: GETVERSIONSERVICE_ATTEMPT });
  const {
    grpc: { address, port }
  } = getState();
  const {
    daemon: { walletName }
  } = getState();
  return getVersionService(isTestNet(getState()), walletName, address, port)
    .then(versionService => {
      dispatch({ versionService, type: GETVERSIONSERVICE_SUCCESS });
      dispatch(getWalletRPCVersionAttempt());
    })
    .catch(error => dispatch({ error, type: GETVERSIONSERVICE_FAILED }));
};

export const WALLETRPCVERSION_ATTEMPT = "WALLETRPCVERSION_ATTEMPT";
export const WALLETRPCVERSION_FAILED = "WALLETRPCVERSION_FAILED";
export const WALLETRPCVERSION_SUCCESS = "WALLETRPCVERSION_SUCCESS";
export const VERSION_NOT_VALID = "VERSION_NOT_VALID";

export const getWalletRPCVersionAttempt = () => (dispatch, getState) => {
  dispatch({ type: WALLETRPCVERSION_ATTEMPT });
  const {
    version: { versionService }
  } = getState();
  return getVersionResponse(versionService)
    .then(getWalletRPCVersionResponse => {
      dispatch({ getWalletRPCVersionResponse, type: WALLETRPCVERSION_SUCCESS });
      const {
        version: { requiredVersion }
      } = getState();
      let versionErr = null;
      const walletVersion = getWalletRPCVersionResponse.getVersionString();
      ipcRenderer.send("grpc-versions-determined", { requiredVersion, walletVersion });
      if (!walletVersion) {
        versionErr = "Unable to obtain Exccwallet API version";
      } else {
        if (!semverCompatible(requiredVersion, walletVersion)) {
          versionErr = `API versions not compatible..  Exilibrium requires ${requiredVersion} but wallet ${walletVersion} does not satisfy the requirement. Please check your installation, Exilibrium and Exccwallet versions should match.`;
        }
      }
      if (versionErr) {
        dispatch({ error: versionErr, type: VERSION_NOT_VALID });
        dispatch(pushHistory("/invalidRPCVersion"));
      } else {
        const { address, port } = getState().grpc;
        dispatch(loaderRequest(address, port));
      }
    })
    .catch(error => dispatch({ error, type: WALLETRPCVERSION_FAILED }));
};

const version = {
  MAJOR: 0,
  MINOR: 1,
  PATCH: 2,
  prereleases: ["rc", "alfa", "beta"]
};

function isPreRelease(versionToCheck = "") {
  return version.prereleases.find(pre => versionToCheck.includes(pre));
}

export function semverCompatible(newestVersion, currentVersion) {
  const newest = newestVersion.split(".");
  const current = currentVersion.split(".");

  if (newestVersion === currentVersion) {
    return true;
  }

  if (newest.length !== 3 || current.length !== 3) {
    // user who has pre-release installed wants to subscribe to pre-releases
    // this won't work after user installs "legit" release
    // those who have "legit" version doesn't want to be bothered by pre-releases
    if (isPreRelease(newestVersion) && !isPreRelease(currentVersion)) {
      return true;
    }
    return false;
  }

  if (newest[version.MAJOR] !== current[version.MAJOR]) {
    return false;
  }
  if (newest[version.MINOR] > current[version.MINOR]) {
    return false;
  }
  if (
    newest[version.MINOR] === current[version.MINOR] &&
    newest[version.PATCH] > current[version.PATCH]
  ) {
    return false;
  }
  return true;
}
