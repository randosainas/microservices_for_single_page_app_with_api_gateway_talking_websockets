import Fastify from 'fastify';
import app from './app.ts';

const fastify = Fastify();
fastify.register(app); // All routes and stuff in app.ts

const PORT = process.env.PORT || 3003;
fastify.listen({ port: Number(PORT), host: '0.0.0.0' }, (err, address) => {
  if (err) {
    console.error(err);
    process.exit(1);
  }
  console.log(`Game service running on port ${PORT} - address ${address}`);
})
