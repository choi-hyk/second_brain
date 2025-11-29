import logging
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi_mcp import FastApiMCP

from second_brain.core.database import dispose_db, init_db
from second_brain.core.logging_config import setup_logger
from second_brain.core.settings import SETTINGS
from second_brain.rag.embedding import Embedding
from second_brain.rag.qdrant import Qdrant
from second_brain.routers.v1 import knowledge
from second_brain.routers.v1.knowledge import OperationID

log = logging.getLogger("second_brain")

print(
    "   _____ ______ _____ ____  _   _ _____    ____  _____            _____ _   _ \n"
    "  / ____|  ____/ ____/ __ \\| \\ | |  __ \\  |  _ \\|  __ \\     /\\   |_   _| \\ | |\n"
    " | (___ | |__ | |   | |  | |  \\| | |  | | | |_) | |__) |   /  \\    | | |  \\| |\n"
    "  \\___ \\|  __|| |   | |  | | . ` | |  | | |  _ <|  _  /   / /\\ \\   | | | . ` |\n"
    "  ____) | |___| |___| |__| | |\\  | |__| | | |_) | | \\ \\  / ____ \\ _| |_| |\\  |\n"
    " |_____/|______\\_____\\____/|_| \\_|_____/  |____/|_|  \\_\\/_/    \\_\\_____|_| \\_|\n"
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

    log.info("SecondBrain Server Lifespan Startup")
    try:
        yield
    finally:
        await dispose_db()
        log.info("SecondBrain Server Lifespan Shutdown")


def create_app() -> FastAPI:
    app = FastAPI(
        title="SecondBrain MCP Server",
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
