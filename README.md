# API REST Backend — Gestion de Projets & Tâches

![CI/CD](https://github.com/your-org/api-rest-backend/actions/workflows/ci.yml/badge.svg)
![Coverage](https://codecov.io/gh/your-org/api-rest-backend/badge.svg)

API REST production-ready pour la gestion de projets et tâches.  
**Cible : 2 000 utilisateurs actifs | Node.js 18 · MySQL 8 · Redis 7 · Docker**

---

## Prérequis

| Outil | Version minimale |
|-------|-----------------|
| Node.js | 18.x LTS |
| MySQL | 8.0 |
| Redis | 7.x |
| Docker | 24.x |
| Docker Compose | 2.x |

---

## Installation locale (sans Docker)

```bash
# 1. Cloner le projet
git clone https://github.com/your-org/api-rest-backend.git
cd api-rest-backend

# 2. Installer les dépendances
npm install

# 3. Configurer les variables d'environnement
cp .env.example .env
# Éditer .env avec vos valeurs

# 4. Appliquer les migrations
npm run migrate

# 5. Injecter les données de démo
npm run seed

# 6. Démarrer en développement
npm run dev
```

---

## Variables d'environnement

Copier `.env.example` en `.env` et remplir toutes les valeurs.

```env
NODE_ENV=development
PORT=3000

# MySQL
DB_HOST=localhost
DB_PORT=3306
DB_NAME=api_backend
DB_USER=root
DB_PASSWORD=your_password

# Redis
REDIS_URL=redis://localhost:6379

# JWT (utiliser des clés RS256 en production)
JWT_SECRET=your-dev-secret-min-32-chars
JWT_ACCESS_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d

# Cookies
COOKIE_SECRET=your-cookie-secret-min-32-chars

# Firebase (optionnel)
FCM_SERVICE_ACCOUNT_KEY=base64-encoded-json

# CORS
CORS_ORIGINS=http://localhost:3000,http://localhost:5173
```

> ⚠️ En production, `JWT_PRIVATE_KEY` et `JWT_PUBLIC_KEY` (RS256) remplacent `JWT_SECRET`.

---

## Commandes disponibles

```bash
npm run dev           # Démarrage en mode développement (nodemon)
npm start             # Démarrage en production
npm run lint          # Vérification ESLint
npm run lint:fix      # Correction automatique ESLint
npm test              # Tous les tests
npm run test:unit     # Tests unitaires uniquement
npm run test:integration  # Tests d'intégration uniquement
npm run test:ci       # Tests + couverture (utilisé en CI)
npm run migrate       # Appliquer les migrations
npm run migrate:undo  # Annuler la dernière migration
npm run seed          # Injecter les données de démo
npm run db:reset      # Réinitialiser complètement la base
```

---

## Déploiement avec Docker

```bash
# 1. Configurer les variables dans .env
cp .env.example .env

# 2. Build et démarrage
docker-compose up -d --build

# 3. Appliquer les migrations
docker-compose exec app npm run migrate

# 4. Vérifier la santé
curl http://localhost:3000/api/v1/health
```

---

## Architecture

```
src/
├── config/       # DB, Redis, CORS, Rate Limit, Logger
├── models/       # Modèles Sequelize (User, Project, Task, Token, AuditLog)
├── routes/       # Définition des endpoints Express
├── controllers/  # Traitement HTTP (req/res)
├── services/     # Logique métier
├── middlewares/  # Auth, Validation, Erreurs
├── utils/        # JWT, Hash, Response, Constants
└── workers/      # FCM Worker (notifications asynchrones)
```

**Règle d'or** : `routes → controllers → services → models`. Aucun saut de couche autorisé.

---

## Comptes de démo (après seed)

| Rôle | Email | Mot de passe |
|------|-------|-------------|
| Admin | admin@example.com | Admin@1234 |
| Manager | manager@example.com | Manager@1234 |
| Member | member@example.com | Member@1234 |

---

## Documentation API

La spécification OpenAPI 3.0 est disponible dans `docs/openapi.yaml`.

```bash
# Visualiser avec swagger-ui-express (si installé)
npx swagger-ui-watcher docs/openapi.yaml
```

---

## Standards qualité

- ESLint strict — zéro warning toléré
- Couverture tests ≥ 80% (services + controllers)
- Temps de réponse P95 < 300ms
- Aucune donnée sensible dans les logs
- Pipeline CI/CD bloquant avant merge sur main
- 