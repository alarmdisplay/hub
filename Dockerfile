FROM node:20.17.0@sha256:db5dd2f30cb82a8bdbd16acd4a8f3f2789f5b24f6ce43f98aa041be848c82e45 as build-console

WORKDIR /home/node/app/console
COPY ./console/package.json ./console/package-lock.json /home/node/app/console/
RUN npm ci --no-audit
COPY ./console /home/node/app/console
RUN npm run build

FROM node:20.17.0@sha256:db5dd2f30cb82a8bdbd16acd4a8f3f2789f5b24f6ce43f98aa041be848c82e45 as build-server

WORKDIR /home/node/app
COPY ./server/package.json ./server/package-lock.json /home/node/app/
RUN npm ci --no-audit
COPY ./server /home/node/app
RUN npm run compile

FROM node:20.17.0-bookworm@sha256:db5dd2f30cb82a8bdbd16acd4a8f3f2789f5b24f6ce43f98aa041be848c82e45

RUN apt-get update && DEBIAN_FRONTEND=noninteractive apt-get install -y -o "APT::Acquire::Retries=3" \
    git \
    imagemagick \
    poppler-utils \
    tesseract-ocr-deu \
    && rm -rf /var/lib/apt/lists/*

# allow ImageMagick to process PDFs
RUN sed -i '$i\ \ <policy domain="coder" rights="read" pattern="PDF" />' /etc/ImageMagick-6/policy.xml

RUN adduser node dialout

WORKDIR /home/node/app
COPY ./server/package.json ./server/package-lock.json /home/node/app/
RUN npm ci --omit=dev --no-audit

COPY --from=build-server /home/node/app/lib /home/node/app
COPY ./server/config /home/node/app/config
COPY ./server/public /home/node/app/public
COPY --from=build-console /home/node/app/console/dist /home/node/app/ext-console

EXPOSE 3030
ENV NODE_ENV production
ENV NODE_CONFIG_ENV docker
USER node
CMD [ "node", "index.js" ]
