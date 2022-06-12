const fs = require("fs");
const io = require("socket.io-client");

const socket = io("https://ekmek.herokuapp.com");

socket.on("connect", () => {
  console.log("SocketIO injected");
});

let logs = [];

const ramChecker = (logArray, itemCount) => {
  if (logArray.length > itemCount) {
    logArray = logArray.slice(-20);
  };
};

// cache
fs.readFile("./last20.log", "utf-8", (err, data) => {
  if (err) {
    return console.log(err);
  };
  logs = data.split("\n");
});

// last20.log
const logWriter = () => {
  fs.writeFile("last20.log", logs.join("\n"), {
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
  fs.readFile("./log.txt", "utf-8", (err, data) => {
    if (err) {
      return console.log(err);
    };
    // last 20 item as an array
    const result = data.split("\n").slice(-20);

    for (let i = 0; i < result.length; i++) {
      const log = result[i];
      if (!logs.includes(log)) {
        logs.push(log);
        logs = logs.slice(-20);

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
    ramChecker(logs, 20);
  }, 1000);
};

run();
