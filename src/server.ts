import Fastify from "fastify";

const app = Fastify()

app.get("/", async (req, res) => {
  return 'hello world'
})

app.listen({
    port: 3333
}).then(() => {
    console.log('🔥 HTTP Server running on port 3333')
})