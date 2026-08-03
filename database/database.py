from datetime import timezone

from dotenv import load_dotenv
import os
from fastapi import Depends, HTTPException, status
from pymongo import AsyncMongoClient
from logging import info
from schemas import LoginData, HashedLogin

load_dotenv()

class DatabaseManager:
    def __init__(self):
        self.client = None
        self.db = None

    async def connect(self):
        if self.client is not None:
            return

        uri = os.getenv("MONGODB_URI")
        if not uri:
            raise RuntimeError("MONGODB_URI environment variable missing")

        self.client = AsyncMongoClient(uri, tz_aware=True)
        self.db = self.client["bank"]
        ping_response = await self.db.command("ping")

        if int(ping_response["ok"]) != 1:
            raise Exception("Problem connecting to database")
        else:
            info("Connected to database")

    def close(self):
        if self.client:
            self.client.close()
            self.client = None
            self.db = None

    async def get_collection(self, db_name: str, collection_name: str):
        return self.client[db_name][collection_name]


db_manager = DatabaseManager()

async def get_db():
    if db_manager.client is None:
        await db_manager.connect()
    return db_manager.db


async def get_user(username: str) -> HashedLogin | None:
    db = await get_db()
    user = await db["users"].find_one({"username": username})

    if user is None:
        return None

    return HashedLogin(
        username = user["username"],
        hashed_password = user["password"],
        is_admin = user["is_admin"],
        user_id = user["user_id"]
    )


