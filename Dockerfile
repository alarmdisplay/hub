FROM node:20.19.0@sha256:a2cc2512d230a0b40f0445086f82c0e720edf34ff6520221b2c649c1f2268d0e as build-console

WORKDIR /home/node/app/console
COPY ./console/package.json ./console/package-lock.json /home/node/app/console/
RUN npm ci --no-audit
COPY ./console /home/node/app/console
RUN npm run build

FROM node:20.19.0@sha256:a2cc2512d230a0b40f0445086f82c0e720edf34ff6520221b2c649c1f2268d0e as build-server

WORKDIR /home/node/app
COPY ./server/package.json ./server/package-lock.json /home/node/app/
RUN npm ci --no-audit
COPY ./server /home/node/app
RUN npm run compile

FROM node:20.19.0-bookworm@sha256:a2cc2512d230a0b40f0445086f82c0e720edf34ff6520221b2c649c1f2268d0e

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
