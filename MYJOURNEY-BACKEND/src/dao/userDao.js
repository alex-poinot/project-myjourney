import fs from 'fs/promises';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import sql from 'mssql';
import { getConnection } from '../config/database.js';
import logger from '../utils/logger.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

class UserDao {
  constructor() {
    this.queries = null;
  }

  async loadQueries() {
    if (!this.queries) {
      try {
        const queriesPath = join(__dirname, '../SQL/userQueries.json');
        const queriesContent = await fs.readFile(queriesPath, 'utf8');
        this.queries = JSON.parse(queriesContent);
        logger.debug('Requêtes utilisateur chargées depuis userQueries.json');
      } catch (error) {
        logger.error('Erreur lors du chargement des requêtes utilisateur:', error);
        throw new Error('Impossible de charger les requêtes utilisateur');
      }
    }
    return this.queries;
  }

  async getAllUsers() {
    try {
      await this.loadQueries();
      const pool = await getConnection();
      const request = pool.request();
      
      const result = await request.query(this.queries.getAllUsers.query);
      logger.info(`${result.recordset.length} utilisateurs récupérés`);
      
      return result.recordset;
    } catch (error) {
      logger.error('Erreur lors de la récupération des utilisateurs:', error);
      throw error;
    }
  }

  async getUserById(id) {
    try {
      await this.loadQueries();
      const pool = await getConnection();
      const request = pool.request();
      
      request.input('id', sql.Int, id);
      const result = await request.query(this.queries.getUserById.query);
      
      const user = result.recordset[0];
      if (user) {
        logger.info(`Utilisateur récupéré: ID ${id}`);
      } else {
        logger.warn(`Utilisateur non trouvé: ID ${id}`);
      }
      
      return user;
    } catch (error) {
      logger.error(`Erreur lors de la récupération de l'utilisateur ID ${id}:`, error);
      throw error;
    }
  }

  async createUser(userData) {
    try {
      await this.loadQueries();
      const pool = await getConnection();
      const request = pool.request();
      
      request.input('nom', sql.NVarChar(255), userData.nom);
      request.input('email', sql.NVarChar(255), userData.email);
      
      const result = await request.query(this.queries.createUser.query);
      const newUser = result.recordset[0];
      
      logger.info(`Nouvel utilisateur créé: ID ${newUser.id}, Email: ${newUser.email}`);
      return newUser;
    } catch (error) {
      logger.error('Erreur lors de la création de l\'utilisateur:', error);
      throw error;
    }
  }

  async updateUser(id, userData) {
    try {
      await this.loadQueries();
      const pool = await getConnection();
      const request = pool.request();
      
      request.input('id', sql.Int, id);
      request.input('nom', sql.NVarChar(255), userData.nom);
      request.input('email', sql.NVarChar(255), userData.email);
      
      const result = await request.query(this.queries.updateUser.query);
      const updatedUser = result.recordset[0];
      
      if (updatedUser) {
        logger.info(`Utilisateur mis à jour: ID ${id}`);
      } else {
        logger.warn(`Aucun utilisateur trouvé pour la mise à jour: ID ${id}`);
      }
      
      return updatedUser;
    } catch (error) {
      logger.error(`Erreur lors de la mise à jour de l'utilisateur ID ${id}:`, error);
      throw error;
    }
  }

  async deleteUser(id) {
    try {
      await this.loadQueries();
      const pool = await getConnection();
      const request = pool.request();
      
      request.input('id', sql.Int, id);
      const result = await request.query(this.queries.deleteUser.query);
      const deletedUser = result.recordset[0];
      
      if (deletedUser) {
        logger.info(`Utilisateur supprimé: ID ${id}, Email: ${deletedUser.email}`);
      } else {
        logger.warn(`Aucun utilisateur trouvé pour la suppression: ID ${id}`);
      }
      
      return deletedUser;
    } catch (error) {
      logger.error(`Erreur lors de la suppression de l'utilisateur ID ${id}:`, error);
      throw error;
    }
  }

  async checkUserExists(id) {
    try {
      await this.loadQueries();
      const pool = await getConnection();
      const request = pool.request();
      
      request.input('id', sql.Int, id);
      const result = await request.query(this.queries.checkUserExists.query);
      
      return result.recordset[0].count > 0;
    } catch (error) {
      logger.error(`Erreur lors de la vérification de l'existence de l'utilisateur ID ${id}:`, error);
      throw error;
    }
  }

  async checkEmailExists(email, excludeId = null) {
    try {
      await this.loadQueries();
      const pool = await getConnection();
      const request = pool.request();
      
      request.input('email', sql.NVarChar(255), email);
      request.input('id', sql.Int, excludeId || 0);
      
      const result = await request.query(this.queries.checkEmailExists.query);
      return result.recordset[0].count > 0;
    } catch (error) {
      logger.error(`Erreur lors de la vérification de l'email ${email}:`, error);
      throw error;
    }
  }
}

export default UserDao;