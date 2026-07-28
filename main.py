from fastapi import FastAPI
from routers import accounts

api_version = "1.0"

app = FastAPI()

app.include_router(accounts.api_router)

# for route in api_router.routes:
#     print(route.path, route.methods)