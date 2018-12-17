import { LinearProgressFull, ExccLoading } from "indicators";
import { FormattedMessage as T, FormattedRelative } from "react-intl";
import { SlateGrayButton, InvisibleButton } from "buttons";
import { Tooltip } from "shared";
import { shell } from "electron";
import "style/GetStarted.less";

export default ({
  Form,
  text,
  barText,
  isInputRequest,
  getCurrentBlockCount,
  getDaemonStarted,
  getDaemonSynced,
  getNeededBlocks,
  finishDateEstimation,
  onShowSettings,
  onShowLogs,
  onShowTutorial,
  startupError,
  updateAvailable,
  ...props
}) => (
  <div className="page-body getstarted">
    <div className="logo-banner" />
    <div className="getstarted loader">
      <Aux>
        <div className="content-title">
          <div className="loader-settings-logs">
            {updateAvailable && (
              <Tooltip
                text={
                  <T
                    id="getStarted.updateAvailableTooltip"
                    m="New version {version} available"
                    values={{ version: updateAvailable }}
                  />
                }>
                <InvisibleButton
                  className="update-available-button"
                  onClick={() =>
                    shell.openExternal("https://github.com/EXCCoin/excc-binaries/releases")
                  }>
                  <T id="getStarted.updateAvailable" m="Update Available" />
                </InvisibleButton>
              </Tooltip>
            )}
            <InvisibleButton onClick={onShowSettings}>
              <T id="getStarted.btnSettings" m="Settings" />
            </InvisibleButton>
            <InvisibleButton onClick={onShowLogs}>
              <T id="getStarted.btnLogs" m="Logs" />
            </InvisibleButton>
          </div>
          <T id="loader.title" m={"Welcome to Exilibrium Wallet"} />
        </div>
        <div className="loader-buttons">
          <SlateGrayButton className="tutorial-button" onClick={onShowTutorial}>
            <T id="getStarted.learnBasics" m="Learn the Basics" />
          </SlateGrayButton>
          {/* <span onClick={onShowReleaseNotes} className="whatsnew">
             <T
               id="getStarted.whatsNew"
               m="What's New in v{version}"
               values={{ version: appVersion }}
             />
           </span>*/}
        </div>
        <div className="loader-bar">
          <LinearProgressFull
            error={startupError}
            getDaemonSynced={getDaemonSynced}
            disabled={!getDaemonStarted || getCurrentBlockCount === null}
            barText={barText}
            min={0}
            max={getNeededBlocks}
            value={getCurrentBlockCount}
          />
          {!getDaemonStarted || getCurrentBlockCount === null || getDaemonSynced ? (
            <div className="loader-bar-estimation" />
          ) : (
            <div className="loader-bar-estimation">
              <T id="getStarted.chainLoading.syncEstimation" m="Estimated time left" />
              <span className="bold">
                {" "}
                {finishDateEstimation ? <FormattedRelative value={finishDateEstimation} /> : "--"} (
                {getCurrentBlockCount} / {getNeededBlocks})
              </span>
            </div>
          )}
        </div>
        <div className="loader-bar-icon">
          {text &&
            !startupError && (
              <div className="loader-bar-icon-text">
                {text}
                ...
              </div>
            )}
          {startupError && <div className="loader-bar-icon-text error">{startupError}</div>}
          <ExccLoading hidden={startupError || isInputRequest} />
        </div>
        {Form && <Form {...{ ...props, isInputRequest, startupError }} />}
      </Aux>
    </div>
  </div>
);
