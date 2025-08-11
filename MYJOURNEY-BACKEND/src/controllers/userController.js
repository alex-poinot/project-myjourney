import UserService from '../services/userService.js';
import logger from '../utils/logger.js';
import { asyncHandler } from '../utils/errorHandlers.js';

class UserController {
  constructor() {
    this.userService = new UserService();
  }

  getAllUsers = asyncHandler(async (req, res) => {
    logger.info('Controller: Requête GET /users');
    
    const result = await this.userService.getAllUsers();
    
    res.status(200).json({
      ...result,
      timestamp: new Date().toISOString()
    });
  });

  getUserById = asyncHandler(async (req, res) => {
    const { id } = req.params;
    logger.info(`Controller: Requête GET /users/${id}`);
    
    const result = await this.userService.getUserById(id);
    
    res.status(200).json({
      ...result,
      timestamp: new Date().toISOString()
    });
  });

  createUser = asyncHandler(async (req, res) => {
    logger.info('Controller: Requête POST /users');
    
    const result = await this.userService.createUser(req.body);
    
    res.status(201).json({
      ...result,
      timestamp: new Date().toISOString()
    });
  });

  updateUser = asyncHandler(async (req, res) => {
    const { id } = req.params;
    logger.info(`Controller: Requête PUT /users/${id}`);
    
    const result = await this.userService.updateUser(id, req.body);
    
    res.status(200).json({
      ...result,
      timestamp: new Date().toISOString()
    });
  });

  deleteUser = asyncHandler(async (req, res) => {
    const { id } = req.params;
    logger.info(`Controller: Requête DELETE /users/${id}`);
    
    const result = await this.userService.deleteUser(id);
    
    res.status(200).json({
      ...result,
      timestamp: new Date().toISOString()
    });
  });
}

export default UserController;