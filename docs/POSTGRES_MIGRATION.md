# PostgreSQL Production Migration Guide

Waste2Worth AI is developed with SQLite for zero-configuration local execution, but uses SQLAlchemy 2.0 ORM designed for seamless migration to enterprise PostgreSQL in production.

---

## 1. Prerequisites for PostgreSQL Deployment

1. Provision a PostgreSQL 15+ instance (e.g. AWS RDS, Google Cloud SQL, or local Docker container):
   ```bash
   docker run --name waste2worth-postgres \
     -e POSTGRES_USER=waste_admin \
     -e POSTGRES_PASSWORD=SecurePostgresPassword2026! \
     -e POSTGRES_DB=waste2worth_db \
     -p 5432:5432 -d postgres:16-alpine
   ```

2. Install the PostgreSQL driver in the backend virtual environment:
   ```bash
   pip install psycopg2-binary
   ```

---

## 2. Configuration Update

Update your `.env` file with the PostgreSQL connection string:

```ini
DATABASE_URL="postgresql://waste_admin:SecurePostgresPassword2026!@localhost:5432/waste2worth_db"
```

In `backend/app/db/session.py`, connection pooling settings automatically adapt:
```python
if settings.DATABASE_URL.startswith("postgresql"):
    engine = create_engine(
        settings.DATABASE_URL,
        pool_size=20,
        max_overflow=10,
        pool_pre_ping=True
    )
```

---

## 3. Schema Creation & Initial Data Seeding

Execute the initialization script against PostgreSQL:

```bash
# Set PYTHONPATH and execute database seeder
$env:PYTHONPATH="."
python backend/app/db/seed_db.py
```

The script will automatically execute `Base.metadata.create_all(bind=engine)`, creating all foreign keys, indexes, and tables, and importing the initial synthetic starter kit datasets into PostgreSQL.
