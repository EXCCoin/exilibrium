import PropTypes from "prop-types";

const { string, number, bool, func, object, shape, any, arrayOf, element, oneOfType } = PropTypes;

const WalletTypes = shape({
  label: string,
  network: string,
  finished: bool,
  value: shape({
    finished: bool,
    network: string,
    wallet: string
  })
});

export const GetStartedPageTypes = {
  // state
  appVersion: any,
  setLanguage: any,
  showTutorial: any,
  startStepIndex: number,
  isInputRequest: any,
  startupError: any,
  confirmNewSeed: any,
  existingOrNew: bool,
  importCopay: bool,
  hasExistingWallet: any,
  getDaemonStarted: any,
  getDaemonSynced: any,
  getCurrentBlockCount: any,
  getNeededBlocks: any,
  getWalletReady: any,
  getEstimatedTimeLeft: any,
  isPrepared: any,
  isTestNet: any,
  network: any,
  isAdvancedDaemon: any,
  openForm: any,
  isOpeningWallet: any,
  remoteAppdataError: any,
  rescanEndBlock: any,
  rescanStartBlock: any,
  rescanCurrentBlock: any,
  availableWallets: arrayOf(WalletTypes),
  walletName: any,
  previousWallet: any,
  availableLanguages: any,
  locale: any,
  defaultLocale: any,
  updateAvailable: any,
  // dispatch
  determineNeededBlocks: func.isRequired,
  prepStartDaemon: func.isRequired,
  onShowTutorial: func.isRequired,
  onShowLanguage: func.isRequired,
  onShowGetStarted: func.isRequired,
  onSelectLanguage: func.isRequired,
  finishTutorial: func.isRequired,
  onReturnToNewSeed: func.isRequired,
  onReturnToWalletSelection: func.isRequired,
  onReturnToExistingOrNewScreen: func.isRequired,
  onSetCreateWalletFromExisting: func.isRequired,
  onDiscoverAddresses: func.isRequired,
  onOpenWallet: func.isRequired,
  onRetryStartRPC: func.isRequired,
  doVersionCheck: func.isRequired,
  onStartDaemon: func.isRequired,
  onStartWallet: func.isRequired,
  onCreateWallet: func.isRequired,
  onImportKeys: func.isRequired,
  onRemoveWallet: func.isRequired,
  setCredentialsAppdataError: func.isRequired,
  onGetAvailableWallets: func.isRequired
};

export const WalletSelectionBodyBaseTypes = {
  availableWallets: arrayOf(WalletTypes),
  createWallet: func.isRequired,
  showCreateWalletForm: func.isRequired,
  hideCreateWalletForm: func.isRequired,
  createWalletForm: bool.isRequired,
  startWallet: func.isRequired,
  onRemoveWallet: func.isRequired,
  selectedWallet: WalletTypes,
  onChangeAvailableWallets: func.isRequired,
  onChangeCreateWalletName: func.isRequired,
  newWalletName: string.isRequired
};

export const CreateWalletFormTypes = {
  newWalletName: string.isRequired,
  onChangeCreateWalletName: func.isRequired,
  intl: object.isRequired
};

export const SettingsFormTypes = {
  areSettingsDirty: bool.isRequired,
  tempSettings: shape({
    locale: string.isRequired,
    daemonStartAdvanced: bool.isRequired
  }).isRequired,
  networks: arrayOf(
    shape({
      name: string.isRequired
    })
  ),
  currencies: arrayOf(
    shape({
      name: string.isRequired
    })
  ),
  locales: arrayOf(
    shape({
      description: string.isRequired,
      formats: object.isRequired,
      key: string.isRequired,
      language: string.isRequired,
      messages: object.isRequired
    })
  ),
  onChangeTempSettings: func.isRequired,
  onAttemptChangePassphrase: func,
  onSaveSettings: func.isRequired,
  onHideSettings: func.isRequired,
  onShowLogs: func.isRequired,
  getCurrentBlockCount: number,
  getNeededBlocks: number,
  getEstimatedTimeLeft: number
};

export const LogsFormTypes = {
  onHideLogs: func.isRequired,
  onShowSettings: func.isRequired,
  getCurrentBlockCount: number,
  getNeededBlocks: number,
  getEstimatedTimeLeft: number
};

export const ReleaseNotesFormTypes = {
  onHideReleaseNotes: func.isRequired,
  onShowSettings: func.isRequired,
  onShowLogs: func.isRequired,
  getCurrentBlockCount: number,
  getNeededBlocks: number,
  getEstimatedTimeLeft: number,
  appVersion: string.isRequired
};

export const ImportKeysFormTypes = {
  decryptor: shape({
    decrypt: func.isRequired,
    onPasswordChange: func.isRequired,
    resetState: func.isRequired
  }).isRequired,
  validator: shape({
    resetErrorMessage: func.isRequired
  }),
  fileHandler: shape({
    onFileChange: func.isRequired,
    resetState: func.isRequired
  }),
  mnemonic: arrayOf(string).isRequired,
  encryptedString: string.isRequired,
  importKeys: func.isRequired,
  encryptionPassword: string.isRequired,
  errorMessage: oneOfType([element, string]).isRequired,
  selectedFileName: string.isRequired
};
