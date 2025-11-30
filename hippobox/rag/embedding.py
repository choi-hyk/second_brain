from openai import OpenAI

from hippobox.core.settings import SETTINGS


class Embedding:
    def __init__(self):
        self.client = OpenAI(api_key=SETTINGS.OPENAI_API_KEY)
        self.model = SETTINGS.EMBEDDING_MODEL

    def embed(self, text: str) -> list[float]:
        response = self.client.embeddings.create(model=self.model, input=text)
        return response.data[0].embedding

    def embed_batch(self, texts: list[str]) -> list[list[float]]:
        response = self.client.embeddings.create(model=self.model, input=texts)
        return [item.embedding for item in response.data]
