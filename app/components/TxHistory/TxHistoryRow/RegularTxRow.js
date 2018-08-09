import Row from "./Row";
import { Balance } from "shared";
import { createElement as h } from "react";

const RegularTxRow = ({ txAmount, txDescription, txDirection, ...props }) => (
  <Row {...props}>
    <div className="transaction-info">
      <span className="icon" />
      <span className="transaction-amount-number">
        <Balance amount={txDirection !== "in" ? -txAmount : txAmount} />
      </span>
      <div className="transaction-amount-hash">{(txDescription.addressStr || []).join(", ")}</div>
    </div>
  </Row>
);

export const RegularTxRowOfClass = className => {
  const Comp = props => h(RegularTxRow, { className, ...props });
  Comp.displayName = `RegularTxRowOfClass: ${className}`;
  return Comp;
};
