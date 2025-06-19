const axios = require("axios");
const { EventSource } = require("eventsource");
const { parentPort, workerData } = require("worker_threads");
const { setTimeout } = require("timers/promises");

const ROOM_ID = 1;
const TOKEN =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwiZW1haWwiOiJzdHVwYWNraWprQGdtYWlsLmNvbSIsInJvbGVzIjpbeyJpZCI6MSwidmFsdWUiOiJVU0VSIiwiZGVzY3JpcHRpb24iOiJ1c2VyIiwiY3JlYXRlZEF0IjoiMjAyNS0wNi0xNVQwODowMjoyNC44MDFaIiwidXBkYXRlZEF0IjoiMjAyNS0wNi0xNVQwODowMjoyNC44MDFaIiwiVXNlcl9Sb2xlcyI6eyJ1c2VySWQiOjEsInJvbGVJZCI6MX19XSwiaWF0IjoxNzQ5OTkwODc0LCJleHAiOjE3NDk5OTI2NzR9.FsaD0MagT3jNOu2Ng3pRTynNTP_gWdKMhU8IbAeiHxk";
const BASE_URL = "http://localhost:3000";
const SSE_URL = `${BASE_URL}/event-source?roomId=${ROOM_ID}&token=${TOKEN}`;
const POST_URL = `${BASE_URL}/event-source`;

const TOTAL_CLIENTS = workerData.subs;
const MESSAGE_COUNT = workerData.messages;
const CONNECT_DELAY_MS = 50;
const SEND_DELAY_MS = 200;

const clients = [];

async function createSseClient(id) {
  return new Promise((resolve, reject) => {
    const es = new EventSource(SSE_URL);

    es.onmessage = (event) => {};

    es.onerror = (err) => {
      console.error(`[Client ${id}] SSE Error: ${err?.message || err}`);
      es.close();
      reject(err);
    };

    es.onopen = () => {
      console.log(`[Client ${id}] connected.`);
      resolve(es);
    };
  });
}

async function sendMessages(senderId) {
  for (let i = 0; i < MESSAGE_COUNT; i++) {
    try {
      const message = `Message ${i + 1} from sender ${senderId}`;
      await axios.post(
        POST_URL,
        { roomId: ROOM_ID, message },
        {
          headers: {
            Authorization: `Bearer ${TOKEN}`,
            "Content-Type": "application/json",
          },
        }
      );
    } catch (err) {
      console.error(`[Sender ${senderId}] Error: ${err.message}`);
    }
    await setTimeout(SEND_DELAY_MS);
  }
}

(async () => {
  const startTime = Date.now();
  console.log("Starting SSE Clients connection...");

  // Плавное подключение клиентов:
  for (let i = 0; i < TOTAL_CLIENTS; i++) {
    try {
      const client = await createSseClient(i + 1);
      clients.push(client);
    } catch {
      console.warn(`[Client ${i + 1}] failed to connect.`);
    }
    await setTimeout(CONNECT_DELAY_MS);
  }

  console.log("All clients connected. Starting to send messages...");

  const sendTasks = [];
  for (let i = 0; i < TOTAL_CLIENTS; i++) {
    sendTasks.push(sendMessages(i + 1));
  }

  await Promise.all(sendTasks);

  console.log("All messages sent.");

  const endTime = Date.now();
  const executionTimeSeconds = ((endTime - startTime) / 1000).toFixed(2);

  console.log(executionTimeSeconds, "seconds elapsed");

  return 1;
})();
