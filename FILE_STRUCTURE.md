# File Structure

```
campus-issue-reporter/
├── backend/
│   ├── config/
│   ├── controllers/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   ├── services/
│   ├── server.js
│   ├── package.json
│   └── package-lock.json
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   │   ├── auth/
│   │   │   ├── common/
│   │   │   ├── dashboard/
│   │   │   └── reports/
│   │   ├── context/
│   │   ├── services/
│   │   ├── App.js
│   │   ├── App.css
│   │   ├── index.js
│   │   └── index.css
│   ├── package.json
│   └── package-lock.json
├── node_modules/
├── package.json
├── package-lock.json
└── README.md
```

## Directory Overview

- **backend/**: Express API with controllers, models, middleware, and route definitions.
- **backend/config/**: Database and Firebase configuration modules.
- **backend/controllers/**: Request handlers for authentication, reports, and users.
- **backend/middleware/**: Authentication and file upload middleware.
- **backend/models/**: Mongoose schemas for users, reports, and fake report tracking.
- **backend/routes/**: REST endpoints grouped by feature domain.
- **backend/services/**: Reusable service layers (email integration placeholder).
- **frontend/**: React client application.
- **frontend/public/**: Static assets and HTML template used at build time.
- **frontend/src/components/**: UI components organised by feature (auth, common layout, dashboards, reports).
- **frontend/src/context/**: React context for authentication state management.
- **frontend/src/services/**: Client-side API helpers and Firebase configuration.
- **frontend/src/App.js**: Application entry point defining routes.
- **frontend/src/index.js**: React DOM bootstrap file.
- **README.md**: Project setup and usage instructions.
