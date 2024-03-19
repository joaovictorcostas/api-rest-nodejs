import Fastify from 'fastify'
import { env } from './env'
import { transactionsRoutes } from './routes/transactions'

const app = Fastify()

app.register(transactionsRoutes, {
  prefix: '/transactions',
})

app
  .listen({
    port: env.PORT,
  })
  .then(() => {
    console.log('🔥 HTTP Server running on port 3333')
  })
