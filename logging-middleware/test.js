const Log = require("./logger");

async function test() {
  await Log(
    "backend",
    "info",
    "handler",
    "Testing logger"
  );

  console.log("Log sent");
}

test();