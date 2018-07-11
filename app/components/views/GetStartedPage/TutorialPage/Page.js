/* eslint complexity: off*/
import { KeyBlueButton, InvisibleButton } from "buttons";
import "style/Tutorial.less";
import { FormattedMessage as T, injectIntl, defineMessages } from "react-intl";
import { eql } from "fp";

const messages = defineMessages({
  step0Title: {
    id: "tutorial.step.0.title",
    defaultMessage: "What is the Exchange Coin Blockchain?"
  },
  step0TextBoldp1: {
    id: "tutorial.step.0.text.bold.p1",
    defaultMessage: "The blockchain is the ‘heart’ of EXCC. "
  },
  step0Textp1: {
    id: "tutorial.step.0.text.p1",
    defaultMessage:
      " It can be described as a global decentralised spreadsheet or ledger where the entire activity logs for EXCC fund transfers are recorded. The blockchain keeps track of the number of tokens that have been sent and the balance of every account."
  },
  step0Textp2: {
    id: "tutorial.step.0.text.p2",
    defaultMessage:
      "The blockchain is also used to confirm the validity of new transactions to ensure that there is no fraud."
  },
  step0Textp3: {
    id: "tutorial.step.0.text.p3",
    defaultMessage:
      "To validate all transactions, EXCC uses an innovative hybrid system which involves the Proof of Work (PoW) and the Proof of Stake (PoS) processes. This is how we ensure that the network is secure and make decisions based on consensus. "
  },
  step0Textp4: {
    id: "tutorial.step.0.text.p4",
    defaultMessage:
      "In return for their participation, miners (PoW) and the stakers (PoS) are rewarded with newly created EXCC coins."
  },
  step1Title: {
    id: "tutorial.step.1.title",
    defaultMessage: "What is a Wallet?"
  },
  step1Textp1: {
    id: "tutorial.step.1.text.p1",
    defaultMessage:
      "A cryptocurrency wallet is generally defined as a software program which stores private and public keys (a secure digital code known only to you and recognized by your wallet), and it enables you to send, receive, and monitor your digital currencies. Our desktop Exilibrium wallet is a tool used to interact with the blockchain and the use of your EXCC. It is mainly used to send and receive EXCC funds and acts as a personal ledger for recording all transactions. A desktop wallet is recognized as one of the safest hot wallets. It is only accessible from the device where you have installed and set-up the wallet. "
  },
  step1Textp2: {
    id: "tutorial.step.1.text.p2",
    defaultMessage:
      "Our Exilibrium wallet offers you a comprehensive security. We only use proven technology that has been very effective over the years. Your password is encrypted and well protected. The wallet features a mnemonic mechanism used for restoring private keys. Our platform is compliant with all the necessary security standards and trends associated with the new generation systems regarding the technology being used in the industry. "
  },
  step1Textp3: {
    id: "tutorial.step.1.text.p3",
    defaultMessage:
      "The Exilibrium is now available on Windows, Mac, and Linux. You can also use your Exilibrium wallet to participate in staking (PoS) and project governance by time locking your funds to receive staking tickets."
  },
  step2Title: {
    id: "tutorial.step.2.title",
    defaultMessage: "Key to Your Wallet"
  },
  step2Textp1: {
    id: "tutorial.step.2.text.p1",
    defaultMessage: "Cryptocurrency wallets can be created by a wallet seed."
  },
  step2TextBoldp1: {
    id: "tutorial.step.2.text.bold.p1",
    defaultMessage: " The mnemonic seed in Exilibrium is a list of 12 words"
  },
  step2Textp12: {
    id: "tutorial.step.2.text.p12",
    defaultMessage:
      "; it is advised that you back up this seed by copying the list on a piece of paper for safekeeping."
  },
  step2Textp2: {
    id: "tutorial.step.2.text.p2",
    defaultMessage:
      "Your wallet seed is very important. If you forget your wallet encryption passphrase or your wallet is destroyed (for example if your computer is damaged), you can use the seed to recover your wallet. The seed can also be used to export your wallet to another client’s EXCC wallet."
  },
  step2Textp4: {
    id: "tutorial.step.2.text.p4",
    defaultMessage:
      "However, failure to properly protect your seed key and keep it private can result in the theft of the entire assets stored in your wallet. Under no circumstances should you disclose your seed key to third parties. "
  },
  step3Title: {
    id: "tutorial.step.3.title",
    defaultMessage: "Staking and Governance"
  },
  step3Textp1: {
    id: "tutorial.step.3.text.p1",
    defaultMessage: "All you need to participate in staking (PoS) is available EXCC funds. "
  },
  step3TextLightp1: {
    id: "tutorial.step.3.text.light.p1",
    defaultMessage:
      "The process is different from the Proof of Work (PoW) mining that requires computing resources and electricity. You can use EXCC funds to purchase voting tickets on our network."
  },
  step3Textp2: {
    id: "tutorial.step.3.text.p2",
    defaultMessage:
      "Funds can be time-locked in return for tickets on the network. Tickets are chosen at random to vote on the validity of blocks. By average a ticket gets voted in 28 days"
  },
  step3TextLightp2: {
    id: "tutorial.step.3.text.light.p2",
    defaultMessage:
      "In every block, five tickets from the pool are randomly selected to vote on the validity of the previous block. The average time it takes for a ticket to be voted is 14 days (and possibly a maximum period of 71 days). During this period your funds will be time-locked in exchange for the tickets. A successful vote returns the stakeholder a part of the Block Reward plus the original cost of the ticket."
  },
  step3Textp3: {
    id: "tutorial.step.3.text.p3",
    defaultMessage: "In case of missing the vote"
  },
  step3TextLightp22: {
    id: "tutorial.step.3.text.pLight22",
    defaultMessage: "(0.5% probability)"
  },
  step3Textp23: {
    id: "tutorial.step.3.text.p23",
    defaultMessage:
      ", the original cost of the ticket is safely returned to the user without the reward."
  },
  step3Textp4: {
    id: "tutorial.step.3.text.p4",
    defaultMessage:
      "Changes are inevitable for all the digital currencies. EXCC’s innovative governance system is built into the blockchain. This allows a seamless adaptation to changes while the existing blockchain ecosystem is kept safe. We also have a plan to regard the tickets as a voting power when deciding on consensus based changes. This action represents our revolutionary approach to stakeholder governance, where the entire community directs projects and makes decisions together."
  },
  step4Title: {
    id: "tutorial.step.4.title",
    defaultMessage: "Safety Tips"
  },
  step4Textp2: {
    id: "tutorial.step.4.text.p2",
    defaultMessage:
      "We need to remind everyone that you are responsible for the safety of your assets. Always keep your seed key and the password safe. Make sure nobody knows your key. Prepare a backup of your seed key and the password. Do not store this information on your computer, instead, write it on a piece of paper and keep it safely or create a digital copy and save on a USB drive."
  },
  step4Textp3: {
    id: "tutorial.step.4.text.p3",
    defaultMessage:
      "It is important that you do not store your seed key in cloud storage or a password service. If your account is compromised, your funds can be stolen."
  },
  step4Textp5: {
    id: "tutorial.step.4.text.p5",
    defaultMessage:
      "Do not enter your seed key on any phishing website. Please note that nobody can reverse, cancel or refund transactions if your wallet has been compromised. "
  },
  step4Textp6: {
    id: "tutorial.step.4.text.p6",
    defaultMessage:
      "Whenever you think something does not seem right or if there is an area you do not understand, ask questions and research. Avoid making decisions based on your emotions."
  }
});

const TutorialPage = ({ intl, tutorialStep, onNextTutorialStep, onGoToStep, finishTutorial }) => {
  const tutorialStepEquals = eql(tutorialStep);
  return (
    <div className="tutorial">
      <div className={`tutorial-side step-${tutorialStep}`}>
        <div className={`tutorial-side-image step-${tutorialStep}`} />
      </div>
      <div className="tutorial-main">
        <div className="tutorial-section-header">The Basics</div>
        <div className="tutorial-main-header">
          {
            {
              0: intl.formatMessage(messages.step0Title),
              1: intl.formatMessage(messages.step1Title),
              2: intl.formatMessage(messages.step2Title),
              3: intl.formatMessage(messages.step3Title),
              4: intl.formatMessage(messages.step4Title)
            }[tutorialStep]
          }
        </div>
        <div className="tutorial-main-text">
          {
            {
              0: (
                <Aux>
                  <div className="column">
                    <p>
                      <span className="bold">{intl.formatMessage(messages.step0TextBoldp1)} </span>
                      {intl.formatMessage(messages.step0Textp1)}
                    </p>
                    <p>{intl.formatMessage(messages.step0Textp2)}</p>
                  </div>
                  <div className="column">
                    <p>{intl.formatMessage(messages.step0Textp3)}</p>
                    <p>{intl.formatMessage(messages.step0Textp4)}</p>
                  </div>
                </Aux>
              ),
              1: (
                <Aux>
                  <div className="column">
                    <p>{intl.formatMessage(messages.step1Textp1)}</p>
                  </div>
                  <div className="column">
                    <p>{intl.formatMessage(messages.step1Textp2)}</p>
                    <p>{intl.formatMessage(messages.step1Textp3)}</p>
                  </div>
                </Aux>
              ),
              2: (
                <Aux>
                  <div className="column">
                    <p>
                      {intl.formatMessage(messages.step2Textp1)}{" "}
                      <span className="bold">{intl.formatMessage(messages.step2TextBoldp1)} </span>
                      {intl.formatMessage(messages.step2Textp12)}
                    </p>
                    <p>{intl.formatMessage(messages.step2Textp2)}</p>
                  </div>
                  <div className="column">
                    <p>
                      <span className="bold">{intl.formatMessage(messages.step2Textp4)}</span>
                    </p>
                  </div>
                </Aux>
              ),
              3: (
                <Aux>
                  <div className="column">
                    <p>
                      <span className="bold">{intl.formatMessage(messages.step3Textp1)} </span>
                      {intl.formatMessage(messages.step3TextLightp1)}
                    </p>
                    <p>{intl.formatMessage(messages.step3TextLightp2)} </p>
                  </div>
                  <div className="column">
                    <p>
                      {intl.formatMessage(messages.step3Textp3)}{" "}
                      {intl.formatMessage(messages.step3TextLightp22)}{" "}
                      {intl.formatMessage(messages.step3Textp23)}
                    </p>
                    <p>{intl.formatMessage(messages.step3Textp4)}</p>
                  </div>
                </Aux>
              ),
              4: (
                <Aux>
                  <div className="column">
                    <p>{intl.formatMessage(messages.step4Textp2)}</p>
                    <p>{intl.formatMessage(messages.step4Textp3)}</p>
                  </div>
                  <div className="column">
                    <p>{intl.formatMessage(messages.step4Textp5)}</p>
                    <p>
                      <span className="bold">{intl.formatMessage(messages.step4Textp6)}</span>
                    </p>
                  </div>
                </Aux>
              )
            }[tutorialStep]
          }
        </div>
        <div className="tutorial-main-toolbar">
          <KeyBlueButton
            className="next-button"
            onClick={tutorialStep < 4 ? onNextTutorialStep : finishTutorial}>
            <T id="tutorial.nextBtn" m={"Next"} />
          </KeyBlueButton>
          <div className="tutorial-main-toolbar-step-indicators">
            <div
              className={tutorialStepEquals(0) ? "current" : tutorialStep > 0 ? "checked" : ""}
              onClick={tutorialStep !== 0 ? () => onGoToStep(0) : null}
            />
            <div
              className={
                tutorialStepEquals(1)
                  ? "current"
                  : tutorialStep > 1
                    ? "checked"
                    : tutorialStep < 1
                      ? "unchecked"
                      : ""
              }
              onClick={tutorialStep !== 1 ? () => onGoToStep(1) : null}
            />
            <div
              className={
                tutorialStepEquals(2)
                  ? "current"
                  : tutorialStep > 2
                    ? "checked"
                    : tutorialStep < 2
                      ? "unchecked"
                      : ""
              }
              onClick={tutorialStep !== 2 ? () => onGoToStep(2) : null}
            />
            <div
              className={
                tutorialStepEquals(3)
                  ? "current"
                  : tutorialStep > 3
                    ? "checked"
                    : tutorialStep < 3
                      ? "unchecked"
                      : ""
              }
              onClick={tutorialStep !== 3 ? () => onGoToStep(3) : null}
            />
            <div
              className={
                tutorialStepEquals(4)
                  ? "current"
                  : tutorialStep > 4
                    ? "checked"
                    : tutorialStep < 4
                      ? "unchecked"
                      : ""
              }
              onClick={tutorialStep !== 4 ? () => onGoToStep(4) : null}
            />
          </div>
          {tutorialStep < 4 && (
            <InvisibleButton className="skip-button" onClick={finishTutorial}>
              <T id="tutorial.skipBtn" m={"Skip"} />
            </InvisibleButton>
          )}
        </div>
      </div>
    </div>
  );
};
export default injectIntl(TutorialPage);
