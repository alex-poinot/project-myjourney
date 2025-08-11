import { jest } from '@jest/globals';
import { errorHandler, notFoundHandler, asyncHandler } from '../errorHandlers.js';

describe('Error Handlers', () => {
  let mockReq, mockRes, mockNext;

  beforeEach(() => {
    mockReq = {
      url: '/test',
      method: 'GET',
      ip: '127.0.0.1'
    };
    
    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis()
    };
    
    mockNext = jest.fn();
  });

  describe('errorHandler', () => {
    it('devrait gérer les erreurs de validation', () => {
      // Arrange
      const error = {
        name: 'ValidationError',
        message: 'Erreur de validation',
        errors: { field: 'required' }
      };

      // Act
      errorHandler(error, mockReq, mockRes, mockNext);

      // Assert
      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({
        error: 'Erreur de validation',
        message: 'Erreur de validation',
        details: { field: 'required' }
      });
    });

    it('devrait gérer les erreurs de base de données', () => {
      // Arrange
      const error = {
        code: 'E_DATABASE_ERROR',
        message: 'Erreur DB'
      };

      // Act
      errorHandler(error, mockReq, mockRes, mockNext);

      // Assert
      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith({
        error: 'Erreur de base de données',
        message: 'Une erreur s\'est produite lors de l\'accès aux données'
      });
    });

    it('devrait gérer les erreurs génériques', () => {
      // Arrange
      const error = {
        message: 'Erreur générique',
        status: 403
      };

      // Act
      errorHandler(error, mockReq, mockRes, mockNext);

      // Assert
      expect(mockRes.status).toHaveBeenCalledWith(403);
      expect(mockRes.json).toHaveBeenCalledWith({
        error: 'Erreur interne du serveur',
        message: 'Erreur générique'
      });
    });
  });

  describe('notFoundHandler', () => {
    it('devrait retourner 404 pour une route non trouvée', () => {
      // Act
      notFoundHandler(mockReq, mockRes);

      // Assert
      expect(mockRes.status).toHaveBeenCalledWith(404);
      expect(mockRes.json).toHaveBeenCalledWith({
        error: 'Route non trouvée',
        message: 'La route GET /test n\'existe pas'
      });
    });
  });

  describe('asyncHandler', () => {
    it('devrait exécuter une fonction async avec succès', async () => {
      // Arrange
      const asyncFn = jest.fn().mockResolvedValue('success');
      const wrappedFn = asyncHandler(asyncFn);

      // Act
      await wrappedFn(mockReq, mockRes, mockNext);

      // Assert
      expect(asyncFn).toHaveBeenCalledWith(mockReq, mockRes, mockNext);
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('devrait capturer les erreurs async et les passer à next', async () => {
      // Arrange
      const error = new Error('Async error');
      const asyncFn = jest.fn().mockRejectedValue(error);
      const wrappedFn = asyncHandler(asyncFn);

      // Act
      await wrappedFn(mockReq, mockRes, mockNext);

      // Assert
      expect(asyncFn).toHaveBeenCalledWith(mockReq, mockRes, mockNext);
      expect(mockNext).toHaveBeenCalledWith(error);
    });
  });
});