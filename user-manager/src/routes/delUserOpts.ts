import { users } from '../drizzle/schema';
import { eq } from 'drizzle-orm';
import database from '../drizzle/databaseLauncher';
import { FastifyRequest, FastifyReply } from 'fastify';

const responseSchema = {
  type: 'object',
  properties: {
    message: { type: 'string' },
    user: { $ref: 'userSchema#' },
  },
  required: ['message'] // Every response should have a message.
}

export const delUserOpts = {
  schema: {
    response: { 200: responseSchema }
  },
  handler: async function(request: FastifyRequest, reply: FastifyReply) {
    const x_user_id = request.headers["x-user-id"];
    if (!x_user_id || typeof x_user_id === typeof Array<'string'>) {
      request.log.error("Unexpected Error: header x-user-id expected");
      reply.code(500).send({ message: "Unexpected Error: header x-user-id expected" })
	  return;
    }
    const id = Number(x_user_id);
    const deletedUser = await database.delete(users).where(eq(users.id, id)).returning();
    if (deletedUser.length === 0) {
      reply.code(404).send({ message: "Could not delete user." });
	  return;
	}
    reply.code(200).send({ message: "User deleted.", user: deletedUser[0] });
  }
}

export default delUserOpts;
