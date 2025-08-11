import express from 'express';
import UserController from '../controllers/userController.js';

const router = express.Router();
const userController = new UserController();

// GET /api/users - Récupérer tous les utilisateurs
router.get('/', userController.getAllUsers);

// GET /api/users/:id - Récupérer un utilisateur par ID
router.get('/:id', userController.getUserById);

// POST /api/users - Créer un nouvel utilisateur
router.post('/', userController.createUser);

// PUT /api/users/:id - Mettre à jour un utilisateur
router.put('/:id', userController.updateUser);

// DELETE /api/users/:id - Supprimer un utilisateur
router.delete('/:id', userController.deleteUser);

export default router;