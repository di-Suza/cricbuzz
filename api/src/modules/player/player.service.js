import { ScaffoldService } from '../../shared/utils/moduleScaffold.js';
import playerRepository from './player.repository.js';
import { uploadImage } from '../../shared/utils/imagekit.js';
import { NotFoundError } from '../../shared/errors/index.js';

class PlayerService extends ScaffoldService {
  constructor(repository = playerRepository) {
    super('player', repository);
  }

  async createPlayer(data, file) {
    if (file) {
      const imageUrl = await uploadImage(file.buffer, file.originalname, 'players');
      if (imageUrl) data.image = imageUrl;
    }
    return this.repository.create(data);
  }

  async getAllPlayers() {
    return this.repository.findAll();
  }

  async getPlayerById(id) {
    const player = await this.repository.findById(id);
    if (!player) throw new NotFoundError('Player not found');
    return player;
  }

  async updatePlayer(id, data, file) {
    if (file) {
      const imageUrl = await uploadImage(file.buffer, file.originalname, 'players');
      if (imageUrl) data.image = imageUrl;
    }
    const player = await this.repository.update(id, data);
    if (!player) throw new NotFoundError('Player not found');
    return player;
  }

  async deletePlayer(id) {
    const player = await this.repository.delete(id);
    if (!player) throw new NotFoundError('Player not found');
    return player;
  }
}

export { PlayerService };
export default new PlayerService();
