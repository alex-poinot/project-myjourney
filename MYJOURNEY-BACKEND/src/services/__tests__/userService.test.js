import { jest } from '@jest/globals';
import UserService from '../userService.js';
import UserDao from '../../dao/userDao.js';

// Mock du DAO
jest.mock('../../dao/userDao.js');

describe('UserService', () => {
  let userService;
  let mockUserDao;

  beforeEach(() => {
    // Réinitialiser les mocks avant chaque test
    jest.clearAllMocks();
    
    // Créer une instance mockée du DAO
    mockUserDao = new UserDao();
    userService = new UserService();
    userService.userDao = mockUserDao;
  });

  describe('getAllUsers', () => {
    it('devrait retourner tous les utilisateurs avec succès', async () => {
      // Arrange
      const mockUsers = [
        { USR_ID: 1, USR_NOM: 'Dupont', USR_MAIL: 'dupont@test.com' },
        { USR_ID: 2, USR_NOM: 'Martin', USR_MAIL: 'martin@test.com' }
      ];
      mockUserDao.getAllUsers.mockResolvedValue(mockUsers);

      // Act
      const result = await userService.getAllUsers();

      // Assert
      expect(result).toEqual({
        success: true,
        data: mockUsers,
        count: 2
      });
      expect(mockUserDao.getAllUsers).toHaveBeenCalledTimes(1);
    });

    it('devrait gérer les erreurs du DAO', async () => {
      // Arrange
      const mockError = new Error('Erreur base de données');
      mockUserDao.getAllUsers.mockRejectedValue(mockError);

      // Act & Assert
      await expect(userService.getAllUsers()).rejects.toEqual({
        status: 500,
        message: 'Erreur lors de la récupération des utilisateurs'
      });
    });
  });

  describe('getUserById', () => {
    it('devrait retourner un utilisateur par ID', async () => {
      // Arrange
      const mockUser = { USR_ID: 1, USR_NOM: 'Dupont', USR_MAIL: 'dupont@test.com' };
      mockUserDao.getUserById.mockResolvedValue(mockUser);

      // Act
      const result = await userService.getUserById(1);

      // Assert
      expect(result).toEqual({
        success: true,
        data: mockUser
      });
      expect(mockUserDao.getUserById).toHaveBeenCalledWith(1);
    });

    it('devrait rejeter avec un ID invalide', async () => {
      // Act & Assert
      await expect(userService.getUserById('invalid')).rejects.toEqual({
        status: 400,
        message: 'ID utilisateur invalide'
      });
    });

    it('devrait rejeter si utilisateur non trouvé', async () => {
      // Arrange
      mockUserDao.getUserById.mockResolvedValue(null);

      // Act & Assert
      await expect(userService.getUserById(999)).rejects.toEqual({
        status: 404,
        message: 'Utilisateur non trouvé'
      });
    });
  });

  describe('createUser', () => {
    it('devrait créer un utilisateur avec des données valides', async () => {
      // Arrange
      const userData = { nom: 'Nouveau', email: 'nouveau@test.com' };
      const mockCreatedUser = { USR_ID: 3, ...userData };
      
      mockUserDao.checkEmailExists.mockResolvedValue(false);
      mockUserDao.createUser.mockResolvedValue(mockCreatedUser);

      // Act
      const result = await userService.createUser(userData);

      // Assert
      expect(result).toEqual({
        success: true,
        data: mockCreatedUser,
        message: 'Utilisateur créé avec succès'
      });
      expect(mockUserDao.checkEmailExists).toHaveBeenCalledWith('nouveau@test.com');
      expect(mockUserDao.createUser).toHaveBeenCalledWith(userData);
    });

    it('devrait rejeter si email déjà utilisé', async () => {
      // Arrange
      const userData = { nom: 'Nouveau', email: 'existant@test.com' };
      mockUserDao.checkEmailExists.mockResolvedValue(true);

      // Act & Assert
      await expect(userService.createUser(userData)).rejects.toEqual({
        status: 409,
        message: 'Cet email est déjà utilisé'
      });
    });

    it('devrait valider les données utilisateur', async () => {
      // Act & Assert
      await expect(userService.createUser({})).rejects.toEqual({
        status: 400,
        message: 'Le nom est requis et doit être une chaîne non vide'
      });

      await expect(userService.createUser({ nom: 'Test' })).rejects.toEqual({
        status: 400,
        message: 'L\'email est requis et doit être une chaîne non vide'
      });

      await expect(userService.createUser({ nom: 'Test', email: 'invalid-email' })).rejects.toEqual({
        status: 400,
        message: 'Format d\'email invalide'
      });
    });
  });

  describe('updateUser', () => {
    it('devrait mettre à jour un utilisateur existant', async () => {
      // Arrange
      const userData = { nom: 'Modifié', email: 'modifie@test.com' };
      const mockUpdatedUser = { USR_ID: 1, ...userData };
      
      mockUserDao.checkUserExists.mockResolvedValue(true);
      mockUserDao.checkEmailExists.mockResolvedValue(false);
      mockUserDao.updateUser.mockResolvedValue(mockUpdatedUser);

      // Act
      const result = await userService.updateUser(1, userData);

      // Assert
      expect(result).toEqual({
        success: true,
        data: mockUpdatedUser,
        message: 'Utilisateur mis à jour avec succès'
      });
    });

    it('devrait rejeter si utilisateur n\'existe pas', async () => {
      // Arrange
      const userData = { nom: 'Test', email: 'test@test.com' };
      mockUserDao.checkUserExists.mockResolvedValue(false);

      // Act & Assert
      await expect(userService.updateUser(999, userData)).rejects.toEqual({
        status: 404,
        message: 'Utilisateur non trouvé'
      });
    });
  });

  describe('deleteUser', () => {
    it('devrait supprimer un utilisateur existant', async () => {
      // Arrange
      const mockDeletedUser = { USR_ID: 1, USR_NOM: 'Supprimé' };
      mockUserDao.checkUserExists.mockResolvedValue(true);
      mockUserDao.deleteUser.mockResolvedValue(mockDeletedUser);

      // Act
      const result = await userService.deleteUser(1);

      // Assert
      expect(result).toEqual({
        success: true,
        data: mockDeletedUser,
        message: 'Utilisateur supprimé avec succès'
      });
    });

    it('devrait rejeter si utilisateur n\'existe pas', async () => {
      // Arrange
      mockUserDao.checkUserExists.mockResolvedValue(false);

      // Act & Assert
      await expect(userService.deleteUser(999)).rejects.toEqual({
        status: 404,
        message: 'Utilisateur non trouvé'
      });
    });
  });

  describe('validateUserData', () => {
    it('devrait valider des données correctes', () => {
      const validData = { nom: 'Test', email: 'test@test.com' };
      const result = userService.validateUserData(validData);
      expect(result).toBeNull();
    });

    it('devrait rejeter des données invalides', () => {
      expect(userService.validateUserData(null)).toBe('Données utilisateur manquantes');
      expect(userService.validateUserData({})).toBe('Le nom est requis et doit être une chaîne non vide');
      expect(userService.validateUserData({ nom: '' })).toBe('Le nom est requis et doit être une chaîne non vide');
      expect(userService.validateUserData({ nom: 'Test' })).toBe('L\'email est requis et doit être une chaîne non vide');
      expect(userService.validateUserData({ nom: 'Test', email: 'invalid' })).toBe('Format d\'email invalide');
    });
  });
});