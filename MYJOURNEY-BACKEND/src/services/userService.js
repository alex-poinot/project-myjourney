import UserDao from '../dao/userDao.js';
import logger from '../utils/logger.js';

class UserService {
  constructor() {
    this.userDao = new UserDao();
  }

  async getAllUsers() {
    try {
      logger.info('Service: Récupération de tous les utilisateurs');
      const users = await this.userDao.getAllUsers();
      return {
        success: true,
        data: users,
        count: users.length
      };
    } catch (error) {
      logger.error('Service: Erreur lors de la récupération des utilisateurs:', error);
      throw {
        status: 500,
        message: 'Erreur lors de la récupération des utilisateurs'
      };
    }
  }

  async getUserById(id) {
    try {
      // Validation de l'ID
      if (!id || isNaN(id) || parseInt(id) <= 0) {
        throw {
          status: 400,
          message: 'ID utilisateur invalide'
        };
      }

      logger.info(`Service: Récupération de l'utilisateur ID ${id}`);
      const user = await this.userDao.getUserById(parseInt(id));
      
      if (!user) {
        throw {
          status: 404,
          message: 'Utilisateur non trouvé'
        };
      }

      return {
        success: true,
        data: user
      };
    } catch (error) {
      if (error.status) {
        throw error;
      }
      logger.error(`Service: Erreur lors de la récupération de l'utilisateur ID ${id}:`, error);
      throw {
        status: 500,
        message: 'Erreur lors de la récupération de l\'utilisateur'
      };
    }
  }

  async createUser(userData) {
    try {
      // Validation des données
      const validationError = this.validateUserData(userData);
      if (validationError) {
        throw {
          status: 400,
          message: validationError
        };
      }

      // Vérification de l'unicité de l'email
      const emailExists = await this.userDao.checkEmailExists(userData.email);
      if (emailExists) {
        throw {
          status: 409,
          message: 'Cet email est déjà utilisé'
        };
      }

      logger.info(`Service: Création d'un nouvel utilisateur avec l'email ${userData.email}`);
      const newUser = await this.userDao.createUser(userData);
      
      return {
        success: true,
        data: newUser,
        message: 'Utilisateur créé avec succès'
      };
    } catch (error) {
      if (error.status) {
        throw error;
      }
      logger.error('Service: Erreur lors de la création de l\'utilisateur:', error);
      throw {
        status: 500,
        message: 'Erreur lors de la création de l\'utilisateur'
      };
    }
  }

  async updateUser(id, userData) {
    try {
      // Validation de l'ID
      if (!id || isNaN(id) || parseInt(id) <= 0) {
        throw {
          status: 400,
          message: 'ID utilisateur invalide'
        };
      }

      // Validation des données
      const validationError = this.validateUserData(userData);
      if (validationError) {
        throw {
          status: 400,
          message: validationError
        };
      }

      // Vérification de l'existence de l'utilisateur
      const userExists = await this.userDao.checkUserExists(parseInt(id));
      if (!userExists) {
        throw {
          status: 404,
          message: 'Utilisateur non trouvé'
        };
      }

      // Vérification de l'unicité de l'email
      const emailExists = await this.userDao.checkEmailExists(userData.email, parseInt(id));
      if (emailExists) {
        throw {
          status: 409,
          message: 'Cet email est déjà utilisé par un autre utilisateur'
        };
      }

      logger.info(`Service: Mise à jour de l'utilisateur ID ${id}`);
      const updatedUser = await this.userDao.updateUser(parseInt(id), userData);
      
      return {
        success: true,
        data: updatedUser,
        message: 'Utilisateur mis à jour avec succès'
      };
    } catch (error) {
      if (error.status) {
        throw error;
      }
      logger.error(`Service: Erreur lors de la mise à jour de l'utilisateur ID ${id}:`, error);
      throw {
        status: 500,
        message: 'Erreur lors de la mise à jour de l\'utilisateur'
      };
    }
  }

  async deleteUser(id) {
    try {
      // Validation de l'ID
      if (!id || isNaN(id) || parseInt(id) <= 0) {
        throw {
          status: 400,
          message: 'ID utilisateur invalide'
        };
      }

      // Vérification de l'existence de l'utilisateur
      const userExists = await this.userDao.checkUserExists(parseInt(id));
      if (!userExists) {
        throw {
          status: 404,
          message: 'Utilisateur non trouvé'
        };
      }

      logger.info(`Service: Suppression de l'utilisateur ID ${id}`);
      const deletedUser = await this.userDao.deleteUser(parseInt(id));
      
      return {
        success: true,
        data: deletedUser,
        message: 'Utilisateur supprimé avec succès'
      };
    } catch (error) {
      if (error.status) {
        throw error;
      }
      logger.error(`Service: Erreur lors de la suppression de l'utilisateur ID ${id}:`, error);
      throw {
        status: 500,
        message: 'Erreur lors de la suppression de l\'utilisateur'
      };
    }
  }

  validateUserData(userData) {
    if (!userData) {
      return 'Données utilisateur manquantes';
    }

    if (!userData.nom || typeof userData.nom !== 'string' || userData.nom.trim().length === 0) {
      return 'Le nom est requis et doit être une chaîne non vide';
    }

    if (userData.nom.trim().length > 255) {
      return 'Le nom ne peut pas dépasser 255 caractères';
    }

    if (!userData.email || typeof userData.email !== 'string' || userData.email.trim().length === 0) {
      return 'L\'email est requis et doit être une chaîne non vide';
    }

    if (userData.email.trim().length > 255) {
      return 'L\'email ne peut pas dépasser 255 caractères';
    }

    // Validation basique de l'email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(userData.email.trim())) {
      return 'Format d\'email invalide';
    }

    return null;
  }
}

export default UserService;