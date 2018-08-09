import Status from "./Status";
import StatusSmall from "./StatusSmall";
import { diffBetweenTwoTs } from "helpers/dateFormat";
import "style/TxHistory.less";

const Row = ({
  txAccountName,
  pending,
  txTimestamp,
  onClick,
  className,
  children,
  overview,
  leaveTimestamp,
  enterTimestamp
}) => {
  const StatusComponent = overview ? StatusSmall : Status;

  // ticket can have leaveTimestamp equals null, which is not voted yet
  const daysToVote = leaveTimestamp ? diffBetweenTwoTs(leaveTimestamp, enterTimestamp) : null;

  if (overview && pending) {
    return (
      <div className="tx-history-row-wrapper is-overview-pending">
        <div className={`tx-history-row ${className}`} {...{ onClick }}>
          {children}
        </div>
        <StatusComponent
          {...{ txAccountName, pending, txTimestamp, overview, daysToVote, onClick }}
        />
      </div>
    );
  }

  return (
    <div className="tx-history-row-wrapper">
      <div className={`tx-history-row ${className}`} {...{ onClick }}>
        {children}
        <StatusComponent {...{ txAccountName, pending, txTimestamp, overview, daysToVote }} />
      </div>
    </div>
  );
};

export default Row;
