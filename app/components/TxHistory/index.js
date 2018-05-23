import TxHistoryRow from "./TxHistoryRow";

const TxHistory = ({ transactions = [], limit, overview }) => (
  <Aux>
    {transactions.map((tx, index) => {
      if (limit && index >= limit) {
        return null;
      }
      return <TxHistoryRow {...{ key: tx.txHash, overview, tx }} />;
    })}
  </Aux>
);

export default TxHistory;
