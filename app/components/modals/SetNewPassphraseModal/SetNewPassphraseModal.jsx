import SetNewPassModalContent from "./SetNewPassModalContent";
import { useSetNewPassphraseModal } from "./hooks";

const SetNewPassphraseModal = ({ onCancelModal, onSubmit, ...props }) => {
  const {
    passphrase,
    confirmPrivPass,
    onCancelModalCallback,
    setPassphrase,
    isValid,
    onSubmitCallback,
    setConfirmPrivPass,
    intl
  } = useSetNewPassphraseModal({ onCancelModal, onSubmit });

  return (
    <SetNewPassModalContent
      {...props}
      {...{
        passphrase,
        confirmPrivPass,
        onCancelModal: onCancelModalCallback,
        setPassphrase,
        isValid,
        onSubmit: onSubmitCallback,
        setConfirmPrivPass,
        intl
      }}
    />
  );
};

export default SetNewPassphraseModal;
