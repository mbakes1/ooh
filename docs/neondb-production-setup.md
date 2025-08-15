# NeonDB Production Setup Guide

## Prerequisites

1. Create a NeonDB account at https://neon.tech
2. Create a new project for your billboard marketplace

## Step 1: Get Your NeonDB Connection String

1. In your NeonDB dashboard, go to your project
2. Navigate to "Connection Details"
3. Copy the connection string (it should look like):
   ```
   postgresql://username:password@ep-xxxxx-xxxxx.region.aws.neon.tech/database_name?sslmode=require
   ```

## Step 2: Update Environment Variables

Update your `.env` file with:

```bash
# Replace with your actual NeonDB connection string
DATABASE_URL="postgresql://username:password@ep-xxxxx-xxxxx.region.aws.neon.tech/billboard_marketplace?sslmode=require"
DIRECT_URL="postgresql://username:password@ep-xxxxx-xxxxx.region.aws.neon.tech/billboard_marketplace?sslmode=require"
```

## Step 3: Deploy Database Schema

Run these commands to set up your production database:

```bash
# Generate Prisma client
npm run db:generate

# Deploy migrations to production
npm run db:migrate:prod

# Optional: Seed the database with initial data
npm run db:seed
```

## Step 4: Vercel Deployment

Add these environment variables to your Vercel project:

1. Go to your Vercel dashboard
2. Select your project
3. Go to Settings > Environment Variables
4. Add:
   - `DATABASE_URL`: Your NeonDB connection string
   - `DIRECT_URL`: Same as DATABASE_URL (for connection pooling)
   - All other existing environment variables

## Step 5: Build Configuration

The following optimizations have been added for NeonDB:

- **Binary Targets**: Added `rhel-openssl-1.0.x` for Vercel compatibility
- **Direct URL**: Configured for connection pooling optimization
- **SSL Mode**: Required for secure connections

## Production Scripts

- `npm run db:migrate:prod` - Deploy migrations to production
- `npm run db:push` - Push schema changes without migrations (use carefully)
- `npm run db:generate` - Generate Prisma client

## Connection Pooling

NeonDB automatically handles connection pooling. The `DIRECT_URL` is used for migrations and introspection, while `DATABASE_URL` is used for queries.

## Monitoring

- Monitor your database usage in the NeonDB dashboard
- Set up alerts for connection limits and storage usage
- Consider upgrading to a paid plan for production workloads

## Backup Strategy

NeonDB provides automatic backups. For additional safety:

1. Enable point-in-time recovery in your NeonDB settings
2. Consider periodic manual backups for critical data
3. Test your backup restoration process

## Security Considerations

- NeonDB connections are encrypted by default
- Use environment variables for all sensitive data
- Regularly rotate database passwords
- Monitor access logs in NeonDB dashboard
