import { ScaffoldService } from '../../../shared/utils/moduleScaffold.js';

class SearchPublicService extends ScaffoldService {
  constructor() {
    super('public-search');
  }
}

export { SearchPublicService };
export default new SearchPublicService();
