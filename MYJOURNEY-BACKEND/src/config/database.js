import sql from 'mssql';
import dotenv from 'dotenv';
import logger from '../utils/logger.js';

dotenv.config();

const config = {
  server: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT) || 1433,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  options: {
    encrypt: false, // Utiliser true si vous utilisez Azure
    trustServerCertificate: true, // Utiliser true pour les certificats auto-signés
    enableArithAbort: true,
    requestTimeout: 30000,
    connectionTimeout: 30000
  },
  pool: {
    max: 10,
    min: 0,
    idleTimeoutMillis: 30000
  }
};

let poolPromise;

export async function connectToDatabase() {
  try {
    if (!poolPromise) {
      poolPromise = new sql.ConnectionPool(config);
      poolPromise.on('error', (err) => {
        logger.error('Erreur de pool de connexion:', err);
      });
    }
    
    await poolPromise.connect();
    logger.info('Pool de connexions SQL Server créé avec succès');
    return poolPromise;
  } catch (error) {
    logger.error('Erreur lors de la connexion à SQL Server:', error);
    throw error;
  }
}

export async function getConnection() {
  try {
    if (!poolPromise) {
      await connectToDatabase();
    }
    return poolPromise;
  } catch (error) {
    logger.error('Erreur lors de l\'obtention de la connexion:', error);
    throw error;
  }
}

export async function closeConnection() {
  try {
    if (poolPromise) {
      await poolPromise.close();
      poolPromise = null;
      logger.info('Connexion à la base de données fermée');
    }
  } catch (error) {
    logger.error('Erreur lors de la fermeture de la connexion:', error);
  }
}