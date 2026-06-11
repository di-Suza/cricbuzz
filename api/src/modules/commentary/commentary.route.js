import { Roles } from '../../shared/constants/roles.js';
import { authenticate, authorize } from '../../shared/middleware/auth.js';
import { ScaffoldRoutes } from '../../shared/utils/moduleScaffold.js';
import commentaryController from './commentary.controller.js';

class CommentaryRoutes extends ScaffoldRoutes {
  constructor() {
    super(commentaryController, {
      mergeParams: true,
      middlewares: [authenticate, authorize(Roles.SUPER_ADMIN, Roles.ADMIN, Roles.SCORER)],
    });
  }
}

export { CommentaryRoutes };
export default new CommentaryRoutes().getRouter();
