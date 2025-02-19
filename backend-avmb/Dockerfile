FROM node:20.18.3-alpine3.21

COPY ./src /app/src
COPY ./package.json /app/package.json
COPY ./tsconfig.json /app/tsconfig.json
COPY ./yarn.lock /app/yarn.lock
COPY ./entrypoint.sh /entrypoint.sh

WORKDIR /app

EXPOSE 3000

RUN adduser --disabled-password --no-create-home duser && \
    chown -R duser:duser /app && \
    chmod +x /entrypoint.sh


ENTRYPOINT [ "/entrypoint.sh" ]
