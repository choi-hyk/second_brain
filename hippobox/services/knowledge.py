import logging

from fastapi import Request

from hippobox.models.knowledge import KnowledgeForm, KnowledgeResponse, Knowledges, KnowledgeUpdate
from hippobox.rag.embedding import Embedding
from hippobox.rag.qdrant import Qdrant
from hippobox.utils.preprocess import preprocess_content

log = logging.getLogger("knoweldge")


class KnowledgeService:
    def __init__(self, embedding: Embedding, qdrant: Qdrant):
        self.embedding = embedding
        self.qdrant = qdrant

    # -----------------------------
    # Search
    # -----------------------------
    async def search(
        self,
        query: str,
        topic: str | None = None,
        tag: str | None = None,
        # user_id: str | None = None,
        limit: int = 1,
    ) -> list[KnowledgeResponse]:
        vector = self.embedding.embed(query)
        results = self.qdrant.search(
            "knowledge",
            vector,
            limit=limit,
        )
        ids = results.get("ids", [])
        if not ids:
            return []

        knowledges = []
        for kid in ids:
            k = await Knowledges.get(kid)
            if k is None:
                continue

            if topic and k.topic != topic:
                continue

            if tag and (tag not in k.tags):
                continue

            # if user_id and k.user_id != user_id:
            #     continue
            knowledges.append(KnowledgeResponse.model_validate(k.model_dump()))
        return knowledges

    # -----------------------------
    # Create
    # -----------------------------
    async def create_knowledge(self, form: KnowledgeForm) -> KnowledgeResponse:
        knowledge = await Knowledges.create(form)
        log.info(f"Created knowledge (id={knowledge.id})")

        if knowledge is None:
            log.exception("SQLDB save failed")
            raise

        try:
            vector = self.embedding.embed(knowledge.content)
            log.info(f"Embedding generated (id={knowledge.id})")

        except Exception as e:
            log.exception(f"Embedding generation failed (id={knowledge.id}): {e}")
            await Knowledges.delete(knowledge.id)
            raise

        items = {
            "id": knowledge.id,
            "vector": vector,
            "text": preprocess_content(knowledge),
            "metadata": {
                # "user_id": knowledge.user_id,
                "topic": knowledge.topic,
                "tags": knowledge.tags,
                "title": knowledge.title,
                "created_at": str(knowledge.created_at),
            },
        }

        try:
            self.qdrant.upsert("knowledge", [items])
            log.info(f"Qdrant upsert completed (id={knowledge.id})")
        except Exception as e:
            log.exception(f"Qdrant upsert failed (id={knowledge.id}): {e}")
            await Knowledges.delete(knowledge.id)
            raise

        return KnowledgeResponse.model_validate(knowledge.model_dump())

    # -----------------------------
    # Get
    # -----------------------------
    async def get_knowledge(self, knowledge_id: str) -> KnowledgeResponse:
        knowledge = await Knowledges.get(knowledge_id)
        log.info(f"Get knowledge (id={knowledge.id})")
        if knowledge is None:
            log.warning(f"Knowledge not found (id={knowledge_id})")
            return None

        return KnowledgeResponse.model_validate(knowledge.model_dump())

    async def get_knowledge_list(self) -> list[KnowledgeResponse]:
        knowledges = await Knowledges.get_list()
        log.info("Get knowledges list")

        return [KnowledgeResponse.model_validate(k.model_dump()) for k in knowledges]

    async def get_by_topic(self, topic: str) -> list[KnowledgeResponse] | None:
        knowledges = await Knowledges.get_by_topic(topic)
        log.info(f"Fetched knowledge by topic='{topic}'")

        return [KnowledgeResponse.model_validate(k.model_dump()) for k in knowledges]

    async def get_by_tag(self, tag: str) -> list[KnowledgeResponse] | None:
        knowledges = await Knowledges.get_by_tag(tag)
        log.info(f"Fetched knowledge by tag='{tag}'")

        return [KnowledgeResponse.model_validate(k.model_dump()) for k in knowledges]

    async def get_by_title(self, title: str) -> KnowledgeResponse | None:
        knowledge = await Knowledges.get_by_title(title)
        log.info(f"Fetched knowledge by title='{title}' (id={knowledge.id})")
        if knowledge is None:
            log.warning(f"Knowledge not found (id={knowledge.id})")
            return None

        return KnowledgeResponse.model_validate(knowledge.model_dump())

    # -----------------------------
    # Update
    # -----------------------------
    async def update_knowledge(self, knowledge_id: int, form: KnowledgeUpdate) -> KnowledgeResponse:
        log.info(f"Updating knowledge: id={knowledge_id}")
        backup = await Knowledges.get(knowledge_id)
        knowledge = await Knowledges.update(knowledge_id, form)

        backup_form = KnowledgeUpdate(
            topic=backup.topic,
            tags=backup.tags,
            title=backup.title,
            content=backup.content,
        )

        if knowledge is None:
            log.exception(f"Failed to update SQL knowledge (id={knowledge_id})")
            raise

        try:
            vector = self.embedding.embed(knowledge.content)
            log.info(f"Embedding regenerated for update (id={knowledge.id})")
        except Exception as e:
            log.exception(f"Embedding regeneration failed (id={knowledge.id}): {e}")
            await Knowledges.update(knowledge_id, backup_form)
            raise

        items = {
            "id": knowledge.id,
            "vector": vector,
            "text": preprocess_content(knowledge),
            "metadata": {
                # "user_id": knowledge.user_id,
                "topic": knowledge.topic,
                "tags": knowledge.tags,
                "title": knowledge.title,
                "created_at": str(knowledge.created_at),
            },
        }

        try:
            self.qdrant.upsert("knowledge", [items])
            log.info(f"Qdrant upsert completed (update) (id={knowledge.id})")
        except Exception as e:
            log.exception(f"Qdrant update failed (id={knowledge.id}): {e}")
            await Knowledges.update(knowledge_id, backup_form)
            raise

        return KnowledgeResponse.model_validate(knowledge.model_dump())

    # -----------------------------
    # Delete
    # -----------------------------
    async def delete_knowledge(self, knowledge_id: int) -> bool:
        log.info(f"Deleting knowledge: id={knowledge_id}")
        backup = await Knowledges.get(knowledge_id)
        success = await Knowledges.delete(knowledge_id)
        if not success:
            log.exception(f"Failed to delete SQL knowledge (id={knowledge_id})")
            raise

        try:
            self.qdrant.delete("knowledge", [knowledge_id])
            log.info(f"Qdrant delete completed (id={knowledge_id})")
        except Exception as e:
            log.exception(f"Qdrant delete failed (id={knowledge_id}): {e}")
            restored = await Knowledges.restore(backup)
            if restored is None:
                log.error(f"Rollback failed! SQL restore error (id={knowledge_id})")
            raise

        return True


def get_knowledge_service(request: Request) -> KnowledgeService:
    embedding = request.app.state.EMBEDDING
    qdrant = request.app.state.QDRANT
    return KnowledgeService(embedding, qdrant)
