# Copilot Instructions for Employee Management System

## Architecture Overview
- **Frontend**: Vue.js (MVVM) in `src/` (components, views, models, viewmodels, services, store, router, assets)
- **Backend**: Node.js + Express (MVC) in `backend/` (controllers, models, routes, middlewares, config, app.js)
- **Database**: MySQL, schema/setup in root SQL files
- **API**: RESTful endpoints under `/api` (see backend/routes and controllers)
- **Authentication**: JWT-based, see backend middlewares and login/logout endpoints
- **File Uploads**: Handled by Multer in backend

## Key Developer Workflows
- **Frontend dev server**: `npm run serve` (in root or `src/`)
- **Frontend build**: `npm run build`
- **Backend dev server**: `cd backend && npm run dev`
- **Backend production**: `cd backend && npm start`
- **Install dependencies**: `npm install` (run in both root and backend if needed)
- **Database setup**: Import `database_schema.sql` into MySQL, configure `.env` in backend
- **Testing DB connection**: `npm run test-db` (if available)
- **Linting**: `npm run lint`

## Project-Specific Conventions
- **MVVM (frontend)**: Use `src/models/` for data, `src/viewmodels/` for logic/state, `src/views/` and `src/components/` for UI
- **MVC (backend)**: Use `backend/models/` for DB, `backend/controllers/` for logic, `backend/routes/` for endpoints
- **API Service Layer**: All frontend API calls go through `src/services/EmployeeApiService.js`
- **Vuex Store**: State modules in `src/store/modules/`
- **Router**: SPA routes in `src/router/index.js`
- **CSS**: Modular, feature-based structure in `src/assets/css/` (see README in that folder)
- **Environment**: Use `.env` files for both frontend and backend config

## Integration & Cross-Component Patterns
- **Frontend-backend communication**: All via REST API, base URL set in `.env`
- **Auth**: JWT token stored client-side, sent via Authorization header
- **File uploads**: POST to `/api/upload-image`
- **Database**: MySQL, tables for employees, educations, certificates, careers, projects

## Examples
- Add a new employee: POST `/api/employees` (see backend/controllers/EmployeeController.js)
- Update employee info: PUT `/api/employees/:id`
- Use Vuex: see `src/store/modules/employee.js`
- Add a new frontend view: create in `src/views/`, register in router
- Add a new backend route: define in `backend/routes/`, implement in controller

## References
- See `README.md` in root and `employee-management/` for more details
- See `src/assets/css/README.md` for CSS structure and conventions

---
If you are unsure about a workflow or pattern, check the relevant README or look for examples in the referenced directories.
