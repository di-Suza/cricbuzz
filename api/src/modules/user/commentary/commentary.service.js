import { ScaffoldService } from '../../../shared/utils/moduleScaffold.js';

class CommentaryPublicService extends ScaffoldService {
  constructor() {
    super('public-commentary');
  }
}

export { CommentaryPublicService };
export default new CommentaryPublicService();
