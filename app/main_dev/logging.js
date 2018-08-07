import { app } from "electron";
import winston from "winston";
import parseArgs from "minimist";
import path from "path";
import { MAX_LOG_LENGTH, OPTIONS } from "./constants";
import os from "os";
import fs from "fs-extra";

let exccdLogs = Buffer.from("");
let exccwalletLogs = Buffer.from("");

// logLevelsPrintable are the printable strings for each log level, compatible
// with the exccd/exccwallet logs.
const printLevel = {
  error: "ERR",
  warn: "WRN",
  info: "INF",
  verbose: "VBS",
  debug: "DBG",
  silly: "TRC"
};

const customFormatter = winston.format.printf(
  info => `${info.timestamp} [${printLevel[info.level] || "UKN"}] EXLB: ${info.message}`
);

// createLogger creates the main app logger. This stores all logs into the
// exilibrium app data dir and sends to the console when debug == true.
// This is meant to be called from the ipcMain thread.
function createLogger(debug) {
  const { splat, timestamp, colorize, combine } = winston.format;
  const logFilePath = path.join(app.getPath("userData"), "exilibrium.log");
  let level = "info";

  if (fs.pathExistsSync(logFilePath) && fs.statSync(logFilePath).size > 4e6) {
    console.log(`Removing ${logFilePath} before creating logger.`);
    fs.unlinkSync(logFilePath);
    console.log(`Removed file: ${logFilePath}`);
  }

  const transports = [
    new winston.transports.File({
      filename: logFilePath,
      maxsize: 4e6, // 4 MB
      maxFiles: 4,
      tailable: true,
      zippedArchive: true
    })
  ];
  const format = combine(
    splat(),
    timestamp({ format: "YYYY-MM-DD hh:mm:ss.SSS" }),
    customFormatter
  );

  if (debug) {
    level = "debug";
    transports.push(
      new winston.transports.Console({
        format: combine(
          splat(),
          timestamp({ format: "YYYY-MM-DD hh:mm:ss.SSS" }),
          colorize({ message: true }),
          customFormatter
        )
      })
    );
  }

  return winston.createLogger({ level, transports, format });
}

const argv = parseArgs(process.argv.slice(1), OPTIONS);
const debug = argv.debug || process.env.NODE_ENV === "development";
export const logger = createLogger(debug);

const AddToLog = (destIO, destLogBuffer, data, debug) => {
  const dataBuffer = Buffer.from(data);
  if (destLogBuffer.length + dataBuffer.length > MAX_LOG_LENGTH) {
    destLogBuffer = destLogBuffer.slice(destLogBuffer.indexOf(os.EOL, dataBuffer.length) + 1);
  }
  if (debug) {
    destIO.write(data);
  }
  return Buffer.concat([destLogBuffer, dataBuffer]);
};

export const AddToExccdLog = (destIO, data, debug) => {
  exccdLogs = AddToLog(destIO, exccdLogs, data, debug);
};

export const AddToExccwalletLog = (destIO, data, debug) => {
  exccwalletLogs = AddToLog(destIO, exccwalletLogs, data, debug);
};

export const GetExccdLogs = () => exccdLogs;

export const GetExccwalletLogs = () => exccwalletLogs;

const logError = "[ERR]";

export function lastLogLine(log) {
  const lastLineIdx = log.lastIndexOf(os.EOL, log.length - os.EOL.length - 1);
  const lastLineBuff = log.slice(lastLineIdx).toString("utf-8");
  return lastLineBuff.trim();
}

export function lastErrorLine(log) {
  const lastLineIdx = log.lastIndexOf(logError);
  const endOfErrorLineIdx = log.indexOf(os.EOL, lastLineIdx);
  const lastLineBuff = log.slice(lastLineIdx, endOfErrorLineIdx).toString("utf-8");
  return lastLineBuff.trim();
}
