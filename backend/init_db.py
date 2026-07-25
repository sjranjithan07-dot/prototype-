import asyncio
from database import engine, Base
import models # imports the models to register them with Base

async def init_db():
    print("Initializing the database tables from scratch...")
    async with engine.begin() as conn:
        # Drop all tables first to start completely fresh
        await conn.run_sync(Base.metadata.drop_all)
        # Create all tables
        await conn.run_sync(Base.metadata.create_all)
    print("Database tables created successfully!")

if __name__ == "__main__":
    asyncio.run(init_db())
