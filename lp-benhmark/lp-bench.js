const axios = require('axios')
const { parentPort, workerData } = require('worker_threads')

const ROOM_ID = 1
const BASE_URL = 'http://localhost:3001'
const TOKEN =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwiZW1haWwiOiJzdHVwYWNraWprQGdtYWlsLmNvbSIsInJvbGVzIjpbeyJpZCI6MSwidmFsdWUiOiJVU0VSIiwiZGVzY3JpcHRpb24iOiJzaW1wbGUgdXNlciwgY2FuIG1lc3NhZ2UgYW55b25lIiwiY3JlYXRlZEF0IjoiMjAyNS0wNy0wM1QyMjo0MjowMS45NTBaIiwidXBkYXRlZEF0IjoiMjAyNS0wNy0wM1QyMjo0MjowMS45NTBaIiwiVXNlcl9Sb2xlcyI6eyJ1c2VySWQiOjEsInJvbGVJZCI6MX19XSwiaWF0IjoxNzUxNTgzNjI3LCJleHAiOjE3NTE1ODU0Mjd9.894TJXVTyi6XGmluqJXVDLTXXhUJ8XdTK-PNgEo7890'

let timeoutErrorCount = 0
let isStopped = false

const instance = axios.create({
  baseURL: 'http://localhost:3001',
})

async function longpolling(clientId) {
  while (!isStopped) {
    try {
      const response = await instance.get(BASE_URL + '/longpolling', {
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
        BASE_URL + '/longpolling',
        { roomId: ROOM_ID, message: generatedMessage },
        {
          headers: {
            Authorization: `Bearer ${TOKEN}`,
            'Content-Type': 'application/json',
          },
        }
      )
    } catch (err) {
      parentPort.postMessage(`[Sender #${senderId}] error: ${err.message}`)
    }

    await new Promise((r) => setTimeout(r, 200))
  }
}

;(async () => {
  const startTime = Date.now()

  for (let i = 1; i <= workerData.subs; i++) {
    longpolling(i)
  }

  await new Promise((r) => setTimeout(r, 2000))

  const tasks = []
  for (let i = 1; i <= workerData.subs; i++) {
    tasks.push(sendMessages(i, workerData.messages))
  }

  await Promise.allSettled(tasks)

  isStopped = true

  const endTime = Date.now()
  const executionTimeSeconds = ((endTime - startTime) / 1000).toFixed(2)

  parentPort.postMessage(`[Thread #${workerData.id}] finished sending messages`)
  parentPort.postMessage(
    `[Thread #${workerData.id}] Total timeout errors: ${timeoutErrorCount}`
  )
  parentPort.postMessage(
    `[Thread #${workerData.id}] Execution time: ${executionTimeSeconds} seconds`
  )

  console.log(timeoutErrorCount)

  return 1
})()
