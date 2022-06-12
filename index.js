const fs = require("fs");
const io = require("socket.io-client");

// EDIT HERE ONLY:
const MINING_LOG_FILE_NAME = "log.txt";  // don't forget .txt or .log
const CHECK_LOG_INTERVAL = 1000 * 5;  // every 5 seconds
const MAXIMUM_RAM_ROW = 30;  // only last 30 rows
// EDIT END.

// USAGE: 
// 1. copy index.js and package.json near to mining log file.
// 2. open terminal and "npm install"
// 3. "npm run start"

const socket = io("https://ekmek.herokuapp.com");

socket.on("connect", () => {
  console.log("SocketIO injected");
});

let logs = [];

const ramChecker = (logArray, itemCount) => {
  if (logArray.length > itemCount) {
    logArray = logArray.slice(-1 * MAXIMUM_RAM_ROW);
  };
};

// cache
fs.readFile(`./last${MAXIMUM_RAM_ROW}.log`, "utf-8", (err, data) => {
  if (err) {
    return console.log(err);
  };
  logs = data.split("\n");
});

// last{20}.log
const logWriter = () => {
  fs.writeFile(`last${MAXIMUM_RAM_ROW}.log`, logs.join("\n"), {
    flag: "w"
  },(err) => {
    if (err) {
      return console.log(err);
    };
    // console.log("Writing successfully.");
  });
};

const logReader = () => {
  // todo: take log path as an arg
  fs.readFile(`./${MINING_LOG_FILE_NAME}`, "utf-8", (err, data) => {
    if (err) {
      return console.log(err);
    };
    // last {20} item as an array
    const result = data.split("\n").slice(-1 * MAXIMUM_RAM_ROW);

    for (let i = 0; i < result.length; i++) {
      const log = result[i];
      if (!logs.includes(log)) {
        logs.push(log);
        logs = logs.slice(-1 * MAXIMUM_RAM_ROW);

        // send it
        socket.emit("logSender", log);

        console.log(log);
      };
    };

    // todo: better approach
    logWriter();
  });
};

const run = () => {
  setInterval(() => {
    logReader();
    ramChecker(logs, MAXIMUM_RAM_ROW);
  }, CHECK_LOG_INTERVAL);
};

run();
