import { ScaffoldController } from '../../shared/utils/moduleScaffold.js';
import playingXiService from './playingXi.service.js';

class PlayingXiController extends ScaffoldController {
  constructor(service = playingXiService) {
    super(service);
  }
}

export { PlayingXiController };
export default new PlayingXiController();
