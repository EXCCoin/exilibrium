import { FormattedMessage as T } from "react-intl";
import "style/Logs.less";

const Logs = ({
  showExccdLogs,
  showExccwalletLogs,
  hideExccdLogs,
  hideExccwalletLogs,
  exccdLogs,
  exccwalletLogs,
  isDaemonRemote,
  isDaemonStarted,
  walletReady
}) => (
  <Aux>
    {!isDaemonRemote && isDaemonStarted ? (
      !exccdLogs ? (
        <div className="log-area hidden">
          <div className="log-area-title hidden" onClick={showExccdLogs}>
            <T id="help.logs.exccd" m="exccd" />
          </div>
        </div>
      ) : (
        <div className="log-area expanded">
          <div className="log-area-title expanded" onClick={hideExccdLogs}>
            <T id="help.logs.exccd" m="exccd" />
          </div>
          <div className="log-area-logs">
            <textarea rows="30" value={exccdLogs} disabled />
          </div>
        </div>
      )
    ) : (
      <div />
    )}
    {!walletReady ? null : !exccwalletLogs ? (
      <div className="log-area hidden">
        <div className="log-area-title hidden" onClick={showExccwalletLogs}>
          <T id="help.logs.exccwallet" m="exccwallet" />
        </div>
      </div>
    ) : (
      <div className="log-area expanded">
        <div className="log-area-title expanded" onClick={hideExccwalletLogs}>
          <T id="help.logs.exccwallet" m="exccwallet" />
        </div>
        <div className="log-area-logs">
          <textarea rows="30" value={exccwalletLogs} disabled />
        </div>
      </div>
    )}
  </Aux>
);

export default Logs;
