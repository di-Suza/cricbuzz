import { ScaffoldService } from '../../shared/utils/moduleScaffold.js';
import teamRepository from './team.repository.js';
import playerRepository from '../player/player.repository.js';
import { uploadImage } from '../../shared/utils/imagekit.js';
import { NotFoundError, BadRequestError } from '../../shared/errors/index.js';

class TeamService extends ScaffoldService {
  constructor(repository = teamRepository, playerRepo = playerRepository) {
    super('team', repository);
    this.playerRepo = playerRepo;
  }

  async createTeam(data, file) {
    if (file) {
      const logoUrl = await uploadImage(file.buffer, file.originalname, 'teams');
      if (logoUrl) data.logo = logoUrl;
    }
    return this.repository.create(data);
  }

  async getAllTeams() {
    return this.repository.findAll();
  }

  async getTeamById(id) {
    const team = await this.repository.findById(id);
    if (!team) throw new NotFoundError('Team not found');
    return team;
  }

  async updateTeam(id, data, file) {
    if (file) {
      const logoUrl = await uploadImage(file.buffer, file.originalname, 'teams');
      if (logoUrl) data.logo = logoUrl;
    }
    const team = await this.repository.update(id, data);
    if (!team) throw new NotFoundError('Team not found');
    return team;
  }

  async deleteTeam(id) {
    const team = await this.repository.delete(id);
    if (!team) throw new NotFoundError('Team not found');
    return team;
  }

  async assignPlayer(teamId, playerId) {
    const player = await this.playerRepo.findById(playerId);
    if (!player) throw new NotFoundError('Player not found');

    const team = await this.repository.addPlayer(teamId, playerId);
    if (!team) throw new NotFoundError('Team not found');

    return this.updateTeamStatus(teamId);
  }

  async removePlayer(teamId, playerId) {
    const team = await this.repository.removePlayer(teamId, playerId);
    if (!team) throw new NotFoundError('Team not found');

    return this.updateTeamStatus(teamId);
  }

  async updateTeamStatus(teamId) {
    const team = await this.repository.findById(teamId);
    if (!team) throw new NotFoundError('Team not found');

    const status = team.squadPlayers.length === 11 ? 'PUBLISHED' : 'DRAFT';
    return this.repository.update(teamId, { status });
  }

  async getTeamPlayers(teamId) {
    const team = await this.repository.findById(teamId);
    if (!team) throw new NotFoundError('Team not found');
    return team.squadPlayers;
  }
}

export { TeamService };
export default new TeamService();
