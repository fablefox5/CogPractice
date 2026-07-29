from dotenv import load_dotenv
import os
from pymongo import AsyncMongoClient
from logging import info

load_dotenv()

class DatabaseManager:
    def __init__(self):
        self.client = None
        self.db = None

    async def connect(self):
        self.client = AsyncMongoClient(os.getenv("MONGODB_URI"))
        self.db = self.client["bank"]
        ping_response = await self.db.command("ping")

        if int(ping_response["ok"]) != 1:
            raise Exception("Problem connecting to database")
        else:
            info("Connected to database")

    async def close(self):
        if self.client:
            await self.client.close()
            self.client = None
            self.db = None

    async def get_collection(self, db_name: str, collection_name: str):
        return self.client[db_name][collection_name]


db_manager = DatabaseManager()

def get_db():
    if db_manager.client is None:
        raise RuntimeError("Database client is not initialized.")
    return db_manager.db