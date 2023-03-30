import { useWalletError } from "./hooks";
import styles from "./WalletError.module.css";

const WalletError = () => {
  const { getNetworkError } = useWalletError();
  return (
    <div>
      <div>
        {getNetworkError ? (
          <p>
            {getNetworkError} Please verify that your exccd is configured
            correctly and restart.
          </p>
        ) : (
          <p>
            {" "}
            We have detected that your wallet has disconnected. Please reload
            ExchangeCoin to fix this problem.{" "}
          </p>
        )}
      </div>
    </div>
  );
};

export default WalletError;
