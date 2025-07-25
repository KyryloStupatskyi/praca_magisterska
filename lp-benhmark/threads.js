const { Worker } = require('worker_threads')

const WORKER_COUNT = 4

for (let i = 0; i < WORKER_COUNT; i++) {
  const thread = new Worker('./lp-bench.js', {
    workerData: {
      id: i + 1,
      subs: 100,
      messages: 200,
    },
  })

  thread.on('message', (msg) => {
    // console.log(`[Thread #${i + 1}] ${msg}`)
  })

  thread.on('error', (err) => {
    console.error(`[Thread #${i + 1}] Worker error:`, err)
  })

  thread.on('exit', (code) => {
    if (code === 0) {
      console.log(`[Thread #${i + 1}] Finished successfully`)
    } else {
      console.error(`[Thread #${i + 1}] Exited with code ${code}`)
    }
  })
}
