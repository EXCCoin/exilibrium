import Modal from "../Modal";
import { SlateGrayButton, KeyBlueButton } from "buttons";
import { AddressInput, IntegerInput } from "inputs";
import { FormattedMessage as T } from "react-intl";

@autobind
export default class MiningModal extends React.Component {
  static propTypes = {
    onCancelModal: PropTypes.func.isRequired,
    checkSystemInfo: PropTypes.func.isRequired,
    show: PropTypes.bool,
    systemInfo: PropTypes.shape({
      cores: PropTypes.number,
      totalMemory: PropTypes.number,
      availableMemory: PropTypes.number
    }),
    nextAddress: PropTypes.string.isRequired,
    miningParams: PropTypes.object
  };

  static defaultProps = {
    show: false,
    systemInfo: {}
  };

  state = { CPUCores: 1, CPUError: "" };

  componentDidUpdate(prevProps) {
    const { show, checkSystemInfo, systemInfo, miningParams } = this.props;
    if (show && !prevProps.show) {
      checkSystemInfo();
      if (miningParams) {
        this.setState({ CPUCores: miningParams.cores, miningAddress: miningParams.address });
      }
    }
    if (systemInfo.cores && !prevProps.systemInfo.cores) {
      this.CPUCoresChangeHandler({ target: { value: this.state.CPUCores } });
    }
  }

  CPUCoresChangeHandler(e) {
    const { value: coresNumber } = e.target;
    const { cores, availableMemory } = this.props.systemInfo;

    if (cores && availableMemory && coresNumber) {
      const invalidConditions = {
        coresNumberExceeded: coresNumber > cores,
        memoryExceeded: coresNumber * 2500000000 >= availableMemory
      };
      if (invalidConditions.coresNumberExceeded) {
        this.setState({
          CPUError: <T id="miningModal.error.coresExceeded" m="Cores number exceeded" />,
          CPUCores: coresNumber
        });
        return;
      }

      if (invalidConditions.memoryExceeded) {
        this.setState({
          CPUError: <T id="miningModal.error.memoryExceeded" m="Not enough memory available" />,
          CPUCores: coresNumber
        });
        return;
      }
    }
    if (!coresNumber) {
      this.setState({
        CPUError: "",
        CPUCores: coresNumber
      });
    }

    this.setState({
      CPUError: "",
      CPUCores: coresNumber
    });
  }

  getMemoryInGB(memoryInBytes) {
    if (memoryInBytes) {
      return (memoryInBytes / 1000000000).toFixed(2);
    }
    return "-";
  }

  onSubmit() {
    const { CPUCores } = this.state;
    const { miningEnabled, nextAddress, toggleMining, checkSystemInfo } = this.props;
    if (miningEnabled) {
      toggleMining(false);
    } else {
      toggleMining(true, CPUCores, nextAddress);
    }
    // check memory use a few times after change
    for (const i of [1, 2, 3, 4, 5]) {
      setTimeout(checkSystemInfo, 1500 * i);
    }
  }

  render() {
    const { onCancelModal, show, systemInfo, miningEnabled, nextAddress } = this.props;
    const { CPUCores, CPUError } = this.state;
    const [totalMemory, availableMemory] = [systemInfo.totalMemory, systemInfo.availableMemory].map(
      this.getMemoryInGB
    );
    const isValid = !CPUError && CPUCores;

    return (
      <Modal className="mining-modal" {...{ show }}>
        <div className="mining-modal-header">
          <div className="mining-modal-header-title">
            <T id="miningModal.title" m="Enable mining" />
          </div>
          <SlateGrayButton className="mining-modal-close-button" onClick={onCancelModal}>
            <T id="infoModal.btnClose" m="Close" />
          </SlateGrayButton>
        </div>
        <div className="mining-modal-content">
          <div>
            <div className="mining-modal-system-info-title">
              <T id="miningModal.systemInfo.title" m="System Info" />
            </div>
            <div className="mining-modal-system-info-content">
              <button
                className="rescan-button mining-modal-system-info-refresh-button"
                onClick={this.props.checkSystemInfo}
              />
              <T id="miningModal.systemInfo.cores" m="CPU threads:" />{" "}
              <strong className="mining-modal-system-info-stat">{systemInfo.cores}</strong>
              <T id="miningModal.systemInfo.memory" m="Available memory:" />{" "}
              <strong>
                {availableMemory}
                {" / "}
                {totalMemory}
                GB
              </strong>
            </div>
          </div>
          <div className="mining-modal-input-container">
            <T id="miningModal.addressInput.label" m="Mining address (current receive address)" />
            <AddressInput value={nextAddress} disabled />
          </div>
          <div className="mining-modal-input-container">
            <T id="miningModal.coresInput.label" m="Mining threads" />
            <IntegerInput
              disabled={miningEnabled}
              value={CPUCores}
              onChange={this.CPUCoresChangeHandler}
            />
            <div className="mining-modal-error-message">{CPUError}</div>
          </div>
          <div className="mining-modal-note">
            <div>
              <strong>
                <T id="miningModal.importantNote.0" m="NOTE" />
              </strong>
              {": "}
              <T
                id="miningModal.importantNote.1"
                m="mining on each CPU thread require 2.5 GB memory."
              />
            </div>
            <T
              id="miningModal.importantNote.2"
              m="For example: mining on 2 threads will use 5GB of RAM."
            />
          </div>
          <KeyBlueButton
            disabled={this.props.miningEnabled ? false : !isValid}
            className="mining-modal-save-button"
            onClick={this.onSubmit}>
            {miningEnabled ? (
              <T id="miningModal.buttonText.confirmDisable" m="Disable" />
            ) : (
              <T id="miningModal.buttonText.confirmEnable" m="Enable" />
            )}
          </KeyBlueButton>
        </div>
      </Modal>
    );
  }
}
