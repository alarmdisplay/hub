FROM ubuntu:20.04 as prebuilder

ENV DEBIAN_FRONTEND noninteractive

RUN apt-get update && apt-get install -y \
    git \
    imagemagick \
    nodejs \
    npm \
    tesseract-ocr-deu \
    && rm -rf /var/lib/apt/lists/*

# allow ImageMagick to process PDFs
RUN sed -i '$i\ \ <policy domain="coder" rights="read" pattern="PDF" />' /etc/ImageMagick-6/policy.xml

FROM prebuilder as build-console

COPY ./console /usr/local/hub/console
WORKDIR /usr/local/hub/console
RUN npm install --no-audit && npm run build

FROM prebuilder as build-server

COPY ./server /home/node/app
WORKDIR /home/node/app

RUN npm install --no-audit && npm run compile

FROM prebuilder

RUN groupadd --gid 1000 node \
  && useradd --uid 1000 --gid node --shell /bin/bash --create-home node

COPY --from=build-server /home/node/app/lib /home/node/app
COPY ./server/config /home/node/app/config
COPY ./server/public /home/node/app/public
COPY ./server/package*.json /home/node/app/
COPY --from=build-console /usr/local/hub/console/dist /home/node/app/ext-console

WORKDIR /home/node/app
RUN npm install --only=production --no-audit && mkdir -m777 uploads

EXPOSE 3030
ENV NODE_ENV production
ENV NODE_CONFIG_ENV docker
USER node
CMD [ "node", "index.js" ]
