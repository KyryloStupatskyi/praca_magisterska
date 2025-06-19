const { parentPort, workerData } = require("worker_threads");
const { io } = require("socket.io-client");

const ROOM_ID = 1;
const TOKEN =
  "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwiZW1haWwiOiJzdHVwYWNraWprQGdtYWlsLmNvbSIsInJvbGVzIjpbeyJpZCI6MSwidmFsdWUiOiJVU0VSIiwiZGVzY3JpcHRpb24iOiJ1c2VyIiwiY3JlYXRlZEF0IjoiMjAyNS0wNi0xNVQwODowMjoyNC44MDFaIiwidXBkYXRlZEF0IjoiMjAyNS0wNi0xNVQwODowMjoyNC44MDFaIiwiVXNlcl9Sb2xlcyI6eyJ1c2VySWQiOjEsInJvbGVJZCI6MX19XSwiaWF0IjoxNzQ5OTkzNjg4LCJleHAiOjE3NDk5OTU0ODh9.t2-UMHCQd-oM1E5crGaoejKh8C4d3eWEeP9b_GQNoEM";
const WS_URL = "http://localhost:3000";

let connectionErrors = 0;
let disconnects = 0;

function createClient(clientId) {
  return new Promise((resolve) => {
    const socket = io(WS_URL, {
      auth: {
        token: TOKEN,
      },
      transports: ["websocket"],
    });

    socket.on("connect", () => {
      parentPort.postMessage(`[Client ${clientId}] connected: ${socket.id}`);
      socket.emit("join-room", { roomId: ROOM_ID });
    });

    socket.on("user-joined", (data) => {
      parentPort.postMessage(
        `[Client ${clientId}] user joined: ${JSON.stringify(data)}`
      );
    });

    socket.on("recieve-message", (data) => {
      parentPort.postMessage(
        `[Client ${clientId}] received: ${JSON.stringify(data)}`
      );
    });

    socket.on("connect_error", (err) => {
      connectionErrors++;
      parentPort.postMessage(
        `[Client ${clientId}] connection error: ${err.message}`
      );
    });

    socket.on("disconnect", () => {
      disconnects++;
      parentPort.postMessage(`[Client ${clientId}] disconnected`);
    });

    resolve(socket);
  });
}

async function sendMessages(socket, senderId, count) {
  parentPort.postMessage(`[Client ${senderId}] sending ${count} messages`);
  for (let i = 0; i < count; i++) {
    const message = `Message ${i + 1} from sender ${senderId}`;
    socket.emit("send-message", {
      roomId: ROOM_ID,
      message: message,
    });

    await new Promise((res) => setTimeout(res, 200));
  }
}

(async () => {
  const startTime = Date.now();

  const sockets = [];

  for (let i = 1; i <= workerData.subs; i++) {
    const socket = await createClient(i);
    sockets.push(socket);
  }

  await new Promise((r) => setTimeout(r, 2000));

  const tasks = sockets.map((socket, i) =>
    sendMessages(socket, i + 1, workerData.messages)
  );
  await Promise.all(tasks);

  sockets.forEach((s) => s.disconnect());

  const endTime = Date.now();
  const executionTimeSeconds = ((endTime - startTime) / 1000).toFixed(2);

  parentPort.postMessage(`[Thread #${workerData.id}] finished successfully`);
  parentPort.postMessage(
    `[Thread #${workerData.id}] Total connection errors: ${connectionErrors}`
  );
  parentPort.postMessage(
    `[Thread #${workerData.id}] Total disconnects: ${disconnects}`
  );
  parentPort.postMessage(
    `[Thread #${workerData.id}] Execution time: ${executionTimeSeconds} seconds`
  );
})();
