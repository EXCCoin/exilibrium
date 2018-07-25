import React, { Component } from "react";
import { FormattedMessage as T } from "react-intl";

@autobind
export default class Validator extends Component {
  state = { errorMessage: "" };
  checkJSON(fileContents) {
    try {
      JSON.parse(fileContents);
      return true;
    } catch (e) {
      this.setState({
        errorMessage: (
          <T id="wallet.importkeys.error.invalidJSON" m="Selected file content is not valid JSON" />
        )
      });
      return false;
    }
  }
  fileExists(selectedFile) {
    if (selectedFile) {
      return true;
    }
    this.setState({ errorMessage: <T id="wallet.importkeys.error.noFile" m="No file selected" /> });
    return false;
  }
  resetErrorMessage() {
    this.setState({ errorMessage: "" });
  }
  checkFileMetadata(selectedFile) {
    const correctExtension = selectedFile.name.includes(".json");

    if (!correctExtension) {
      this.setState({
        errorMessage: !correctExtension ? (
          <T
            id="wallet.importkeys.error.incorrectExtension"
            m="Please select file with extension '.json'. Selected: {fileName}"
            values={{ fileName: selectedFile.name }}
          />
        ) : (
          ""
        )
      });
      return false;
    }

    return true;
  }

  decryptionFailed(err) {
    let errorMessage = "Unknown error";
    switch (err.toString()) {
      case "CORRUPT: ccm: tag doesn't match":
        errorMessage = "Incorrect password";
        break;
      default:
        errorMessage = err.toString();
    }
    this.setState({
      errorMessage: (
        <T
          id="wallet.importkeys.error.decryptionFailed"
          m="File decryption failed: {errorMessage}"
          values={{ errorMessage }}
        />
      )
    });
    return false;
  }

  validateKeys(fileContents) {
    const parsed = JSON.parse(fileContents);
    const requiredKeys = ["iv", "v", "iter", "ks", "ts", "mode", "adata", "cipher", "salt", "ct"];

    for (const key of requiredKeys) {
      if (!parsed.hasOwnProperty(key)) {
        this.setState({
          errorMessage: (
            <T
              id="wallet.importkeys.error.noField"
              m="Required field '{field}' doesn't exist"
              values={{ field: key }}
            />
          )
        });
        return false;
      }
    }

    const expectedValues = { mode: "ccm", cipher: "aes" };

    for (const [key, value] of Object.entries(expectedValues)) {
      if (parsed[key] !== value) {
        this.setState({
          errorMessage: (
            <T
              id="wallet.importkeys.error.incorrectFieldValue"
              m="Invalid '{paramName}' parameter value: {paramValue}, expected: {expectedValue}"
              values={{
                paramName: key,
                expectedValue: value,
                paramValue: parsed[key]
              }}
            />
          )
        });
        return false;
      }
    }

    return true;
  }
  render() {
    return this.props.children({
      validator: {
        validateKeys: this.validateKeys,
        decryptionFailed: this.decryptionFailed,
        resetErrorMessage: this.resetErrorMessage,
        checkFileMetadata: this.checkFileMetadata,
        fileExists: this.fileExists,
        checkJSON: this.checkJSON
      },
      errorMessage: this.state.errorMessage
    });
  }
}
