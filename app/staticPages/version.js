
let ipcRenderer = require("electron").ipcRenderer;
ipcRenderer.on("exes-versions", function (event, versions) {
  document.getElementById("exilibriumVersion").innerHTML = versions["exilibrium"];
  document.getElementById("exccdVersion").innerHTML = versions["exccd"];
  document.getElementById("exccwalletVersion").innerHTML = versions["exccwallet"];
  document.getElementById("walletGrpcVersion").innerHTML = versions["grpc"]["walletVersion"];
  document.getElementById("requiredWalletGrpcVersion").innerHTML = versions["grpc"]["requiredVersion"];
  document.getElementById("whatsNewLink").href =
    `https://github.com/EXCCoin/excc-binaries/releases/tag/v${versions["exilibrium"]}`;
});
