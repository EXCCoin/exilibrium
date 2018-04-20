import Promise from "promise";
import {
  TransactionNotificationsRequest,
  AccountNotificationsRequest
} from "middleware/walletrpc/api_pb";
import { transactionNtfs, accountNtfs } from "middleware/grpc/client";
import { withLog } from "./index";

export const getTransactionNotifications = withLog(
  walletService =>
    new Promise(resolve =>
      transactionNtfs(walletService, new TransactionNotificationsRequest(), data => resolve(data))
    ),
  "Get Transaction Notifications"
);

export const getAccountNotifications = withLog(
  walletService =>
    new Promise(resolve =>
      accountNtfs(walletService, new AccountNotificationsRequest(), data => resolve(data))
    ),
  "Get Account Notifications"
);
