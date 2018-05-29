const fs = require("fs");
const { spawn } = require("child_process");
const { promisify } = require("util");
const chalk = require("chalk");

const readdirAsync = promisify(fs.readdir);
const readFileAsync = promisify(fs.readFile);
const unlinkFileAsync = promisify(fs.unlink);
const writeFileAsync = promisify(fs.writeFile);

const existing = {
  edit: "account-rename",
  "address-book": ["accounts-active", "accounts-default", "accounts-hover", "accountspage"],
  "plus-square": "add",
  "caret-down": ["arrow-down-key-blue", "arrow-down-mid-blue"],
  "caret-right": ["arrow-right-gray", "arrow-right-key-blue"],
  "arrow-left": "arrow",
  "caret-up": ["arrow-up-key-blue", "arrow-up-light-blue", "arrow-up-turquiose", "menu-arrow-up"],
  "balance-scale-left": "balance-to-maintain",
  database: "blockchain",
  coins: "buy-excc",
  "ellipsis-h": ["changepasswordDefault", "indicator-pending"],
  eye: "contextbutton-eye-default",
  "eye-slash": "contextbutton-eye-disabled",
  "clipboard-check": ["copy-to-clipboard-blue", "copy-to-clipboard-gray"],
  wallet: ["createnewwallet", "menu-wallet", "restorewallet", "wallet-blue", "wallet-gray"],
  "times-circle": [
    "delete",
    "indicator-invalid",
    "menu-cancel-rescan",
    "tickets-agenda-close",
    "x-grey"
  ],
  book: ["docsActive", "docsDefault"],
  square: "dummy-icon",
  stopwatch: "expiry",
  comments: ["forumActive", "forumDefault"],
  gavel: ["gavelActive", "gavelDefault"],
  "file-plus": "generate-address",
  bars: "hamburger",
  "hands-helping": ["help-active", "help-default", "help-hover"],
  "info-circle": ["helppage", "tickets-info"],
  "question-circle": "help",
  "inbox-in": "import-script",
  "check-circle": ["indicator-confirmed", "indicator-finished"],
  "power-off": [
    "LauncherCurrentWalletDeactivateHover",
    "LauncherCurrentWalletDeactivate",
    "LauncherNetworkActive",
    "LauncherWalletActivateHover",
    "LauncherWalletActivate",
    "network"
  ],
  trash: ["LauncherWalletDeleteHover", "LauncherWalletDelete"],
  "chart-pie": "max-fee",
  "box-up": "max-per-block",
  "sort-amount-up": "max-price-absolute",
  indent: "max-price-relative",
  "redo-alt": ["menu-rescan-hover", "menu-rescan"],
  "calendar-minus": ["minus-big", "minus-small"],
  "calendar-exclamation": "no-tickets",
  ticket: "no-tx",
  "chart-bar": ["overview-active", "overview-default", "overview-hover"],
  "lock-alt": ["password", "time-lock"],
  "calendar-plus": ["plus-big", "plus-small"],
  search: "search",
  lock: ["securitycenterpage", "securitycntr-active", "securitycntr-default", "securitycntr-hover"],
  "share-all": "send-all",
  share: "send-to-others",
  "dot-circle": "send-to-self",
  "sliders-h": ["settings-active", "settings-default", "settings-hover", "settingspage"],
  sort: "sort-by",
  "code-merge": "split-fee",
  "life-ring": [
    "stakepoolsActive",
    "stakepoolsDefault",
    "stake-pool",
    "pool-fee-address",
    "pool-fees",
    "tickets-manage-stakepools"
  ],
  "exclamation-circle": "stats-disabled",
  stroopwafel: "stripe",
  "hourglass-end": "ticket-expired",
  "hourglass-start": "ticket-immature",
  recycle: "ticket-lifecycle",
  "ticket-alt": [
    "ticket-live",
    "ticket-missed",
    "ticket-revoked",
    "tickets-active",
    "tickets-default",
    "tickets-hover",
    "tickets-ticket",
    "ticketspage",
    "ticket-unmined"
  ],
  "money-bill-wave": "ticket-reward",
  "ellipsis-v-alt": [
    "tickets-agenda-card-kebab-disabled",
    "tickets-agenda-card-kebab-hover",
    "tickets-agenda-card-kebab"
  ],
  cog: ["tickets-cogs-closed", "tickets-cogs-opened"],
  "money-bill-wave-alt": "ticket-voted",
  "list-alt": [
    "transactions-active",
    "transactions-default",
    "transactions-hover",
    "transactionspage"
  ],
  "chess-clock": "vote-time-stats",
  "barcode-alt": "voting-address"
};

const colors = {
  common: "#596D81",
  "violet-dark": "#4143cd",
  "violet-normal": "#5956fc",
  "violet-light": "#88a6fc",
  rose: "#ff00a5",
  "rose-light": "#fa78af",
  white: "#ffffff"
};

async function findAndDeleteUnusedIcons(iconsDirectory, iconsFile) {
  const [filesInDir, stylesheetBuffer] = await Promise.all([
    readdirAsync(iconsDirectory),
    readFileAsync(iconsFile)
  ]);
  const stylesheetString = stylesheetBuffer.toString();
  const matched = stylesheetString.match(/@{icon-root}\/(.*)('|")/g);
  const replaced = matched.map(m => m.replace(/@{icon-root}\/|"|'/g, ""));
  const used = filesInDir.filter(file => replaced.includes(file));
  const unused = filesInDir.filter(file => !replaced.includes(file));
  console.log(chalk.bold.green("Used: "));
  console.log("---------------");
  for (const us of used) {
    console.log(chalk.green(us));
  }
  console.log(chalk.bold.red("\nUnused: "));
  console.log("---------------");
  for (const uus of unused) {
    unlinkFileAsync(`${iconsDirectory}/${uus}`)
      .then(() => {
        console.log("Deleted: ", uus);
      })
      .catch(e => {
        console.log(e);
      });
  }
}

async function findDuplicatedIcons(iconsFile) {
  const stylesheetBuffer = await readFileAsync(iconsFile);
  const stylesheetString = stylesheetBuffer.toString();
  const matched = stylesheetString.match(/@{icon-root}\/(.*)('|")/g);
  const replaced = matched.map(m => m.replace(/@{icon-root}\/|"|'/g, ""));
  const dupes = replaced
    .filter(file => replaced.indexOf(file) !== replaced.lastIndexOf(file))
    .reduce((acc, file) => (!acc.includes(file) ? [file, ...acc] : acc), []);
  console.log(chalk.bold.red("Duplicates: "));
  for (const d of dupes) {
    console.log(chalk.red(d));
  }
}

function svgToPngConverter(faIcon, name) {
  const pngs = [];
  const colorKeys = Object.keys(colors);
  for (const color of colorKeys) {
    pngs.push(
      new Promise((resolve, reject) => {
        const inkscape = spawn("/usr/bin/inkscape", [
          `-z`,
          `./colored/${faIcon}-${color}.svg`,
          `-e`,
          `./colored/${name}-${color}.png`,
          `-d 8`
        ]);

        inkscape.stdout.on("data", data => {
          console.log(`stdout: ${data}`);
        });

        inkscape.stderr.on("data", data => {
          console.log(`stderr: ${data}`);
          reject();
        });

        inkscape.on("close", code => {
          console.log(`child process exited with code ${code}`);
          resolve(`${name}-${color}.png`);
        });
      })
    );
  }
  return pngs;
}

function* svgColorizer() {
  for (const file of Object.keys(existing)) {
    console.log(file);
    yield new Promise(async (resolve, reject) => {
      try {
        const readData = await readFileAsync(`./${file}.svg`);
        const stringified = readData.toString();

        for (const [colorName, value] of Object.entries(colors)) {
          const result = stringified.replace(/<path/g, `<path fill="${value}"`);
          await writeFileAsync(`./colored/${file}-${colorName}.svg`, Buffer.from(result));
          resolve(`${file}-${colorName}.svg`);
        }
      } catch (err) {
        console.error(err);
        reject(err);
      }
    });
  }
}

function* conversionRunner() {
  for (const [faIcon, resultName] of Object.entries(existing)) {
    if (typeof resultName === "string") {
      yield svgToPngConverter(faIcon, resultName);
    } else {
      for (const name of resultName) {
        yield svgToPngConverter(faIcon, name);
      }
    }
  }
}
const colorizer = svgColorizer();

async function colorizeRunner() {
  try {
    const genItem = colorizer.next();
    if (!genItem.done) {
      const filename = await genItem.value;
      console.log("Processed file:", filename);
      return colorizeRunner();
    }
  } catch (err) {
    console.error(err);
    throw new Error(err);
  }
}

const converter = conversionRunner();

function copyIconFiles(filesDirectory, targetDirectory) {
  const convertPromise = converter.next();
  if (!convertPromise.done) {
    Promise.all(convertPromise.value).then(filenames => {
      for (const file of filenames) {
        const copy = spawn("/bin/cp", [`${filesDirectory}${file}`, `-t`, targetDirectory]);

        copy.stdout.on("data", data => {
          console.log("file: ", file);
          console.log(`stdout: ${data}`);
        });

        copy.stderr.on("data", data => {
          console.log(`stderr: ${data}`);
        });

        copy.on("close", code => {
          copyIconFiles(filesDirectory, targetDirectory);
          console.log(`child process exited with code ${code}`);
        });
      }
    });
  }
}
