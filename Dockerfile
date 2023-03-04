FROM node:19 as build-console

WORKDIR /home/node/app/console
COPY ./console/package.json ./console/package-lock.json /home/node/app/console/
RUN npm ci --no-audit
COPY ./console /home/node/app/console
RUN npm run build

FROM node:19 as build-server

WORKDIR /home/node/app
COPY ./server/package.json ./server/package-lock.json /home/node/app/
RUN npm ci --no-audit
COPY ./server /home/node/app
RUN npm run compile

FROM ubuntu:20.04

RUN apt-get update && DEBIAN_FRONTEND=noninteractive apt-get install -y -o "APT::Acquire::Retries=3" \
    git \
    imagemagick \
    nodejs \
    npm \
    poppler-utils \
    tesseract-ocr-deu \
    && rm -rf /var/lib/apt/lists/*

# allow ImageMagick to process PDFs
RUN sed -i '$i\ \ <policy domain="coder" rights="read" pattern="PDF" />' /etc/ImageMagick-6/policy.xml

RUN groupadd --gid 1000 node \
  && useradd --uid 1000 --gid node -G dialout --shell /bin/bash --create-home node

WORKDIR /home/node/app
COPY ./server/package.json ./server/package-lock.json /home/node/app/
RUN npm ci --only=production --no-audit

COPY --from=build-server /home/node/app/lib /home/node/app
COPY ./server/config /home/node/app/config
COPY ./server/public /home/node/app/public
COPY --from=build-console /home/node/app/console/dist /home/node/app/ext-console

EXPOSE 3030
ENV NODE_ENV production
ENV NODE_CONFIG_ENV docker
USER node
CMD [ "node", "index.js" ]
