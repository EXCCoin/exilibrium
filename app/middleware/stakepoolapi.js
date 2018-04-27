import axios from "axios";
import querystring from "querystring";

// stakepPoolInfoResponseToConfig converts a response object for the
// stakePoolInfo call into an object array of available stakepool configs.
function stakepPoolInfoResponseToConfig(response) {
  const stakePoolNames = Object.keys(response.data);
  return stakePoolNames
    .map(name => {
      const { APIEnabled, URL, Network, APIVersionsSupported } = response.data[name];
      return !APIEnabled ? null : { Host: URL, Network, APIVersionsSupported };
    })
    .filter(v => v);
}

export function stakePoolInfo(cb) {
  axios
    .get("https://api.excc.co/?c=gsd")
    .then(response => {
      cb(stakepPoolInfoResponseToConfig(response));
    })
    .catch(error => {
      console.log("Error contacting remote stakepools api.", error);
      cb(null, error);
    });
}

export function setStakePoolAddress(apiUrl, apiToken, pKAddress, cb) {
  const config = {
    headers: {
      Authorization: `Bearer ${apiToken}`
    }
  };
  const url = `${apiUrl}/api/v1/address`;
  axios
    .post(
      url,
      querystring.stringify({
        UserPubKeyAddr: pKAddress
      }),
      config
    )
    .then(response => {
      cb(response);
    })
    .catch(error => {
      cb(null, error);
    });
}

export function setVoteChoices(apiUrl, apiToken, voteChoices, cb) {
  const config = {
    headers: {
      Authorization: `Bearer ${apiToken}`
    }
  };
  const url = `${apiUrl}/api/v2/voting`;
  axios
    .post(
      url,
      querystring.stringify({
        VoteBits: voteChoices.toString()
      }),
      config
    )
    .then(response => {
      cb(response);
    })
    .catch(error => {
      cb(null, error);
    });
}

export function getPurchaseInfo(apiUrl, apiToken, cb) {
  const config = {
    headers: {
      Authorization: `Bearer ${apiToken}`
    }
  };
  const url = `${apiUrl}/api/v1/getpurchaseinfo`;
  axios
    .get(url, config)
    .then(response => {
      cb(response, null, apiUrl);
    })
    .catch(error => {
      cb(null, error, apiUrl);
    });
}
