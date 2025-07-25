const axios = require('axios')
const { parentPort, workerData } = require('worker_threads')

const ROOM_ID = 1
const BASE_URL = 'http://localhost:3001'
const TOKEN =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MiwiZW1haWwiOiJxd2VydHlAZ21haWwuY29tIiwicm9sZXMiOlt7ImlkIjoxLCJ2YWx1ZSI6IlVTRVIiLCJkZXNjcmlwdGlvbiI6InNpbXBsZSB1c2VyLCBjYW4gbWVzc2FnZSBhbnlvbmUiLCJjcmVhdGVkQXQiOiIyMDI1LTA3LTE0VDA5OjA0OjIyLjQzOFoiLCJ1cGRhdGVkQXQiOiIyMDI1LTA3LTE0VDA5OjA0OjIyLjQzOFoiLCJVc2VyX1JvbGVzIjp7InVzZXJJZCI6Miwicm9sZUlkIjoxfX1dLCJpYXQiOjE3NTMyODQzMjMsImV4cCI6MTc1MzI5MDMyM30.r2Vq5kAV3iohRkBv013aQB9SnqZMunQNkSeiMvy9o6s'

let timeoutErrorCount = 0
let isStopped = false
let totalMessagesSent = 0

const instance = axios.create({
  baseURL: BASE_URL,
})

async function longpolling(clientId) {
  while (!isStopped) {
    try {
      const response = await instance.get('/longpolling', {
        params: { roomId: ROOM_ID },
        headers: {
          Authorization: `Bearer ${TOKEN}`,
          'Content-Type': 'application/json',
        },
        timeout: 60000,
      })

      const data = response.data

      if (data.timeout) {
        parentPort.postMessage(`[Client ${clientId}] timeout`)
      } else {
        parentPort.postMessage(
          `[Client ${clientId}] Got message: ${JSON.stringify(data.message)}`
        )
      }

      await new Promise((r) => setTimeout(r, 200))
    } catch (err) {
      parentPort.postMessage(`[Client ${clientId}] Error: ${err.message}`)
      if (err.code === 'ECONNABORTED') {
        timeoutErrorCount++
      }
    }
  }
}

async function sendMessages(senderId, messageCount) {
  for (let i = 0; i < messageCount; i++) {
    try {
      const generatedMessage = `Message ${i + 1} from sender ${senderId}`
      await instance.post(
        '/longpolling/send-template-message',
        { roomId: ROOM_ID, message: generatedMessage },
        {
          headers: {
            Authorization: `Bearer ${TOKEN}`,
            'Content-Type': 'application/json',
          },
        }
      )
      totalMessagesSent++
    } catch (err) {
      parentPort.postMessage(`[Sender #${senderId}] Error: ${err.message}`)
    }

    await new Promise((r) => setTimeout(r, 200))
  }
}

;(async () => {
  const startTime = Date.now()

  // Запускаем всех longpolling клиентов и сохраняем Promises
  const lpTasks = []
  for (let i = 1; i <= workerData.subs; i++) {
    lpTasks.push(longpolling(i))
  }

  // Небольшая пауза перед началом отправки
  await new Promise((r) => setTimeout(r, 2000))

  // Старт отправки сообщений
  const sendTasks = []
  for (let i = 1; i <= workerData.subs; i++) {
    sendTasks.push(sendMessages(i, workerData.messages))
  }

  await Promise.allSettled(sendTasks)

  // Сигнал всем longpolling-потокам завершиться
  isStopped = true

  // Даём longpoll'ам время на догрузку последних сообщений
  await new Promise((r) => setTimeout(r, 2000))

  const endTime = Date.now()
  const executionTimeSeconds = ((endTime - startTime) / 1000).toFixed(2)

  parentPort.postMessage(
    `[Thread #${workerData.id}] Sent messages: ${totalMessagesSent}`
  )
  parentPort.postMessage(
    `[Thread #${workerData.id}] Timeout errors: ${timeoutErrorCount}`
  )
  parentPort.postMessage(
    `[Thread #${workerData.id}] Execution time: ${executionTimeSeconds} seconds`
  )
})()
