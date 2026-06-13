import { ScaffoldRepository } from '../../shared/utils/moduleScaffold.js';
import Player from './player.model.js';

class PlayerRepository extends ScaffoldRepository {
  constructor() {
    super('player');
    this.model = Player;
  }

  create(data) {
    return this.model.create(data);
  }

  findAll() {
    return this.model.find();
  }

  findById(id) {
    return this.model.findById(id);
  }

  update(id, data) {
    return this.model.findByIdAndUpdate(id, data, { new: true, runValidators: true });
  }

  delete(id) {
    return this.model.findByIdAndDelete(id);
  }
}

export { PlayerRepository };
export default new PlayerRepository();
