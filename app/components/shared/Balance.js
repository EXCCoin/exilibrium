import "style/Balance.less";
import PropTypes from "prop-types";
import { FormattedNumber } from "react-intl";
import { balance } from "connectors";

export const Balance = ({
  currencyDisplay,
  amount,
  onClick,
  bold,
  large,
  flat,
  title,
  noSmallAmount,
  classNameWrapper,
  classNameUnit,
  preScaled
}) => {
  const secondary = large
    ? "balance-tiny"
    : flat
      ? "balance-base"
      : title
        ? "balance-title"
        : "balance-small";
  if (currencyDisplay === "EXCC") {
    let totalExcc = 0;
    if (typeof amount !== "undefined" && amount !== 0 && !isNaN(amount)) {
      totalExcc = preScaled ? parseFloat(amount) : parseInt(amount) / 100000000;
    }
    const split = totalExcc
      .toFixed(8)
      .toString()
      .split(".");
    const head = [split[0], split[1].slice(0, 2)].join(".");
    const tail = split[1].slice(2).replace(/0{1,3}$/, "");
    const negativeZero = parseFloat(head) === 0 && amount < 0;
    return (
      <div className={classNameWrapper}>
        <span className="mono" {...{ onClick }}>
          <span className={bold ? "bold" : null}>
            {negativeZero ? "-" : ""}
            <FormattedNumber value={head} maximumFractionDigits={2} minimumFractionDigits={2} />
          </span>
          {!noSmallAmount && (
            <span className={[secondary, classNameUnit, bold ? "bold" : null].join(" ")}>
              {`${tail} `}
            </span>
          )}
          <span className={[secondary, classNameUnit].join(" ")}>EXCC</span>
        </span>
      </div>
    );
  } else if (currencyDisplay === "exels") {
    return (
      <div className={classNameWrapper}>
        <span className="mono" {...{ onClick }}>
          <span className={[secondary, bold ? "bold" : null].join(" ")}>{`${amount} `}</span>
          <span className={[secondary, classNameUnit].join(" ")}>exels</span>
        </span>
      </div>
    );
  }
};

Balance.propTypes = {
  currencyDisplay: PropTypes.string.isRequired,
  amount: PropTypes.any,
  onClick: PropTypes.func,
  bold: PropTypes.bool,
  large: PropTypes.bool,
  flat: PropTypes.bool,
  title: PropTypes.any,
  noSmallAmount: PropTypes.any,
  classNameWrapper: PropTypes.any,
  classNameUnit: PropTypes.any,
  preScaled: PropTypes.any
};

export default balance(Balance);
