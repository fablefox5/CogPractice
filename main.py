from fastapi import FastAPI
from routers import accounts, users
from database.database import db_manager
from contextlib import asynccontextmanager
from fastapi.middleware.cors import CORSMiddleware

# Automatically has database on for lifespan of program, automatic shutdown and start
@asynccontextmanager
async def lifespan(app_instance: FastAPI):
    await db_manager.connect()
    await db_manager.db["accounts"].create_index("account_id", unique=True)
    yield
    await db_manager.client.close()

app: FastAPI = FastAPI(lifespan=lifespan)

origins = [
    "http://localhost:5173",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"]
)
app.include_router(accounts.api_router)
app.include_router(users.api_router)

# for route in api_router.routes:
#     print(route.path, route.methods)