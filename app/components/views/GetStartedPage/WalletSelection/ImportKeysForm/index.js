import React from "react";

import ImportKeysForm from "./ImportKeysForm";
import Validator from "./Validator";
import FileHandler from "./FileHandler";
import Decryptor from "./Decryptor";

export default ({ submitSection }) => (
  <Validator>
    {({ validator, errorMessage }) => (
      <FileHandler {...{ validator }}>
        {({ fileHandler, encryptedString, selectedFileName }) => (
          <Decryptor {...{ encryptedString, validator }}>
            {({ decryptor, mnemonic, walletName, encryptionPassword }) => (
              <ImportKeysForm
                {...{
                  validator,
                  fileHandler,
                  decryptor,
                  mnemonic,
                  walletName,
                  encryptedString,
                  selectedFileName,
                  encryptionPassword,
                  errorMessage,
                  submitSection
                }}
              />
            )}
          </Decryptor>
        )}
      </FileHandler>
    )}
  </Validator>
);
