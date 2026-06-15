const Roles = Object.freeze({
  SUPER_ADMIN: 'SUPER_ADMIN',
  ADMIN: 'ADMIN',
  SCORER: 'SCORER',
});

const ROLE_LIST = Object.freeze(Object.values(Roles));
const { SUPER_ADMIN, ADMIN, SCORER } = Roles;

export {
  ADMIN,
  ROLE_LIST,
  Roles,
  SCORER,
  SUPER_ADMIN,
};
