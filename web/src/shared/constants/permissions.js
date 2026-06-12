import { ADMIN, SCORER, SUPER_ADMIN } from './roles.js';

const ACTION_PERMISSIONS = Object.freeze({
  'users:create': [SUPER_ADMIN],
  'users:read': [SUPER_ADMIN],
  'series:manage': [SUPER_ADMIN, ADMIN],
  'teams:manage': [SUPER_ADMIN, ADMIN],
  'squads:manage': [SUPER_ADMIN, ADMIN],
  'players:manage': [SUPER_ADMIN, ADMIN],
  'matches:manage': [SUPER_ADMIN, ADMIN, SCORER],
  'playingXi:manage': [SUPER_ADMIN, ADMIN, SCORER],
  'score:manage': [SUPER_ADMIN, ADMIN, SCORER],
  'commentary:manage': [SUPER_ADMIN, ADMIN, SCORER],
});

function hasRole(role, allowedRoles = []) {
  return Boolean(role && allowedRoles.includes(role));
}

function canAccessRoute(role, route) {
  return hasRole(role, route.roles);
}

function can(role, permission) {
  return hasRole(role, ACTION_PERMISSIONS[permission]);
}

export {
  ACTION_PERMISSIONS,
  can,
  canAccessRoute,
  hasRole,
};
