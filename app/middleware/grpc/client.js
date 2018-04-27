process.env.GRPC_SSL_CIPHER_SUITES = "HIGH+ECDSA";

import grpc from "grpc";

import { getWalletCert } from "config.js";
import { getWalletPath } from "main_dev/paths.js";
const services = require("../walletrpc/api_grpc_pb.js");

const getServiceClient = ClientClass => (isTestNet, walletPath, address, port, cb) => {
  const cert = getWalletCert(getWalletPath(isTestNet, walletPath));
  if (cert === "") {
    return cb(null, "Unable to load exccwallet certificate.  exccwallet not running?");
  }
  const creds = grpc.credentials.createSsl(cert);
  const client = new ClientClass(`${address}:${port}`, creds);

  const deadline = new Date();
  const deadlineInSeconds = 30;
  deadline.setSeconds(deadline.getSeconds() + deadlineInSeconds);
  grpc.waitForClientReady(client, deadline, err => {
    if (err) {
      return cb(null, err);
    }
    return cb(client);
  });
};

export const getWalletService = getServiceClient(services.WalletServiceClient);
export const getTicketBuyerService = getServiceClient(services.TicketBuyerServiceClient);
export const loader = getServiceClient(services.WalletLoaderServiceClient);
export const seeder = getServiceClient(services.SeedServiceClient);
export const getVersionService = getServiceClient(services.VersionServiceClient);
export const getVotingService = getServiceClient(services.VotingServiceClient);
export const getAgendaService = getServiceClient(services.AgendaServiceClient);
export const getMessageVerificationService = getServiceClient(
  services.MessageVerificationServiceClient
);
export const getDecodeMessageService = getServiceClient(services.DecodeMessageServiceClient);
