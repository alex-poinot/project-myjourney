import { jest } from '@jest/globals';
import request from 'supertest';
import express from 'express';
import MissionController from '../missionController.js';
import MissionService from '../../services/missionService.js';

// Mock du service
jest.mock('../../services/missionService.js');

describe('MissionController', () => {
  let app;
  let missionController;
  let mockMissionService;

  beforeEach(() => {
    jest.clearAllMocks();
    
    app = express();
    app.use(express.json());
    
    mockMissionService = new MissionService();
    missionController = new MissionController();
    missionController.missionService = mockMissionService;
    
    app.get('/missions/getAllMissionsDashboard/:email', missionController.getAllMissionsDashboard);
  });

  describe('GET /missions/getAllMissionsDashboard/:email', () => {
    it('devrait retourner toutes les missions pour un utilisateur', async () => {
      // Arrange
      const email = 'test@example.com';
      const mockResponse = {
        success: true,
        data: [
          {
            numeroGroupe: '001',
            nomGroupe: 'Groupe Test',
            numeroClient: 'CLI001',
            nomClient: 'Client Test',
            mission: 'Mission EC'
          }
        ],
        count: 1
      };
      mockMissionService.getAllMissionsDashboard.mockResolvedValue(mockResponse);

      // Act
      const response = await request(app).get(`/missions/getAllMissionsDashboard/${email}`);

      // Assert
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveLength(1);
      expect(response.body.timestamp).toBeDefined();
      expect(mockMissionService.getAllMissionsDashboard).toHaveBeenCalledWith(email);
    });

    it('devrait gérer les erreurs du service', async () => {
      // Arrange
      const email = 'test@example.com';
      mockMissionService.getAllMissionsDashboard.mockRejectedValue({
        status: 500,
        message: 'Erreur serveur'
      });

      // Act
      const response = await request(app).get(`/missions/getAllMissionsDashboard/${email}`);

      // Assert
      expect(response.status).toBe(500);
    });

    it('devrait retourner un tableau vide si aucune mission', async () => {
      // Arrange
      const email = 'test@example.com';
      const mockResponse = {
        success: true,
        data: [],
        count: 0
      };
      mockMissionService.getAllMissionsDashboard.mockResolvedValue(mockResponse);

      // Act
      const response = await request(app).get(`/missions/getAllMissionsDashboard/${email}`);

      // Assert
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveLength(0);
      expect(response.body.count).toBe(0);
    });
  });
});