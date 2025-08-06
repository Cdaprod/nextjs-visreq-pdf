FROM node:20-bullseye

# Install docker CLI and chromium for puppeteer
RUN apt-get update \
    && apt-get install -y --no-install-recommends docker.io chromium \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /action

COPY package.json ./
RUN npm install --omit=dev --no-save

COPY scripts ./scripts
COPY entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

ENTRYPOINT ["/entrypoint.sh"]
