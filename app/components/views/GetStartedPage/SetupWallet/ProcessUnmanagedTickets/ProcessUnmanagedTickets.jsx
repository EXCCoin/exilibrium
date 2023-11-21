import { useState, useEffect } from "react";
import { Tooltip } from "pi-ui";
import { Subtitle } from "shared";
import { GoBackMsg } from "../../messages";
import { FormattedMessage as T } from "react-intl";
import { PassphraseModalButton, InvisibleButton } from "buttons";
import styles from "./ProcessUnmanagedTickets.module.css";
import { BackButton, BackButtonArea } from "../../helpers";
import { VSPSelect } from "inputs";
import { useProcessUnmanagedTickets } from "./hooks";

export default ({ cancel, send, error }) => {
  const {
    isProcessingUnmanaged,
    availableVSPs,
    vsp,
    setVSP,
    onSubmitContinue
  } = useProcessUnmanagedTickets({ send });

  return (
    <div className={styles.content}>
      <BackButtonArea>
        {isProcessingUnmanaged && (
          <Tooltip content={<GoBackMsg />}>
            <BackButton onClick={cancel} />
          </Tooltip>
        )}
      </BackButtonArea>
      <Subtitle
        className={styles.subtitle}
        title={
          <T
            id="getstarted.processUnmangedTickets.title"
            m="Process Unmanaged Tickets"
          />
        }
      />
      <div className={styles.description}>
        {
          <T
            id="getstarted.processUnmangedTickets.description"
            m={`Looks like you have vsp ticket with unprocessed fee.
                If they are picked to vote and they are not linked with a vsp,
                they may miss, if you are not properly dealing with solo vote.`}
          />
        }
      </div>
      <VSPSelect
        className={styles.vspSelect}
        {...{ onChange: setVSP, options: availableVSPs }}
      />
      {error && <div className="error">{error}</div>}
      <div className={styles.buttonWrapper}>
        <PassphraseModalButton
          modalTitle={<T id="process.unmangedTickets.title" m="Passphrase" />}
          modalClassName={styles.passphraseModal}
          onSubmit={onSubmitContinue}
          buttonLabel={<T id="process.unmangedTickets.button" m="Continue" />}
          disabled={!vsp || isProcessingUnmanaged}
          loading={isProcessingUnmanaged}
        />
        <InvisibleButton
          className={styles.skipButton}
          onClick={cancel}
          disabled={isProcessingUnmanaged}>
          <T id="process.unmanagedTickets.button.skip" m="Skip" />
        </InvisibleButton>
      </div>
    </div>
  );
};
