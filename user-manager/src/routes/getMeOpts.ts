import { users } from '../drizzle/schema';
import { eq } from 'drizzle-orm';
import database from '../drizzle/databaseLauncher';
import { FastifyRequest, FastifyReply } from 'fastify';

const responseItem = {
  type: 'object',
  properties: {
    message: { type: 'string' },
    user: { $ref: 'userSchema#' },
  },
  required: ['message']
}

export const getMeOpts = {
  schema: {
    response: { 200: responseItem }
  },
  handler: async function(request: FastifyRequest, reply: FastifyReply) {
    const x_user_id = request.headers["x-user-id"];
    if (!x_user_id || typeof x_user_id === typeof Array<'string'>) {
      request.log.error("Unexpected Error: header x-user-id expected");
      reply.code(500).send({ message: "Unexpected Error: header x-user-id expected" })
    }
    const id = Number(x_user_id);
    const userArray = await database.select().from(users).where(eq(users.id, id));
    if (userArray.length === 0)
      reply.code(404).send({ message: "User not found." });
    else
      reply.code(200).send({ message: "User found.", user: userArray[0] });
  }
}

export default getMeOpts;
