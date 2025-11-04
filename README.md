# Euroasiann ERP/SaaS Platform

A production-ready multi-portal ERP and SaaS platform built with Express.js, React, MongoDB, Redis, and CASBIN RBAC.

## Architecture

- **Backend**: Express.js + TypeScript
- **Frontend**: React.js + TypeScript + Vite
- **Database**: MongoDB (with Mongoose)
- **Cache/Session**: Redis
- **RBAC**: CASBIN with MongoDB adapter
- **Authentication**: JWT with refresh tokens

## Project Structure

```
euroasiann-platform/
├── apps/
│   ├── api/              # Express.js Backend API
│   ├── tech-portal/      # React app - Tech Portal
│   ├── admin-portal/     # React app - Admin Portal
│   ├── customer-portal/  # React app - Customer Portal
│   └── vendor-portal/    # React app - Vendor Portal
├── packages/
│   ├── shared/           # Shared TypeScript types
│   ├── ui-components/   # Shared React components
│   ├── casbin-config/    # CASBIN configuration
│   └── api-client/      # API client SDK
```

## Setup

### Prerequisites

- Node.js (v18 or higher)
- MongoDB Atlas account
- Redis instance

### Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   - Copy `.env.example` to `.env`
   - Fill in MongoDB and Redis connection strings

### Running the API

```bash
cd apps/api
npm run dev
```

The API will be available at `http://localhost:3000`

## Portals

### Tech Portal
- Highest level access
- Manage admin users
- License management
- System configuration

### Admin Portal
- Manage customer/vendor organizations
- Issue licenses
- Platform administration

### Customer Portal
- RFQ Management
- Vessel Management
- Employee Management
- Business Units

### Vendor Portal
- Catalogue Management
- Inventory Management
- Quotation Management
- Item Management

## License Management

The platform includes a comprehensive license management system that:
- Validates active licenses for customer/vendor portals
- Tracks usage limits (users, vessels, items)
- Supports license issuance and revocation
- Monitors expiry dates

## CASBIN RBAC

Role-based access control with the following hierarchy:
- Tech Portal > Admin Portal > Customer/Vendor Portals
- Within Tech Portal: tech_admin > tech_manager > tech_developer > tech_support

## API Endpoints

### Authentication
- `POST /api/v1/auth/login` - Login
- `POST /api/v1/auth/refresh` - Refresh access token
- `POST /api/v1/auth/logout` - Logout
- `GET /api/v1/auth/me` - Get current user

## Development

This project uses Nx monorepo structure. Each app and package can be developed independently while sharing common code.

## License

Copyright (c) 2024 Euroasiann Group
