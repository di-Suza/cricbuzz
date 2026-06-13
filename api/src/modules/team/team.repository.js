import { ScaffoldRepository } from '../../shared/utils/moduleScaffold.js';
import Team from './team.model.js';

class TeamRepository extends ScaffoldRepository {
  constructor() {
    super('team');
    this.model = Team;
  }

  create(data) {
    return this.model.create(data);
  }

  findAll() {
    return this.model.find().populate('squadPlayers');
  }

  findById(id) {
    return this.model.findById(id).populate('squadPlayers');
  }

  update(id, data) {
    return this.model.findByIdAndUpdate(id, data, { new: true, runValidators: true });
  }

  delete(id) {
    return this.model.findByIdAndDelete(id);
  }

  addPlayer(teamId, playerId) {
    return this.model.findByIdAndUpdate(
      teamId,
      { $addToSet: { squadPlayers: playerId } },
      { new: true }
    );
  }

  removePlayer(teamId, playerId) {
    return this.model.findByIdAndUpdate(
      teamId,
      { $pull: { squadPlayers: playerId } },
      { new: true }
    );
  }
}

export { TeamRepository };
export default new TeamRepository();
