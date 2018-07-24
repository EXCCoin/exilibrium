import { EXPLORER_DATA_SUCCESS } from "../actions/WalletLoaderActions";

const initialState = {
  address: null,
  slugs: {}
};

export default function explorer(state = initialState, action) {
  switch (action.type) {
    case EXPLORER_DATA_SUCCESS:
      return action.explorerData;
    default:
      return state;
  }
}
