import { ScaffoldService } from '../../../shared/utils/moduleScaffold.js';

class PlayerPublicService extends ScaffoldService {
  constructor() {
    super('public-player');
  }
}

export { PlayerPublicService };
export default new PlayerPublicService();
