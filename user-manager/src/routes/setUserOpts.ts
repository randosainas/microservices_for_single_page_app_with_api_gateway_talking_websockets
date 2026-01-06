import { users } from '../drizzle/schema';
import { eq } from 'drizzle-orm';
import database from '../drizzle/databaseLauncher';
import { FastifyRequest, FastifyReply } from 'fastify';
import { RouteShorthandOptionsWithHandler } from 'fastify/types/route';
import { createUniqueName } from './utils/createUniqueName'

const bodySchema = {
  type: 'object',
  properties: {
    google_id: { type: 'string' },
    username: { type: 'string' },
    profilePic: { type: 'string' },
  },
  required: [
    "google_id",
    "username",
  ],
}

const responseSchema = {
  type: 'object',
  properties: {
    message: { type: 'string' },
    user: { $ref: 'userSchema#' },
    username: { type: 'string' },
  },
  required: ['message'] // Every response should have a message.
}

export const setUserOpts: RouteShorthandOptionsWithHandler = {
  schema: {
    body: bodySchema,
    response: { 200: responseSchema, 201: responseSchema },
  },
  handler: async function(request: FastifyRequest, reply: FastifyReply) {

    try {

      const { google_id, username, profilePic } = request.body as { google_id: string, username: string, profilePic?: string };
      const userArray = await database.select().from(users)
        .where(eq(users.google_id, google_id));


      if (userArray.length > 1) {
        // should never happen
        request.log.error("Multiple users with the same google_id found. How is this possible!")
        return reply.code(500).send({ message: 'Multiple users with the same google_id found. How is this possible!' })
      } else if (userArray.length === 1) {
        // return the user, don't make new entry
        const user = userArray[0];
        return reply.code(200).send({
          message: "Returned already existing user id.",
          user: user
        });
      }

      let finalUsername = await createUniqueName(username);

      const user = { google_id, username: finalUsername, profilePic };
      const inserted = await database
        .insert(users)
        .values(user)
        .onConflictDoNothing()
        .returning();

      if (inserted.length === 0) {
        return reply.code(500).send({
          message: "Failed to insert new user.",
          username: finalUsername,
        });
      }

      reply.code(201).send({ message: 'User succesfully created.', user: inserted[0] });
    } catch (error) {
      // should never happen
      request.log.error('Multiple users with the same google_id found. How is this possible!')
      reply.code(500).send({ message: 'Multiple users with the same google_id found. How is this possible!' })
    }
  }
}

export default setUserOpts;
