import { FormattedMessage as T } from "react-intl";
import { HelpLink } from "buttons";
import { DescriptionHeader } from "layout";
import "style/Help.less";

export const LinksTabHeader = () => (
  <DescriptionHeader
    description={
      <T
        id="help.description.links"
        m="If you have any difficulty with exilibrium, please use the following links to help find a solution."
      />
    }
  />
);

export const LinksTab = () => (
  <div className="help-icons-list">
    <HelpLink className={"help-discord-icon"} href="https://discordapp.com/invite/pZe2EcH">
      <T id="help.discord" m="Discord" />{" "}
    </HelpLink>
    <HelpLink className={"help-common"} href="https://support.excc.co">
      <T id="help.support" m="Support" />{" "}
    </HelpLink>
    <HelpLink className={"help-twitter-icon"} href="https://twitter.com/EXCC_Team">
      <T id="help.twitter" m="Twitter" />{" "}
    </HelpLink>
    <HelpLink
      className={"help-forum-icon"}
      href="https://bitcointalk.org/index.php?topic=5023881.new">
      <T id="help.forum" m="Bitcointalk" />{" "}
    </HelpLink>
    <HelpLink className={"help-github-icon"} href="https://github.com/EXCCoin">
      <T id="help.github" m="Github" />
    </HelpLink>
    <HelpLink className={"help-stakepools-icon"} href="https://stakepool.excc.co/">
      <T id="help.stakepools" m="Stakepool" />
    </HelpLink>
  </div>
);
