import React from "react";
import { FormattedMessage as T } from "react-intl";

import { Tooltip } from "shared";
import { LoaderBarBottom } from "indicators";
import { KeyBlueButton, InvisibleButton } from "buttons";
import GeneralSettings from "views/SettingsPage/GeneralSettings";

import { SettingsFormTypes } from "../types";

export default function SettingsForm({
  areSettingsDirty,
  tempSettings,
  networks,
  currencies,
  locales,
  onChangeTempSettings,
  onSaveSettings,
  onHideSettings,
  onShowLogs,
  getCurrentBlockCount,
  getNeededBlocks,
  getEstimatedTimeLeft,
  deleteDaemonData,
  getWalletReady
}) {
  return (
    <div className="page-body getstarted">
      <div className="logo-banner" />
      <div className="getstarted loader logs">
        <div className="content-title">
          <div className="loader-settings-logs">
            <InvisibleButton className="active">
              <T id="getStarted.btnSettings" m="Settings" />
            </InvisibleButton>
            <InvisibleButton onClick={onShowLogs}>
              <T id="getStarted.btnLogs" m="Logs" />
            </InvisibleButton>
          </div>
          <Tooltip text={<T id="logs.goBack" m="Go back" />}>
            <div className="go-back-screen-button" onClick={onHideSettings} />
          </Tooltip>
        </div>
        <GeneralSettings
          {...{
            deleteDaemonData,
            getWalletReady,
            tempSettings,
            networks,
            currencies,
            locales,
            onChangeTempSettings
          }}
        />
        <KeyBlueButton
          disabled={!areSettingsDirty}
          size="large"
          block={false}
          onClick={() => onSaveSettings(tempSettings)}>
          <T id="settings.save" m="Save" />
        </KeyBlueButton>
        <LoaderBarBottom {...{ getCurrentBlockCount, getNeededBlocks, getEstimatedTimeLeft }} />
      </div>
    </div>
  );
}

SettingsForm.propTypes = SettingsFormTypes;
