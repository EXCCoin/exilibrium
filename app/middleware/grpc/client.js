process.env.GRPC_SSL_CIPHER_SUITES = "HIGH+ECDSA";

const grpc = require("@grpc/grpc-js");

import { getWalletCert } from "config.js";
import { getWalletPath } from "main_dev/paths.js";

const proto = require("../walletrpc/api_grpc_pb.js");
const services = grpc.loadPackageDefinition(proto).walletrpc;

const getServiceClient = (clientClass) => (isTestNet, walletPath, address, port, cb) => {
  const cert = getWalletCert(getWalletPath(isTestNet, walletPath));
  if (cert === "") {
    return cb(null, "Unable to load exccwallet certificate.  exccwallet not running?");
  }
  const creds = grpc.credentials.createSsl(cert);
  const client = new clientClass(`${address}:${port}`, creds);

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

export const getWalletService = getServiceClient(services.WalletService);
export const getTicketBuyerService = getServiceClient(services.TicketBuyerService);
export const loader = getServiceClient(services.WalletLoaderService);
export const seeder = getServiceClient(services.SeedService);
export const getVersionService = getServiceClient(services.VersionService);
export const getVotingService = getServiceClient(services.VotingService);
export const getAgendaService = getServiceClient(services.AgendaService);
export const getMessageVerificationService = getServiceClient(
  services.MessageVerificationService
);
export const getDecodeMessageService = getServiceClient(services.DecodeMessageService);
