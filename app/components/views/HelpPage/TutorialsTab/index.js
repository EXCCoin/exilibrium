import { shell } from "electron";
import { FormattedMessage as T } from "react-intl";
import { DescriptionHeader } from "layout";

export const TutorialsTabHeader = () => (
  <DescriptionHeader
    description={
      <T id="help.description.tutorials" m="Learn about the various aspects of the EXCC network." />
    }
  />
);

const open = article => () =>
  shell.openExternal(`https://support.excc.co/hc/en-us/articles/${article}`);

export const TutorialsTab = () => (
  <div className="overview-no-tickets">
    <div className="tutorial-item" onClick={open("360004934231")}>
      <T id="tutorialLink.aboutEXCC" m="About ExchangeCoin" />
    </div>
    <div className="tutorial-item" onClick={open("360004872972")}>
      <T id="tutorialLink.setup" m="Exilibrium setup guide" />
    </div>
    <div className="tutorial-item" onClick={open("360007235671")}>
      <T id="tutorialLink.howToUse" m="How to use Exlilibrium" />
    </div>
    <div className="tutorial-item" onClick={open("360006702912")}>
      <T
        id="tutorialLink.transferCopay"
        m="How to transfer funds from Copay wallet to Exlilibrium"
      />
    </div>
    <div className="tutorial-item" onClick={open("360004934011")}>
      <T id="tutorialLink.staking" m="Proof of Stake (PoS) Mining" />
    </div>
    <div className="tutorial-item" onClick={open("360004974992")}>
      <T id="tutorialLink.vote" m="Voting through Exilibrium" />
    </div>
    <div className="tutorial-item" onClick={open("360004934571")}>
      <T id="tutorialLink.buyingTickets" m="Buying tickets with exccwallet" />
    </div>
  </div>
);
