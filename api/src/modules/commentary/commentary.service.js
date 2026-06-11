import { ScaffoldService } from '../../shared/utils/moduleScaffold.js';
import commentaryRepository from './commentary.repository.js';

class CommentaryService extends ScaffoldService {
  constructor(repository = commentaryRepository) {
    super('commentary', repository);
  }
}

export { CommentaryService };
export default new CommentaryService();
