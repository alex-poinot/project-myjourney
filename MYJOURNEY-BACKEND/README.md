# Documentation Technique BackEnd - MyJourney

Une API REST professionnelle construite avec Node.js, Express.js et SQL Server 15, suivant une architecture en couches avec une gestion complète des logs.

## 🏗️ Architecture

```
├── server.js                 # Point d'entrée principal
├── logs/                     # Fichiers de logs (créé automatiquement)
└── src/
    ├── config/
    │   └── database.js       # Configuration SQL Server
    ├── controllers/
    │   └── userController.js # Contrôleurs Express
    ├── dao/
    │   └── userDao.js        # Accès aux données
    ├── routes/
    │   └── userRoutes.js     # Définition des routes
    ├── services/
    │   └── userService.js    # Logique métier
    ├── SQL/
    │   └── userQueries.yaml  # Requêtes SQL en yaml
    └── utils/
        ├── logger.js         # Configuration Winston
        └── errorHandlers.js  # Gestion d'erreurs
```

## 🔧 Fonctionnalités

- **Architecture en couches** : DAO → Services → Controllers → Routes
- **Gestion des logs** : Winston avec rotation quotidienne
- **Validation des données** : Validation complète des entrées
- **Gestion d'erreurs** : Middleware centralisé pour les erreurs
- **Sécurité** : Helmet et CORS configurés
- **Base de données** : Pool de connexions SQL Server optimisé
- **Monitoring** : Endpoint `/health` pour le monitoring

## 📝 Logs

Les logs sont automatiquement générés dans le dossier `logs/` :
- `application-YYYY-MM-DD.log` : Logs généraux
- `error-YYYY-MM-DD.log` : Logs d'erreurs uniquement
- Rotation quotidienne avec rétention de 14 jours
- Affichage console en mode développement

## 🛠️ Scripts disponibles

- `npm start` : Démarre le serveur en production
- `npm run dev` : Démarre le serveur avec watch mode (Node.js 18+)

## 📊 Monitoring

Endpoint de santé disponible sur : `GET /health`

Retourne :
```json
{
  "status": "OK",
  "timestamp": "2024-01-15T10:30:00.000Z",
  "uptime": 3600.123
}
```

## 🔒 Sécurité

- Headers de sécurité via Helmet
- CORS configuré
- Validation des entrées
- Gestion sécurisée des erreurs (pas de leak d'informations sensibles)
- Pool de connexions avec timeout configuré