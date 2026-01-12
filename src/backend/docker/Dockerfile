# 1st stage: Frontend build (Node.js)
FROM node:20-slim AS frontend-builder
WORKDIR /frontend
COPY src/frontend/package*.json ./
RUN npm install
COPY src/frontend/ ./
RUN npm run build

# 2nd stage: Backend build (Python)
FROM python:3.13-slim AS backend-builder
WORKDIR /build
RUN pip install --no-cache-dir hatch

COPY src/backend/pyproject.toml ./
COPY src/backend/README.md ./README.md
COPY src/backend/hippobox/ ./hippobox/

RUN hatch build -t wheel

# 3rd stage: Final execution stage
FROM python:3.13-slim
WORKDIR /app

COPY --from=backend-builder /build/dist/*.whl ./
RUN pip install --no-cache-dir *.whl && rm *.whl

COPY --from=frontend-builder /frontend/dist/ /tmp/frontend-dist/
RUN python - <<'PY'
import shutil
from pathlib import Path
import site

dist_src = Path("/tmp/frontend-dist")
site_packages = Path(site.getsitepackages()[0])
dist_dest = site_packages / "dist"

if dist_dest.exists():
    shutil.rmtree(dist_dest)
shutil.copytree(dist_src, dist_dest)
PY
RUN rm -rf /tmp/frontend-dist

ENV PYTHONUNBUFFERED=1
EXPOSE 8000
CMD ["uvicorn", "hippobox.server:app", "--host", "0.0.0.0", "--port", "8000"]
