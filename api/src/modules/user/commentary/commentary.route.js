import { ScaffoldRoutes } from '../../../shared/utils/moduleScaffold.js';
import commentaryController from './commentary.controller.js';

class CommentaryPublicRoutes extends ScaffoldRoutes {
  constructor() {
    super(commentaryController, { mergeParams: true });
  }
}

export { CommentaryPublicRoutes };
export default new CommentaryPublicRoutes().getRouter();
