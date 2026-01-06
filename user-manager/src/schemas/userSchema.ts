const userSchema = {
  $id: 'userSchema',
  type: 'object',
  properties: {
    id: { type: 'number' },
    username: { type: 'string' },
    profilePic: { type: 'string' }
  },
  additionalProperties: true,
}

export default userSchema;
