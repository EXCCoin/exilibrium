const { ipcRenderer } = require("electron");
ipcRenderer.on("exes-versions", (event, versions) => {
  document.getElementById("exilibriumVersion").innerHTML = versions.exilibrium;
  document.getElementById("exccdVersion").innerHTML = versions.exccd;
  document.getElementById("exccwalletVersion").innerHTML = versions.exccwallet;
  document.getElementById("walletGrpcVersion").innerHTML = versions.grpc.walletVersion;
  document.getElementById("requiredWalletGrpcVersion").innerHTML = versions.grpc.requiredVersion;
  document.getElementById(
    "whatsNewLink"
  ).href = `https://github.com/EXCCoin/exilibrium/releases/tag/v${versions.exilibrium}`;
});
