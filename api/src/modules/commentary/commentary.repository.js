import { ScaffoldRepository } from '../../shared/utils/moduleScaffold.js';

class CommentaryRepository extends ScaffoldRepository {
  constructor() {
    super('commentary');
  }
}

export { CommentaryRepository };
export default new CommentaryRepository();
