import { NestFactory } from '@nestjs/core'
import { AppModule } from './app.module'
import * as cookieParser from 'cookie-parser'

async function start() {
  try {
    const PORT = process.env.PORT
    const COOKIE = process.env.COOKIE_SECRET

    const app = await NestFactory.create(AppModule)
    app.enableCors({
      origin: process.env.CLIENT_URL,
      credentials: true,
    })

    app.use(cookieParser(COOKIE))

    await app.listen(PORT ?? 3000, () => {
      console.log(`Server is working on PORT ${3000}`)
    })
  } catch (error) {
    console.log(error)
  }
}

start()
