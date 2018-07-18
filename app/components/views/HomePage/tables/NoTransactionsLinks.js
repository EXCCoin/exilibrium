import { Link } from "react-router-dom";
import { FormattedMessage as T } from "react-intl";
import { ExternalLink } from "shared";

export default () => (
  <div className="overview-no-transactions">
    <Link to="/transactions/receive" className="receive">
      <strong>
        <T id="home.noTransactions.receiveLink" m="Generate a EXCC Address for receiving funds" /> →{" "}
      </strong>
    </Link>
    <ExternalLink href="https://excc.co/#invest_section" className="buy">
      <strong>
        <T id="home.noTransactions.buyFromExchanges" m="Buy EXCC from Exchanges" /> →{" "}
      </strong>
    </ExternalLink>
  </div>
);
