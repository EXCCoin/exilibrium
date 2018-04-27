import { Link } from "react-router-dom";
import { FormattedMessage as T } from "react-intl";
import { ExternalLink } from "shared";

export default () => (
  <div className="overview-no-transactions">
    <Link to="/transactions/receive" className="receive">
      <T id="home.noTransactions.receiveLink" m="Generate a EXCC Address for receiving funds" /> →
    </Link>
    <ExternalLink href="https://docs.excc.co/getting-started/obtaining-dcr/" className="buy">
      <T id="home.noTransactions.buyFromExchanges" m="Buy EXCC from Exchanges" /> →
    </ExternalLink>
  </div>
);
