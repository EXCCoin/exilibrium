import Promise from "promise";
import { getVersionService as getService } from "../middleware/grpc/client";
const messages = require("../middleware/walletrpc/api_pb");
import { withLog } from "./index";

export const getVersionService = withLog(
  (network, walletPath, address, port) =>
    new Promise((resolve, reject) =>
      getService(
        network,
        walletPath,
        address,
        port,
        (versionService, error) => (error ? reject(error) : resolve(versionService))
      )
    ),
  "Get Version Service"
);

export const getVersionResponse = withLog(
  versionService =>
    new Promise((resolve, reject) =>
      versionService.version(
        new messages.VersionRequest(),
        (error, response) => (error ? reject(error) : resolve(response))
      )
    ),
  "Get Version Response"
);
