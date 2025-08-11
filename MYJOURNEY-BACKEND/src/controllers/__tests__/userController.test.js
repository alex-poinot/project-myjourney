import { jest } from '@jest/globals';
import request from 'supertest';
import express from 'express';
import UserController from '../userController.js';
import UserService from '../../services/userService.js';

// Mock du service
jest.mock('../../services/userService.js');

describe('UserController', () => {
  let app;
  let userController;
  let mockUserService;

  beforeEach(() => {
    jest.clearAllMocks();
    
    // Créer une app Express pour les tests
    app = express();
    app.use(express.json());
    
    // Mock du service
    mockUserService = new UserService();
    userController = new UserController();
    userController.userService = mockUserService;
    
    // Routes de test
    app.get('/users', userController.getAllUsers);
    app.get('/users/:id', userController.getUserById);
    app.post('/users', userController.createUser);
    app.put('/users/:id', userController.updateUser);
    app.delete('/users/:id', userController.deleteUser);
  });

  describe('GET /users', () => {
    it('devrait retourner tous les utilisateurs', async () => {
      // Arrange
      const mockResponse = {
        success: true,
        data: [{ USR_ID: 1, USR_NOM: 'Test' }],
        count: 1
      };
      mockUserService.getAllUsers.mockResolvedValue(mockResponse);

      // Act
      const response = await request(app).get('/users');

      // Assert
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveLength(1);
      expect(response.body.timestamp).toBeDefined();
    });

    it('devrait gérer les erreurs du service', async () => {
      // Arrange
      mockUserService.getAllUsers.mockRejectedValue({
        status: 500,
        message: 'Erreur serveur'
      });

      // Act
      const response = await request(app).get('/users');

      // Assert
      expect(response.status).toBe(500);
    });
  });

  describe('GET /users/:id', () => {
    it('devrait retourner un utilisateur par ID', async () => {
      // Arrange
      const mockResponse = {
        success: true,
        data: { USR_ID: 1, USR_NOM: 'Test' }
      };
      mockUserService.getUserById.mockResolvedValue(mockResponse);

      // Act
      const response = await request(app).get('/users/1');

      // Assert
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.USR_ID).toBe(1);
    });

    it('devrait retourner 404 si utilisateur non trouvé', async () => {
      // Arrange
      mockUserService.getUserById.mockRejectedValue({
        status: 404,
        message: 'Utilisateur non trouvé'
      });

      // Act
      const response = await request(app).get('/users/999');

      // Assert
      expect(response.status).toBe(404);
    });
  });

  describe('POST /users', () => {
    it('devrait créer un nouvel utilisateur', async () => {
      // Arrange
      const userData = { nom: 'Nouveau', email: 'nouveau@test.com' };
      const mockResponse = {
        success: true,
        data: { USR_ID: 1, ...userData },
        message: 'Utilisateur créé avec succès'
      };
      mockUserService.createUser.mockResolvedValue(mockResponse);

      // Act
      const response = await request(app)
        .post('/users')
        .send(userData);

      // Assert
      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('Utilisateur créé avec succès');
    });

    it('devrait retourner 400 pour des données invalides', async () => {
      // Arrange
      mockUserService.createUser.mockRejectedValue({
        status: 400,
        message: 'Données invalides'
      });

      // Act
      const response = await request(app)
        .post('/users')
        .send({});

      // Assert
      expect(response.status).toBe(400);
    });
  });

  describe('PUT /users/:id', () => {
    it('devrait mettre à jour un utilisateur', async () => {
      // Arrange
      const userData = { nom: 'Modifié', email: 'modifie@test.com' };
      const mockResponse = {
        success: true,
        data: { USR_ID: 1, ...userData },
        message: 'Utilisateur mis à jour avec succès'
      };
      mockUserService.updateUser.mockResolvedValue(mockResponse);

      // Act
      const response = await request(app)
        .put('/users/1')
        .send(userData);

      // Assert
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('Utilisateur mis à jour avec succès');
    });
  });

  describe('DELETE /users/:id', () => {
    it('devrait supprimer un utilisateur', async () => {
      // Arrange
      const mockResponse = {
        success: true,
        data: { USR_ID: 1, USR_NOM: 'Supprimé' },
        message: 'Utilisateur supprimé avec succès'
      };
      mockUserService.deleteUser.mockResolvedValue(mockResponse);

      // Act
      const response = await request(app).delete('/users/1');

      // Assert
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('Utilisateur supprimé avec succès');
    });
  });
});