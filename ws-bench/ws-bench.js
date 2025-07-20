const { parentPort, workerData } = require('worker_threads')
const { io } = require('socket.io-client')

const ROOM_ID = 1
const TOKEN = workerData.token
const WS_URL = workerData.url

let connectionErrors = 0
let disconnects = 0

function createClient(clientId) {
  return new Promise((resolve) => {
    const socket = io(WS_URL, {
      auth: { token: TOKEN },
      transports: ['websocket'],
      reconnection: false,
    })

    socket.on('connect', () => {
      parentPort.postMessage(`[Client ${clientId}] Connected`)
      socket.emit('join-room', { roomId: ROOM_ID })
      resolve(socket)
    })

    socket.on('connect_error', (err) => {
      connectionErrors++
      parentPort.postMessage(
        `[Client ${clientId}] Connection error: ${err.message}`
      )
    })

    socket.on('disconnect', () => {
      disconnects++
      parentPort.postMessage(`[Client ${clientId}] Disconnected`)
    })
  })
}

async function sendMessages(socket, clientId, messageCount, delayMs) {
  for (let i = 0; i < messageCount; i++) {
    const message = `Msg ${i + 1} from client ${clientId}`
    socket.emit('send-template-message', { roomId: ROOM_ID, message })

    if ((i + 1) % 10 === 0) {
      parentPort.postMessage(`[Client ${clientId}] Sent ${i + 1} messages`)
    }

    await new Promise((res) => setTimeout(res, delayMs))
  }
}

;(async () => {
  try {
    const sockets = []

    await Promise.all(
      Array.from({ length: workerData.clients }, async (_, idx) => {
        const socket = await createClient(idx + 1)
        sockets.push(socket)
      })
    )

    parentPort.postMessage(
      `All ${sockets.length} clients connected, starting message flood`
    )

    await Promise.all(
      sockets.map((socket, idx) =>
        sendMessages(
          socket,
          idx + 1,
          workerData.messagesPerClient,
          workerData.delayBetweenMessagesMs
        )
      )
    )

    sockets.forEach((socket) => socket.disconnect())

    parentPort.postMessage(
      `Finished: Connection Errors ${connectionErrors}, Disconnects ${disconnects}`
    )
  } catch (err) {
    parentPort.postMessage(`Fatal Error: ${err.message}`)
  }
})()
