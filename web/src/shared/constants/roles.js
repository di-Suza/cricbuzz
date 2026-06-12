const SUPER_ADMIN = 'SUPER_ADMIN';
const ADMIN = 'ADMIN';
const SCORER = 'SCORER';

const ROLE_LABELS = Object.freeze({
  [SUPER_ADMIN]: 'Super Admin',
  [ADMIN]: 'Admin',
  [SCORER]: 'Scorer',
});

const ROLE_LIST = Object.freeze([SUPER_ADMIN, ADMIN, SCORER]);

export {
  ADMIN,
  ROLE_LABELS,
  ROLE_LIST,
  SCORER,
  SUPER_ADMIN,
};
