import logging
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi_mcp import FastApiMCP

from hippobox.core.database import dispose_db, init_db
from hippobox.core.logging_config import setup_logger
from hippobox.core.settings import SETTINGS
from hippobox.rag.embedding import Embedding
from hippobox.rag.qdrant import Qdrant
from hippobox.routers.v1 import knowledge
from hippobox.routers.v1.knowledge import OperationID

log = logging.getLogger("hippobox")

print(
    "  _    _ _                   ____            \n"
    " | |  | (_)                 |  _ \\           \n"
    " | |__| |_ _ __  _ __   ___ | |_) | _____  __\n"
    " |  __  | | '_ \\| '_ \\ / _ \\|  _ < / _ \\/\\/ /\n"
    " | |  | | | |_) | |_) | (_) | |_) | (_) >  < \n"
    " |_|  |_|_| .__/| .__/ \\___/|____/ \\___/_/\\_\\\n"
    "          | |   | |                           \n"
    "          |_|   |_|                           \n"
)


@asynccontextmanager
async def lifespan(app: FastAPI):
    setup_logger()

    app.state.SETTINGS = SETTINGS
    log.info(f"SETTINGS Loaded | ROOT_DIR={SETTINGS.ROOT_DIR}")

    await init_db()
    log.info("Database initialized")

    try:
        qdrant = Qdrant()
        app.state.QDRANT = qdrant
        log.info("Qdrant client initialized")

    except Exception as e:
        log.error(f"Qdrant initialization failed: {e}")
        raise

    try:
        embedding = Embedding()
        app.state.EMBEDDING = embedding
        log.info("Embedding client initialized")

    except Exception as e:
        log.error(f"Embedding initialization failed: {e}")
        raise

    log.info("HippoBox Server Lifespan Startup")
    try:
        yield
    finally:
        await dispose_db()
        log.info("HippoBox Server Lifespan Shutdown")


def create_app() -> FastAPI:
    app = FastAPI(
        title="HippoBox MCP Server",
        version="0.1.0",
        description="Unified FastAPI + MCP server for Knowledge Store & RAG",
        lifespan=lifespan,
    )

    app.include_router(
        knowledge.router,
        prefix="/api/v1/knowledge",
        tags=["Knowledge"],
    )

    @app.get("/ping", operation_id="ping_tool")
    async def ping():
        return {"status": "ok", "message": "pong"}

    mcp = FastApiMCP(
        app,
        include_operations=[
            "ping_tool",
            *[op.value for op in OperationID],
        ],
    )
    mcp.mount_http()
    log.info("MCP tools registered.")
    log.info("registered tools: ", mcp.tools)

    return app


app = create_app()

if __name__ == "__main__":
    import uvicorn

    uvicorn.run("app", host="0.0.0.0", port=8000, reload=True)
