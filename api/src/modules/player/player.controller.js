import { ScaffoldController } from '../../shared/utils/moduleScaffold.js';
import playerService from './player.service.js';

class PlayerController extends ScaffoldController {
  constructor(service = playerService) {
    super(service);
  }
}

export { PlayerController };
export default new PlayerController();
