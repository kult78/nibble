FROM node:20-bookworm-slim

RUN apt-get update && apt-get install -y --no-install-recommends \
    git bash-completion mc nano unzip ca-certificates \
    && rm -rf /var/lib/apt/lists/*

USER node


