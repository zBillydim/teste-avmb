FROM node:20.18.3-alpine3.21

COPY ./src /app/src
COPY ./public /app/public
COPY ./package.json /app/package.json
COPY ./postcss.config.js /app/postcss.config.js
COPY ./quasar.config.ts /app/quasar.config.ts
COPY ./eslint.config.js /app/eslint.config.js
COPY ./index.html /app/index.html
COPY ./tsconfig.json /app/tsconfig.json
COPY ./yarn.lock /app/yarn.lock
COPY ./entrypoint.sh /entrypoint.sh


WORKDIR /app

EXPOSE 9000

RUN adduser --disabled-password --no-create-home duser && \
    chown -R duser:duser /app && \
    chmod +x /entrypoint.sh


ENTRYPOINT [ "/entrypoint.sh" ]
