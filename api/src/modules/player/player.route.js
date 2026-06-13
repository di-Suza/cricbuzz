import { Roles } from '../../shared/constants/roles.js';
import { authenticate, authorize } from '../../shared/middleware/auth.js';
import upload from '../../shared/middleware/multer.js';
import { ScaffoldRoutes } from '../../shared/utils/moduleScaffold.js';
import playerController from './player.controller.js';

class PlayerRoutes extends ScaffoldRoutes {
  constructor() {
    super(playerController, {
      middlewares: [authenticate, authorize(Roles.SUPER_ADMIN, Roles.ADMIN)],
    });
  }

  register() {
    if (this.middlewares && this.middlewares.length > 0) {
      this.router.use(...this.middlewares);
    }

    this.router.get('/', this.controller.getAll);
    this.router.get('/:id', this.controller.getById);
    this.router.post('/', upload.single('image'), this.controller.create);
    this.router.patch('/:id', upload.single('image'), this.controller.update);
    this.router.delete('/:id', this.controller.delete);
  }
}

export { PlayerRoutes };
export default new PlayerRoutes().getRouter();
