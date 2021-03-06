import { FormattedMessage as T } from "react-intl";

export default () => (
  <Aux>
    <p className="info-modal-column">
      <span className="info-modal-row">
        <T
          id="gapLimit.info.warning"
          m="*Warning* This gap limit setting should typically be left alone.  An increase to the gap limit could cause major performance degradation."
        />
      </span>
      <span className="info-modal-row">
        <T
          id="gapLimit.info.first"
          m="Gap limit sets the amount of addresses that the wallet will generate and look ahead to determine usage.  By default, the gap limit is set to 20.  This means 2 things.  1) When wallet first loads, it scans for address usage and expects the largest gap between addresses to be 20.  2) When providing user with newly generated addresses it will only give 20 addresses then loop back, which ensures that gaps are no larger than 20."
        />
      </span>
      <span className="info-modal-row">
        <T
          id="gapLimit.info.second"
          m="There is only one reason to change this value: if you would like to generate more than 20 addresses at a time without wrapping around."
        />
      </span>
    </p>
  </Aux>
);
