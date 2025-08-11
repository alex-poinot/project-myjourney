import logger from './logger.js';

export function errorHandler(err, req, res, next) {
  logger.error(`Erreur: ${err.message}`, {
    stack: err.stack,
    url: req.url,
    method: req.method,
    ip: req.ip
  });

  // Erreurs de validation
  if (err.name === 'ValidationError') {
    return res.status(400).json({
      error: 'Erreur de validation',
      message: err.message,
      details: err.errors
    });
  }

  // Erreurs de base de données
  if (err.code && err.code.startsWith('E')) {
    return res.status(500).json({
      error: 'Erreur de base de données',
      message: 'Une erreur s\'est produite lors de l\'accès aux données'
    });
  }

  // Erreur générique
  res.status(err.status || 500).json({
    error: 'Erreur interne du serveur',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Une erreur inattendue s\'est produite'
  });
}

export function notFoundHandler(req, res) {
  logger.warn(`Route non trouvée: ${req.method} ${req.url} - ${req.ip}`);
  res.status(404).json({
    error: 'Route non trouvée',
    message: `La route ${req.method} ${req.url} n'existe pas`
  });
}

export function asyncHandler(fn) {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}