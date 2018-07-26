import Promise from "promise";
import { stakePoolInfo } from "middleware/stakepoolapi";
import { withLogNoData } from "./app";

export const getStakePoolInfo = withLogNoData(
  apiAddress =>
    new Promise((resolve, reject) =>
      stakePoolInfo(
        (response, error) => (!response ? reject(error) : resolve(response)),
        apiAddress
      )
    ),
  "Get Stakepool Info"
);
