// Configuration globale pour Jest
import { jest } from '@jest/globals';

// Mock du logger pour éviter les logs pendant les tests
jest.mock('./src/utils/logger.js', () => ({
  default: {
    info: jest.fn(),
    error: jest.fn(),
    warn: jest.fn(),
    debug: jest.fn()
  }
}));

// Mock de la base de données pour éviter les connexions réelles
jest.mock('./src/config/database.js', () => ({
  connectToDatabase: jest.fn().mockResolvedValue({}),
  getConnection: jest.fn().mockResolvedValue({
    request: jest.fn().mockReturnValue({
      input: jest.fn().mockReturnThis(),
      query: jest.fn().mockResolvedValue({ recordset: [] })
    })
  }),
  closeConnection: jest.fn().mockResolvedValue()
}));

// Configuration globale des timeouts
jest.setTimeout(10000);