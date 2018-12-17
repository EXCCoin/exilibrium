import { FormattedMessage as T } from "react-intl";
import { SettingsInput, LanguageSelect, NumericInput } from "inputs";
import { InfoModalButton, RemoveDaemonButton } from "buttons";
import { GapLimitInfoModalContent } from "modals";
import "style/LanguageSelect.less";

// Do **not** add stuff that depends on the wallet here, as this is also used
// for startup config.
const GeneralSettings = ({
  tempSettings,
  currencies,
  locales,
  onChangeTempSettings,
  deleteDaemonData,
  getWalletReady
}) => {
  return (
    <div className="settings-general">
      <div className="settings-column-title">
        <T id="settings.general.title" m="General" />
      </div>
      <div className="settings-column-content">
        {Boolean(getWalletReady) && (
          <div className="settings-row">
            <div className="settings-label">
              <T id="settings.displayedUnits" m="Displayed Units" />
            </div>
            <SettingsInput
              className="settings-input"
              value={tempSettings.currencyDisplay}
              onChange={newCurrency => onChangeTempSettings({ currencyDisplay: newCurrency.name })}
              valueKey="name"
              labelKey="name"
              options={currencies}
            />
          </div>
        )}

        <div className="settings-row">
          <div className="settings-label">
            <T id="settings.locale" m="Locale" />
          </div>
          <LanguageSelect
            className="language-select-input"
            value={tempSettings.locale}
            onChange={newLocale => onChangeTempSettings({ locale: newLocale.key })}
            valueKey="key"
            labelKey="description"
            options={locales}
          />
        </div>

        <div className="settings-row">
          <div className="settings-label">
            <T id="settings.advancedDaemon.label" m="Advanced Daemon Startup" />
          </div>
          <SettingsInput
            className="settings-input"
            value={tempSettings.daemonStartAdvanced ? "true" : "false"}
            onChange={opt => onChangeTempSettings({ daemonStartAdvanced: opt.value })}
            valueKey="key"
            labelKey="description"
            options={[
              {
                key: "true",
                value: true,
                description: <T id="settings.advancedDaemon.true" m="Enabled" />
              },
              {
                key: "false",
                value: false,
                description: <T id="settings.advancedDaemon.false" m="Disabled" />
              }
            ]}
          />
        </div>
        {Boolean(getWalletReady) && (
          <div className="settings-row">
            <div className="settings-label">
              <InfoModalButton
                modalTitle={
                  <h1>
                    <T id="settings.gapLimit.information" m="Gap Limit information" />
                  </h1>
                }
                modalContent={<GapLimitInfoModalContent />}
              />
              <T id="settings.gapLimit.label" m="Gap Limit" />
            </div>
            <div className="settings-input">
              <NumericInput
                value={tempSettings.gapLimit}
                onChange={e => onChangeTempSettings({ gapLimit: e.target.value })}
              />
            </div>
          </div>
        )}
        {!getWalletReady && (
          <div className="settings-row">
            <RemoveDaemonButton
              className="fatal-remove-button"
              modalTitle={<T id="fatal.removeConfirmModal.title" m="Remove daemon data" />}
              modalContent={
                <T
                  id="fatal.removeConfirmModal.content"
                  m="Warning this action is permanent! Please make sure you want to remove your blockchain data before proceeding."
                />
              }
              onSubmit={deleteDaemonData}
              buttonLabel={<T id="fatal.button.delete" m="Delete and Shutdown" />}
            />
          </div>
        )}
      </div>
    </div>
  );
};

GeneralSettings.propTypes = {
  tempSettings: PropTypes.object.isRequired,
  currencies: PropTypes.array.isRequired,
  locales: PropTypes.array.isRequired,
  onChangeTempSettings: PropTypes.func.isRequired
};

export default GeneralSettings;
