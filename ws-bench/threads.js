const { Worker } = require('worker_threads')

const TOTAL_CLIENTS = 200
const WORKERS = 4
const CLIENTS_PER_WORKER = TOTAL_CLIENTS / WORKERS
const MESSAGES_PER_CLIENT = 100
const DELAY_MS = 500

const WS_URL = 'http://localhost:3001' // <-- подставь нужное
const TOKEN =
  'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MiwiZW1haWwiOiJxd2VydHlAZ21haWwuY29tIiwicm9sZXMiOlt7ImlkIjoxLCJ2YWx1ZSI6IlVTRVIiLCJkZXNjcmlwdGlvbiI6InNpbXBsZSB1c2VyLCBjYW4gbWVzc2FnZSBhbnlvbmUiLCJjcmVhdGVkQXQiOiIyMDI1LTA3LTE0VDA5OjA0OjIyLjQzOFoiLCJ1cGRhdGVkQXQiOiIyMDI1LTA3LTE0VDA5OjA0OjIyLjQzOFoiLCJVc2VyX1JvbGVzIjp7InVzZXJJZCI6Miwicm9sZUlkIjoxfX1dLCJpYXQiOjE3NTI5Mjg1NjcsImV4cCI6MTc1MjkzMDM2N30.1g_kY2I96YM2r8DTzFuhjo5FmNWCcpF1x8fD6zUQlGg' // <-- подставь актуальный

for (let i = 0; i < WORKERS; i++) {
  const worker = new Worker('./ws-bench.js', {
    workerData: {
      clients: CLIENTS_PER_WORKER,
      messagesPerClient: MESSAGES_PER_CLIENT,
      delayBetweenMessagesMs: DELAY_MS,
      token: TOKEN,
      url: WS_URL,
    },
  })

  worker.on('message', (msg) => console.log(`[Worker ${i + 1}]:`, msg))
  worker.on('error', (err) => console.error(`[Worker ${i + 1}] Error:`, err))
  worker.on('exit', (code) => {
    if (code !== 0)
      console.error(`[Worker ${i + 1}] stopped with exit code ${code}`)
  })
}
