# Database Setup Guide

This guide explains how to set up the PostgreSQL database for the Digital Billboard Marketplace.

## Prerequisites

- PostgreSQL 14+ installed and running
- Node.js 18+ installed
- npm or yarn package manager

## Quick Setup

1. **Install PostgreSQL** (if not already installed):

   ```bash
   # macOS with Homebrew
   brew install postgresql
   brew services start postgresql

   # Ubuntu/Debian
   sudo apt update
   sudo apt install postgresql postgresql-contrib
   sudo systemctl start postgresql

   # Windows
   # Download and install from https://www.postgresql.org/download/windows/
   ```

2. **Create Database**:

   ```bash
   # Connect to PostgreSQL as superuser
   psql -U postgres

   # Create database and user
   CREATE DATABASE billboard_marketplace;
   CREATE USER billboard_user WITH PASSWORD 'your_secure_password';
   GRANT ALL PRIVILEGES ON DATABASE billboard_marketplace TO billboard_user;
   \q
   ```

3. **Configure Environment Variables**:

   ```bash
   # Copy the example environment file
   cp .env.example .env

   # Update the DATABASE_URL in .env file
   DATABASE_URL="postgresql://billboard_user:your_secure_password@localhost:5432/billboard_marketplace"
   ```

4. **Run Database Migrations**:

   ```bash
   # Generate Prisma client
   npm run db:generate

   # Run migrations to create tables
   npm run db:migrate

   # Seed the database with sample data
   npm run db:seed
   ```

## Database Schema

The database includes the following main tables:

### Users

- Stores billboard owners and advertisers
- Includes authentication and profile information
- Role-based access (OWNER/ADVERTISER)

### Billboards

- Digital billboard listings with specifications
- Location data with coordinates
- Pricing and availability information
- Status management (ACTIVE/INACTIVE/PENDING)

### Billboard Images

- Multiple images per billboard
- Primary image designation
- Alt text for accessibility

### Conversations & Messages

- Secure messaging between users
- Conversation threads linked to billboards
- Message read status tracking

## Available Scripts

```bash
# Database operations
npm run db:migrate     # Run pending migrations
npm run db:generate    # Generate Prisma client
npm run db:seed        # Seed database with sample data
npm run db:reset       # Reset database (WARNING: deletes all data)
npm run db:studio      # Open Prisma Studio (database GUI)
```

## Sample Data

The seed script creates:

- 2 billboard owners and 2 advertisers
- 3 sample billboards in different South African cities
- Sample images for billboards
- Example conversations and messages

### Sample Login Credentials

**Billboard Owners:**

- Email: `owner1@example.com` | Password: `password123`
- Email: `owner2@example.com` | Password: `password123`

**Advertisers:**

- Email: `advertiser1@example.com` | Password: `password123`
- Email: `advertiser2@example.com` | Password: `password123`

## Troubleshooting

### Connection Issues

- Ensure PostgreSQL is running: `brew services list | grep postgresql`
- Check if the database exists: `psql -U postgres -l`
- Verify connection string in `.env` file

### Migration Issues

- Reset database if needed: `npm run db:reset`
- Check Prisma schema syntax: `npx prisma validate`
- View migration status: `npx prisma migrate status`

### Performance

- The database includes indexes on frequently queried fields
- Consider connection pooling for production deployments
- Monitor query performance with Prisma's logging

## Production Considerations

1. **Security**:
   - Use strong passwords and secure connection strings
   - Enable SSL connections in production
   - Regularly update dependencies

2. **Backup**:
   - Set up automated database backups
   - Test backup restoration procedures
   - Consider point-in-time recovery

3. **Monitoring**:
   - Monitor database performance and connections
   - Set up alerts for connection issues
   - Track slow queries and optimize as needed

4. **Scaling**:
   - Consider read replicas for high-traffic scenarios
   - Implement connection pooling (PgBouncer)
   - Monitor and optimize database queries
