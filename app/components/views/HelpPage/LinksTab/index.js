import { shell } from "electron";
import { FormattedMessage as T } from "react-intl";
import { DescriptionHeader } from "layout";
import "style/Help.less";

const links = {
  telegram: "https://t.me/ExchangeCoinChat",
  discord: "https://discordapp.com/invite/pZe2EcH",
  support: "https://support.excc.co",
  twitter: "https://twitter.com/EXCC_Team",
  bitcointalk: "https://bitcointalk.org/index.php?topic=5023881.new",
  github: "https://github.com/EXCCoin",
  explorer: "https://explorer.excc.co/",
  miningpool: "https://pool.excc.co/",
  stakepool: "https://stakepool.excc.co/"
};

function open(link = "") {
  return () => {
    shell.openExternal(link);
  };
}

export const LinksTabHeader = () => (
  <DescriptionHeader
    description={
      <T
        id="help.description.links"
        m="If you have any difficulty with Exilibrium, please use the following links to help find a solution."
      />
    }
  />
);

const LinkItem = ({ text, name, iconClass = name }) => (
  <div className={`list-item ${iconClass}`} onClick={open(links[name])}>
    {text}
    <span className="link-item-url">{links[name]}</span>
  </div>
);

export const LinksTab = () => (
  <div className="overview-no-tickets">
    <LinkItem name="support" text={<T id="help.support" m="Support" />} />
    <LinkItem name="twitter" text={<T id="help.twitter" m="Twitter" />} />
    <LinkItem name="discord" text={<T id="help.discord" m="Discord" />} />
    <LinkItem name="telegram" text={<T id="help.telegram" m="Telegram [ENG]" />} />
    <LinkItem name="bitcointalk" text={<T id="help.forum" m="Bitcointalk" />} />
    <LinkItem name="github" text={<T id="help.github" m="Github" />} />
    <LinkItem name="explorer" text={<T id="help.explorer" m="Block Explorer" />} />
    <LinkItem name="miningpool" text={<T id="help.miningpool" m="Official Mining Pool" />} />
    <LinkItem name="stakepool" text={<T id="help.stakepools" m="Official Stake Pool" />} />
  </div>
);
