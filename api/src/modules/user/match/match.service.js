import { ScaffoldService } from '../../../shared/utils/moduleScaffold.js';

class MatchPublicService extends ScaffoldService {
  constructor() {
    super('public-match');
  }
}

export { MatchPublicService };
export default new MatchPublicService();
