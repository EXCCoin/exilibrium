import { Component } from "react";
import PropTypes from "prop-types";

@autobind
class FileHandler extends Component {
  static propTypes = {
    validator: PropTypes.shape({
      validateKeys: PropTypes.func.isRequired,
      checkJSON: PropTypes.func.isRequired,
      checkFileMetadata: PropTypes.func.isRequired,
      fileExists: PropTypes.func.isRequired,
      resetErrorMessage: PropTypes.func.isRequired
    })
  };
  constructor(props) {
    super(props);
    this.state = this.getInitialState();
  }
  getInitialState() {
    return {
      selectedFileName: "",
      encryptedString: ""
    };
  }
  resetState() {
    this.setState(this.getInitialState());
  }
  fileLoadHandler(event) {
    if (event && event.target && event.target.result) {
      const { validator } = this.props;
      if (validator.checkJSON(event.target.result)) {
        this.setState({ encryptedString: event.target.result });
        validator.validateKeys(event.target.result);
      }
    }
  }
  handleChange(e) {
    const { validator } = this.props;
    const [selectedFile] = e.target.files;

    if (!validator.fileExists(selectedFile)) {
      return;
    }

    if (validator.checkFileMetadata(selectedFile)) {
      validator.resetErrorMessage();
      this.setState({ selectedFileName: selectedFile.name });
      const reader = new FileReader();
      reader.onload = this.fileLoadHandler;
      reader.readAsText(selectedFile);
    }
    e.target.value = "";
  }
  render() {
    const { selectedFileName, encryptedString } = this.state;
    return this.props.children({
      fileHandler: {
        onFileChange: this.handleChange,
        resetState: this.resetState
      },
      selectedFileName,
      encryptedString
    });
  }
}

export default FileHandler;
