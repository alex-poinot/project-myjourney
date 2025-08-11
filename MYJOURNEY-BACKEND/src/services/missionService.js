import MissionDao from '../dao/missionDao.js';
import logger from '../utils/logger.js';

class MissionService {
  constructor() {
    this.missionDao = new MissionDao();
  }

  async getAllMissionsDashboard(email) {

    try {
      logger.info(`Service: Récupération de toutes les missions pour le tableau de bord de l'utilisateur ${email}`);
      const missions = await this.missionDao.getAllMissionsDashboard(email);
      return {
        success: true,
        data: missions,
        count: missions.length
      };
    } catch (error) {
      logger.error('Service: Erreur lors de la récupération des missions pour le tableau de bord:', error);
      throw {
        status: 500,
        message: 'Erreur lors de la récupération des missions pour le tableau de bord'
      };
    }
  }
}

export default MissionService;