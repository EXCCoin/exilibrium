import { FormattedMessage as T } from "react-intl";
import { HelpLink, HelpLinkInfoModal, HelpLinkAboutModal } from "buttons";
import { Subtitle } from "shared";
import styles from "./LinksTab.module.css";

const LinksTab = () => (
  <>
    <Subtitle title={<T id="help.subtitle.project" m="Project Related" />} />
    <div className={styles.list}>
      <HelpLink
        icon="docs"
        href="https://docs.excc.co"
        title={<T id="help.documentation" m="Documentation" />}
        subtitle={<T id="help.documentation.subtitle" m="docs.excc.co" />}
      />
      <HelpLink
        icon="pools"
        href="https://decred.org/stakepools"
        title={<T id="help.stakepools" m=" VSPs" />}
        subtitle={<T id="help.stakepools.subtitle" m="excc.co/vsp" />}
      />
      <HelpLink
        icon="explorer"
        href="https://explorer.excc.co"
        title={<T id="help.blockchain" m=" Blockchain Explorer" />}
        subtitle={<T id="help.blockchain.subtitle" m="explorer.excc.co" />}
      />
      <HelpLink
        icon="github"
        href="https://github.com/EXCCoin/exilibrium"
        title={<T id="help.github.title" m="GitHub" />}
        subtitle={
          <T id="help.github.subtitle" m="github.com/EXCCoin/exilibrium" />
        }
      />
      <HelpLinkInfoModal
        document="DecredConstitution"
        icon="constitution"
        title={<T id="help.constitution" m="Constitution" />}
        subtitle={
          <T id="help.constitution.subtitle" m="ExchangeCoin Project Constitution" />
        }
        double
      />
      <HelpLinkAboutModal
        icon="star"
        title={<T id="help.about.decrediton" m="About Exilibrium" />}
        subtitle={
          <T id="help.about.decrediton.subtitle" m="Software Summary" />
        }
      />
    </div>
    <Subtitle
      title={<T id="help.subtitle.communications" m="Communications" />}
    />
    <div className={styles.list}>
      <HelpLink
        icon="matrix"
        href="https://support.excc.co"
        title={<T id="help.matrix" m="ExchangeCoin Support" />}
        subtitle={<T id="help.matrix.subtitle" m="support.excc.co" />}
      />
      <HelpLink
        icon="forum"
        href="https://t.me/ExchangeCoinChat"
        title={<T id="help.telegram" m="Telegram" />}
        subtitle={<T id="help.telegram.subtitle" m="https://t.me/ExchangeCoinChat" />}
      />
    </div>
  </>
);

export default LinksTab;
