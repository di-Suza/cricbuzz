import { ScaffoldController } from '../../../shared/utils/moduleScaffold.js';
import playerService from './player.service.js';

class PlayerPublicController extends ScaffoldController {
  constructor(service = playerService) {
    super(service);
  }
}

export { PlayerPublicController };
export default new PlayerPublicController();
