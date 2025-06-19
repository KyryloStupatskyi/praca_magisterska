const { Worker } = require("worker_threads");

const WORKER_COUNT = 4;

for (let i = 0; i < WORKER_COUNT; i++) {
  const thread = new Worker("./sse-benchmark.js", {
    workerData: {
      id: i + 1,
      subs: 100,
      messages: 100,
    },
  });

  thread.on("message", (msg) => {
    console.log(`[Thread #${i + 1} get message]: `, msg);
  });

  thread.on("error", (err) => {
    console.log(`[Thread #${i + 1} finished with error]: `, err);
  });

  thread.on("exit", (code) => {
    if (code == 0) {
      console.log(`[Thread #${i + 1} finished successfully]`);
    } else {
      console.log(`[Thread #${i + 1} finished with exit code ${code}]`);
    }
  });
}
