const authDto = Object.freeze({
  tokenPayloadFields: ['id', 'role', 'email'],
  responseFields: ['user', 'token'],
});

export default authDto;
