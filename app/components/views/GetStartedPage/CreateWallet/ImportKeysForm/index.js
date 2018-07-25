import React from "react";

import ImportKeysForm from "./ImportKeysForm";
import Validator from "./Validator";
import FileHandler from "./FileHandler";
import Decryptor from "./Decryptor";

export default ({ onReturnToExistingOrNewScreen }) => (
  <Validator>
    {({ validator, errorMessage }) => (
      <FileHandler {...{ validator }}>
        {({ fileHandler, encryptedString, selectedFileName }) => (
          <Decryptor {...{ encryptedString, validator }}>
            {({ decryptor, mnemonic, mnemonicHasPassphrase, walletName, encryptionPassword }) => (
              <ImportKeysForm
                {...{
                  onReturnToExistingOrNewScreen,
                  validator,
                  fileHandler,
                  decryptor,
                  mnemonic,
                  mnemonicHasPassphrase,
                  walletName,
                  encryptedString,
                  selectedFileName,
                  encryptionPassword,
                  errorMessage
                }}
              />
            )}
          </Decryptor>
        )}
      </FileHandler>
    )}
  </Validator>
);
