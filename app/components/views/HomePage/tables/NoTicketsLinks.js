import { shell } from "electron";
import { FormattedMessage as T } from "react-intl";

export default () => (
  <div className="overview-no-tickets">
    <div
      className="tutorial-item whatIsStaking"
      onClick={() => shell.openExternal("https://support.excc.co/hc/en-us/articles/360004934011")}>
      <T id="home.noTickets.staking" m="What is Staking (Proof-of-Stake)?" />
    </div>
  </div>
);
