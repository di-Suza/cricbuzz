import { canAccessRoute } from '../../../shared/constants/permissions.js';

function getRouteCode(label) {
  return label
    .split(' ')
    .map((part) => part[0])
    .join('')
    .slice(0, 3)
    .toUpperCase();
}

function getSidebarItems(routes, role) {
  return routes
    .filter((route) => route.nav && canAccessRoute(role, route))
    .map((route) => ({
      id: route.id,
      path: route.path,
      label: route.label,
      module: route.module,
      code: getRouteCode(route.label),
    }));
}

export {
  getSidebarItems,
};
