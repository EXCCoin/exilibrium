import CreateWalletForm from "./CreateWalletForm";
import ImportKeysForm from "./ImportKeysForm";
import CreationTypeSelectScreen from "./CreationTypeSelectScreen";
import "style/GetStarted.less";

const CreateForm = ({
  existingOrNew: showCreationTypeSelectScreen,
  onReturnToNewSeed,
  onReturnToWalletSelection,
  onReturnToExistingOrNewScreen,
  onSetCreateWalletFromExisting,
  getCurrentBlockCount,
  getNeededBlocks,
  getEstimatedTimeLeft,
  getDaemonSynced,
  importKeys,
  importCopay
}) =>
  showCreationTypeSelectScreen ? (
    <CreationTypeSelectScreen
      {...{
        onReturnToWalletSelection,
        onSetCreateWalletFromExisting,
        getCurrentBlockCount,
        getNeededBlocks,
        getEstimatedTimeLeft,
        getDaemonSynced
      }}
    />
  ) : importCopay ? (
    <ImportKeysForm importKeys={importKeys} />
  ) : (
    <CreateWalletForm
      {...{
        onReturnToNewSeed,
        onReturnToExistingOrNewScreen,
        getCurrentBlockCount,
        getNeededBlocks,
        getEstimatedTimeLeft
      }}
    />
  );

CreateForm.propTypes = {
  existingOrNew: PropTypes.bool.isRequired,
  onReturnToNewSeed: PropTypes.func.isRequired,
  onReturnToWalletSelection: PropTypes.func.isRequired,
  onReturnToExistingOrNewScreen: PropTypes.func.isRequired,
  onSetCreateWalletFromExisting: PropTypes.func.isRequired,
  getCurrentBlockCount: PropTypes.func,
  getNeededBlocks: PropTypes.number.isRequired,
  getEstimatedTimeLeft: PropTypes.any,
  getDaemonSynced: PropTypes.any,
  importKeys: PropTypes.any,
  importCopay: PropTypes.bool,
  importKeysForm: PropTypes.any,
  setPrivateKeysObject: PropTypes.func
};

export default CreateForm;
