import { users } from '../drizzle/schema';
import { eq } from 'drizzle-orm';
import database from '../drizzle/databaseLauncher';
import { FastifyRequest, FastifyReply } from 'fastify';
import { createUniqueName } from './utils/createUniqueName'

type PatchUserBody = {
  username?: string;
  profilePic?: string;
};

const bodySchema = {
	type: 'object',
	properties: {
		user: { type: 'object', additionalProperties: true },
		username: { type: 'string' },
		profilePic: { type: 'string' },
  },
}

const responseSchema = {
	type: 'object',
	properties: {
		message: { type: 'string' },
		user: { $ref: 'userSchema#' },
	},
	required: [ 'message' ] // Every response should have a message.
}


export const patchUserOpts = {
	schema: {
		body: bodySchema,
		response: { 201: responseSchema }
	},
	handler: async function (request: FastifyRequest<{Body: PatchUserBody}>, reply: FastifyReply) {
		const x_user_id = request.headers["x-user-id"];
		if (!x_user_id || typeof x_user_id === typeof Array<'string'>) {
			request.log.error("Unexpected Error: header x-user-id expected");
			reply.code(500).send({ message: "Unexpected Error: header x-user-id expected" })
			return;
		}
		const id = Number(x_user_id);

		const userInformation = (request.body as object);
		if (!userInformation || typeof userInformation !== 'object') {
			reply.code(400).send({ message: 'Missing or malformed user payload.' });
			return;
		}

		let userToUpdate = await database.select().from(users)
			.where(eq(users.id, id));
		if (userToUpdate.length === 0) {
			reply.code(404).send({ message: "User not found." });
			return;
		}

		const { username, profilePic } = request.body;
		if (username) {
			if (username == userToUpdate[0].username) {
				reply.code(409).send({ message: "Conflict: this username is the same." });
				return;
			}
			let finalUsername: string = await createUniqueName(username);
			await database.update(users)
				.set({username: finalUsername})
				.where(eq(users.id, id));   
			reply.code(200).send({ message: 'User \
				succesfully updated.'});
		}
		if (profilePic) {
			if (profilePic == userToUpdate[0].profilePic) {
				reply.code(409).send({ message: "Conflict: this profile pucture is the same." });
				return;
			}
			await database.update(users)
				.set({profilePic: profilePic})
				.where(eq(users.id, id));   
			reply.code(200).send({ message: 'Profile picture \
				succesfully updated.'});
		}
		if (!profilePic && !username)
			reply.code(400).send({ message: "Invalid input field. You're probably \
				trying to change af field that doesn't exist." });
	}
}

export default patchUserOpts;
