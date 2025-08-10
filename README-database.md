# Database Configuration

This document provides a quick reference for the database setup and configuration.

## Quick Start

1. **Install dependencies**:

   ```bash
   npm install
   ```

2. **Set up environment variables**:

   ```bash
   cp .env.example .env
   # Edit .env with your database credentials
   ```

3. **Set up database**:

   ```bash
   # Generate Prisma client
   npm run db:generate

   # Run migrations (requires running PostgreSQL)
   npm run db:migrate

   # Seed with sample data
   npm run db:seed
   ```

## Database Schema Overview

- **Users**: Billboard owners and advertisers with role-based access
- **Billboards**: Digital billboard listings with specifications and location data
- **Billboard Images**: Multiple images per billboard with primary image support
- **Conversations**: Message threads between users
- **Messages**: Individual messages within conversations

## Key Features

- ✅ PostgreSQL database with Prisma ORM
- ✅ Type-safe database operations
- ✅ Database migrations and seeding
- ✅ Role-based user system (OWNER/ADVERTISER)
- ✅ South African localization (ZAR currency, SA provinces)
- ✅ Comprehensive messaging system
- ✅ Image management for billboards
- ✅ Location-based data with coordinates

## Scripts

- `npm run db:migrate` - Run database migrations
- `npm run db:generate` - Generate Prisma client
- `npm run db:seed` - Seed database with sample data
- `npm run db:reset` - Reset database (⚠️ deletes all data)
- `npm run db:studio` - Open Prisma Studio GUI

For detailed setup instructions, see [docs/database-setup.md](docs/database-setup.md).
