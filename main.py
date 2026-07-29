from fastapi import FastAPI
from routers import accounts
from database.database import db_manager
from contextlib import asynccontextmanager

# Automatically has database on for lifespan of program, automatic shutdown and start
@asynccontextmanager
async def lifespan(app_instance: FastAPI):
    await db_manager.connect()
    await db_manager.db["accounts"].create_index("account_id", unique=True)
    yield
    await db_manager.client.close()

app: FastAPI = FastAPI(lifespan=lifespan)

app.include_router(accounts.api_router)

# for route in api_router.routes:
#     print(route.path, route.methods)