# First-Time Setup Instructions

## 1. Start PostgreSQL Database

If you're using Docker:
```
docker run --name shelfware-db -e POSTGRES_USER=postgress -e POSTGRES_PASSWORD=pxlpxlpxl -e POSTGRES_DB=shelfware -p 5432:5432 -d postgres:15-alpine
```

## 2. Initialize the Database

Run the database initialization script which will:
- Create required tables (run Prisma migrations)
- Add the initial Shelfware Tracker project

```
cd backend
npm run init-db
```

## 3. Start the Backend

```
cd backend
npm run dev
```
