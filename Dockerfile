FROM node:20.18.3@sha256:bcf90f85634194bc51e92f8add1221c7fdeeff94b7f1ff360aeaa7498086d641 as build-console

WORKDIR /home/node/app/console
COPY ./console/package.json ./console/package-lock.json /home/node/app/console/
RUN npm ci --no-audit
COPY ./console /home/node/app/console
RUN npm run build

FROM node:20.18.3@sha256:bcf90f85634194bc51e92f8add1221c7fdeeff94b7f1ff360aeaa7498086d641 as build-server

WORKDIR /home/node/app
COPY ./server/package.json ./server/package-lock.json /home/node/app/
RUN npm ci --no-audit
COPY ./server /home/node/app
RUN npm run compile

FROM node:20.18.3-bookworm@sha256:09b38290270d132b895814d9b54602635dbe146ed3ee65b04619922fe4ef6415

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
