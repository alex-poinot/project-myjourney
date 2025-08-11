import { jest } from '@jest/globals';
import request from 'supertest';
import express from 'express';
import missionRoutes from '../missionRoutes.js';

// Mock du contrôleur
jest.mock('../missionController.js', () => {
  return {
    default: jest.fn().mockImplementation(() => ({
      getAllMissionsDashboard: jest.fn((req, res) => {
        res.json({ 
          success: true, 
          data: [{ 
            numeroGroupe: '001', 
            nomGroupe: 'Test Group',
            email: req.params.email 
          }] 
        });
      })
    }))
  };
});

describe('Mission Routes', () => {
  let app;

  beforeEach(() => {
    app = express();
    app.use(express.json());
    app.use('/api/missions', missionRoutes);
  });

  describe('GET /api/missions/getAllMissionsDashboard/:email', () => {
    it('devrait retourner les missions pour un utilisateur', async () => {
      const email = 'test@example.com';
      const response = await request(app).get(`/api/missions/getAllMissionsDashboard/${email}`);
      
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveLength(1);
      expect(response.body.data[0].email).toBe(email);
    });
  });
});