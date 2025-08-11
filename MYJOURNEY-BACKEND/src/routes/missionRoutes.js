import express from 'express';
import MissionController from '../controllers/missionController.js';

const router = express.Router();
const missionController = new MissionController();

// GET /api/getAllMissionsDashboard - Récupérer toutes les missions
router.get('/getAllMissionsDashboard/:email', missionController.getAllMissionsDashboard);

export default router;