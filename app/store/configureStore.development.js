import { createStore, applyMiddleware, compose } from "redux";
import thunk from "redux-thunk";
import { routerMiddleware, push } from "react-router-redux";
import { createLogger } from "redux-logger";
//import immutableStateInvariantMiddleware from "redux-immutable-state-invariant";
import rootReducer from "../reducers";

export default function configureStore(initialState, history) {
  const actionCreators = {
    push
  };

  const logger = createLogger({
    level: "info",
    collapsed: true
  });

  const router = routerMiddleware(history);

  // If Redux DevTools Extension is installed use it, otherwise use Redux compose
  /* eslint-disable no-underscore-dangle */
  const composeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__
    ? window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__({
        // Options: http://zalmoxisus.github.io/redux-devtools-extension/API/Arguments.html
        actionCreators
      })
    : compose;
  /* eslint-enable no-underscore-dangle */
  const enhancer = composeEnhancers(
    applyMiddleware(
      // immutableStateInvariantMiddleware({
      // ignore: [
      // "notifications.transactionNtfns", // stream - notifications actions
      // "notifications.accountNtfns", // stream - notifications actions
      // "control.rescanCall", // stream - control actions
      // "grpc.tickets" // to investigate - getWalletService + Router
      // ]
      // }),
      thunk,
      router,
      logger
    )
  );

  const store = createStore(rootReducer, initialState, enhancer);

  if (module.hot) {
    module.hot.accept("../reducers", () => {
      store.replaceReducer(require("../reducers"));
    });
  }

  return store;
}
