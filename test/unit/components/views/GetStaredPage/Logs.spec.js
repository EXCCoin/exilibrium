import Logs from "components/views/GetStartedPage/Logs/Logs";
import { render } from "test-utils.js";
import { screen, wait } from "@testing-library/react";
import user from "@testing-library/user-event";
import * as wa from "wallet";
import * as sel from "selectors";

const testDcrdLogString = "test-exccd-log";
const testDcrwalletLogString = "test-exccwallet-log";
const testDcrDecreditonLogString = "test-exccexilibrium-log";
const testDcrlnLogString = "test-exccln-log";
const wallet = wa;
const selectors = sel;

let mockGetDcrdLogs;
let mockGetDcrwalletLogs;
let mockGetDecreditonLogs;
let mockGetDcrlndLogs;
let mockLnActive;
let mockLnStartAttempt;
let mockIsDaemonRemote;
let mockGetDaemonStarted;
let mockGetWalletReady;

beforeEach(() => {
  mockGetDcrdLogs = wallet.getDcrdLogs = jest.fn(() =>
    Promise.resolve(Buffer.from(testDcrdLogString, "utf-8"))
  );
  mockGetDcrwalletLogs = wallet.getDcrwalletLogs = jest.fn(() =>
    Promise.resolve(Buffer.from(testDcrwalletLogString, "utf-8"))
  );
  mockGetDecreditonLogs = wallet.getDecreditonLogs = jest.fn(() =>
    Promise.resolve(Buffer.from(testDcrDecreditonLogString, "utf-8"))
  );
  mockGetDcrlndLogs = wallet.getDcrlndLogs = jest.fn(() =>
    Promise.resolve(Buffer.from(testDcrlnLogString, "utf-8"))
  );
  mockLnActive = selectors.lnActive = jest.fn(() => false);
  mockLnStartAttempt = selectors.lnStartAttempt = jest.fn(() => false);
  mockIsDaemonRemote = selectors.isDaemonRemote = jest.fn(() => false);
  mockGetDaemonStarted = selectors.getDaemonStarted = jest.fn(() => false);
  mockGetWalletReady = selectors.getWalletReady = jest.fn(() => false);
});

const expandLogs = async (linkText, expectedLogs) => {
  expect(screen.queryByText(expectedLogs)).not.toBeInTheDocument();

  user.click(screen.getByText(linkText));

  await wait(() =>
    Promise.resolve(expect(screen.getByText(expectedLogs)).toBeInTheDocument())
  );
};

const collapseLogs = async (linkText, expectedLogs) => {
  expect(screen.getByText(expectedLogs)).toBeInTheDocument();

  user.click(screen.getByText(linkText));

  await wait(() =>
    Promise.resolve(
      expect(screen.queryByText(expectedLogs)).not.toBeInTheDocument()
    )
  );
};

test("render default logs page", async () => {
  render(<Logs />);

  expect(screen.queryByText(/exccwallet/i)).not.toBeInTheDocument();
  expect(screen.queryByText(/excclnd/i)).not.toBeInTheDocument();

  await expandLogs("exilibrium", testDcrDecreditonLogString);
  expect(screen.getByText("exccd")).toBeInTheDocument();

  expect(mockGetDcrdLogs).toHaveBeenCalled();
  expect(mockGetDcrwalletLogs).toHaveBeenCalled();
  expect(mockGetDecreditonLogs).toHaveBeenCalled();
  expect(mockGetDcrlndLogs).toHaveBeenCalled();
  expect(mockIsDaemonRemote).toHaveBeenCalled();
  expect(mockGetDaemonStarted).toHaveBeenCalled();
  expect(mockGetWalletReady).toHaveBeenCalled();
});

test("render all logs and test if auto refresh is working", async () => {
  mockLnActive = selectors.lnActive = jest.fn(() => true);
  mockGetDaemonStarted = selectors.getDaemonStarted = jest.fn(() => true);
  mockGetWalletReady = selectors.getWalletReady = jest.fn(() => true);
  render(<Logs />);
  expect(mockLnActive).toHaveBeenCalled();

  // test expand logs
  await expandLogs("exilibrium", testDcrDecreditonLogString);
  await expandLogs("exccd", testDcrdLogString);
  await expandLogs("exccwallet", testDcrwalletLogString);
  await expandLogs("excclnd", testDcrlnLogString);

  // test collapse logs
  await collapseLogs("exilibrium", testDcrDecreditonLogString);
  await collapseLogs("exccd", testDcrdLogString);
  await collapseLogs("exccwallet", testDcrwalletLogString);
  await collapseLogs("excclnd", testDcrlnLogString);

  // test reexpand logs
  await expandLogs("exilibrium", testDcrDecreditonLogString);
  await expandLogs("exccd", testDcrdLogString);
  await expandLogs("exccwallet", testDcrwalletLogString);
  await expandLogs("excclnd", testDcrlnLogString);

  // test logs refresh
  mockGetDcrdLogs = wallet.getDcrdLogs = jest.fn(() =>
    Promise.resolve(Buffer.from(testDcrdLogString + "+", "utf-8"))
  );
  mockGetDcrwalletLogs = wallet.getDcrwalletLogs = jest.fn(() =>
    Promise.resolve(Buffer.from(testDcrwalletLogString + "+", "utf-8"))
  );
  mockGetDecreditonLogs = wallet.getDecreditonLogs = jest.fn(() =>
    Promise.resolve(Buffer.from(testDcrDecreditonLogString + "+", "utf-8"))
  );
  mockGetDcrdLogs = wallet.getDcrlndLogs = jest.fn(() =>
    Promise.resolve(Buffer.from(testDcrlnLogString + "+", "utf-8"))
  );
  await wait(() =>
    expect(screen.getByText(testDcrdLogString + "+")).toBeInTheDocument()
  );
  await wait(() =>
    expect(screen.getByText(testDcrwalletLogString + "+")).toBeInTheDocument()
  );
  await wait(() =>
    expect(
      screen.getByText(testDcrDecreditonLogString + "+")
    ).toBeInTheDocument()
  );
  await wait(() =>
    expect(screen.getByText(testDcrlnLogString + "+")).toBeInTheDocument()
  );
});

test("check ln logs if lnActive is true, but lnStartAttempt is false", async () => {
  mockLnActive = selectors.lnActive = jest.fn(() => true);
  mockLnStartAttempt = selectors.lnStartAttempt = jest.fn(() => false);
  render(<Logs />);
  expect(mockLnActive).toHaveBeenCalled();
  expect(mockLnStartAttempt).toHaveBeenCalled();
  await expandLogs("exilibrium", testDcrDecreditonLogString);
  expect(screen.getByText("excclnd")).toBeInTheDocument();
});

test("check ln logs if lnActive is false, but lnStartAttempt is true", async () => {
  mockLnActive = selectors.lnActive = jest.fn(() => false);
  mockLnStartAttempt = selectors.lnStartAttempt = jest.fn(() => true);
  render(<Logs />);
  expect(mockLnActive).toHaveBeenCalled();
  expect(mockLnStartAttempt).toHaveBeenCalled();
  await expandLogs("exilibrium", testDcrDecreditonLogString);
  expect(screen.getByText("excclnd")).toBeInTheDocument();
});
