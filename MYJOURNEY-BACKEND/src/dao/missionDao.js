import fs from 'fs/promises';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import yaml from 'js-yaml';
import sql from 'mssql';
import { getConnection } from '../config/database.js';
import logger from '../utils/logger.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

class MissionDao {
  constructor() {
    this.queries = null;
  }

  async loadQueries() {
    if (!this.queries) {
      try {
        const queriesPath = join(__dirname, '../SQL/missionQueries.yaml');
        const queriesContent = await fs.readFile(queriesPath, 'utf8');
        this.queries = yaml.load(queriesContent);
        logger.debug('Requêtes missions chargées depuis missionQueries.yaml');
      } catch (error) {
        logger.error('Erreur lors du chargement des requêtes YAML:', error);
        throw new Error('Impossible de charger les requêtes missions depuis le fichier YAML');
      }
    }
    return this.queries;
  }

  async getAllMissionsDashboard(email) {
    try {
      const queries = await this.loadQueries();
      const query = queries.getAllMissionsDashboard;
      const pool = await getConnection();
      const request = pool.request();

      request.input('Email', sql.VarChar, email);
      const result = await request.query(query);
      logger.info(`${result.recordset.length} utilisateurs récupérés`);

      // je veux renommer dans mon objet retourné le champ DOS_SOCIETEGROUPE en numeroGroupe
      result.recordset.forEach(mission => {
        mission.numeroGroupe = mission.DOS_SOCIETEGROUPE;
        delete mission.DOS_SOCIETEGROUPE;
        mission.nomGroupe = mission.DOS_SOCIETEGROUPELIBELLE;
        delete mission.DOS_SOCIETEGROUPELIBELLE;
        mission.numeroClient = mission.DOS_PGI;
        delete mission.DOS_PGI;
        mission.nomClient = mission.DOS_NOM;
        delete mission.DOS_NOM;
        mission.mission = mission.MISSION;
        delete mission.MISSION;
        mission.avantMission = { percentage: 75, lab: true, conflitCheck: true, qac: true, qam: false, ldm: false };
        mission.pendantMission = { percentage: 25, nog: true, checklist: false, revision: false, supervision: false };
        mission.finMission = { percentage: 0, ndsCr: false, qmm: false, plaquette: false, restitution: false };
      });

      // Log the number of missions retrieved
      logger.info(`${result.recordset.length} missions récupérées`);

      return result.recordset;
    } catch (error) {
      logger.error('Erreur lors de la récupération des missions pour le tableau de bord:', error);
      throw new Error('Erreur lors de la récupération des missions pour le tableau de bord');
    }
  }
}

export default MissionDao;