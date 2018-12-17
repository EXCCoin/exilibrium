import { FormattedMessage as T } from "react-intl";
import { StandaloneHeader, StandalonePage } from "layout";
import { ChangePassphraseButton, KeyBlueButton, MiningModalButton } from "buttons";
import GeneralSettings from "./GeneralSettings";
import "style/StakePool.less";
import "style/Settings.less";

const SettingsPageHeader = () => (
  <StandaloneHeader
    title={<T id="settings.title" m="Settings" />}
    iconClassName="settings"
    description={<T id="settings.description" m="Changing network settings requires a restart" />}
  />
);

SettingsPage.propTypes = {
  miningEnabled: PropTypes.bool,
  miningParams: PropTypes.object,
  nextAddress: PropTypes.string,
  systemInfo: PropTypes.object,
  toggleMining: PropTypes.func.isRequired,
  checkSystemInfo: PropTypes.func.isRequired
};

SettingsPage.defaultProps = {
  miningEnabled: false
};

export default function SettingsPage({
  areSettingsDirty,
  tempSettings,
  networks,
  currencies,
  locales,
  onChangeTempSettings,
  onSaveSettings,
  onAttemptChangePassphrase,
  toggleMining,
  nextAddress,
  miningEnabled,
  checkSystemInfo,
  systemInfo,
  miningParams,
  deleteDaemonData,
  getWalletReady
}) {
  return (
    <StandalonePage header={<SettingsPageHeader />}>
      <div className="settings-wrapper">
        <GeneralSettings
          {...{
            tempSettings,
            networks,
            currencies,
            locales,
            onChangeTempSettings,
            deleteDaemonData,
            getWalletReady
          }}
        />

        <div className="settings-security">
          <div className="settings-column-title">
            <T id="settings.security.title" m="Security" />
          </div>
          <div className="settings-action-buttons">
            <div className="settings-update-passphrase-button">
              <T id="settings.updatePrivatePassphrase" m="Update Private Passphrase" />
              <ChangePassphraseButton
                modalTitle={<T id="settings.changeConfirmation" m="Change your passphrase" />}
                onSubmit={onAttemptChangePassphrase}
              />
            </div>
          </div>
          <div className="settings-mining-container">
            <div className="settings-column-title">
              <T id="settings.mining.title" m="Mining" />
            </div>
            <div className="settings-action-buttons">
              <MiningModalButton
                {...{
                  miningEnabled,
                  toggleMining,
                  checkSystemInfo,
                  nextAddress,
                  miningParams,
                  systemInfo
                }}
                disabled={miningEnabled}
                buttonLabel={
                  miningEnabled ? (
                    <T id="miningModal.buttonTextEnabled" m="Mining enabled" />
                  ) : (
                    <T id="miningModal.buttonTextDisabled" m="Enable mining" />
                  )
                }
              />
            </div>
          </div>
        </div>
      </div>
      <div className="settings-save-button">
        <KeyBlueButton
          disabled={!areSettingsDirty}
          size="large"
          block={false}
          onClick={onSaveSettings}>
          <T id="settings.save" m="Save" />
        </KeyBlueButton>
      </div>
    </StandalonePage>
  );
}
