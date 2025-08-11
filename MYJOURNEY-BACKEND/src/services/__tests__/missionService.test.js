import { jest } from '@jest/globals';
import MissionService from '../missionService.js';
import MissionDao from '../../dao/missionDao.js';

// Mock du DAO
jest.mock('../../dao/missionDao.js');

describe('MissionService', () => {
  let missionService;
  let mockMissionDao;

  beforeEach(() => {
    jest.clearAllMocks();
    
    mockMissionDao = new MissionDao();
    missionService = new MissionService();
    missionService.missionDao = mockMissionDao;
  });

  describe('getAllMissionsDashboard', () => {
    it('devrait retourner toutes les missions pour un utilisateur', async () => {
      // Arrange
      const email = 'test@example.com';
      const mockMissions = [
        {
          numeroGroupe: '001',
          nomGroupe: 'Groupe Test',
          numeroClient: 'CLI001',
          nomClient: 'Client Test',
          mission: 'Mission EC',
          avantMission: { percentage: 75, lab: true, conflitCheck: true, qac: true, qam: false, ldm: false },
          pendantMission: { percentage: 25, nog: true, checklist: false, revision: false, supervision: false },
          finMission: { percentage: 0, ndsCr: false, qmm: false, plaquette: false, restitution: false }
        }
      ];
      
      mockMissionDao.getAllMissionsDashboard.mockResolvedValue(mockMissions);

      // Act
      const result = await missionService.getAllMissionsDashboard(email);

      // Assert
      expect(result).toEqual({
        success: true,
        data: mockMissions,
        count: 1
      });
      expect(mockMissionDao.getAllMissionsDashboard).toHaveBeenCalledWith(email);
    });

    it('devrait gérer les erreurs du DAO', async () => {
      // Arrange
      const email = 'test@example.com';
      const mockError = new Error('Erreur base de données');
      mockMissionDao.getAllMissionsDashboard.mockRejectedValue(mockError);

      // Act & Assert
      await expect(missionService.getAllMissionsDashboard(email)).rejects.toEqual({
        status: 500,
        message: 'Erreur lors de la récupération des missions pour le tableau de bord'
      });
    });

    it('devrait retourner un tableau vide si aucune mission', async () => {
      // Arrange
      const email = 'test@example.com';
      mockMissionDao.getAllMissionsDashboard.mockResolvedValue([]);

      // Act
      const result = await missionService.getAllMissionsDashboard(email);

      // Assert
      expect(result).toEqual({
        success: true,
        data: [],
        count: 0
      });
    });
  });
});