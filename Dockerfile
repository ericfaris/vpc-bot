# syntax docker/dockerfile:1

FROM node:14.17.2

WORKDIR /app

RUN mkdir -p /app/data

COPY ["package.json", "package-lock.json*", "./"]

RUN npm install

COPY . .

ARG APPLICATION_ID
ARG BOT_TOKEN
ARG COMMANDS_DIR
ARG COMPETITION_CHANNEL_ID
ARG COMPETITION_CHANNEL_NAME
ARG COMPETITION_POST_ID
ARG DISCORD_BASE_API
ARG GUILD_ID
ARG SECONDS_TO_DELETE_MESSAGE

ENV APPLICATION_ID $APPLICATION_ID
ENV BOT_TOKEN $BOT_TOKEN
ENV COMMANDS_DIR $COMMANDS_DIR
ENV COMPETITION_CHANNEL_ID $COMPETITION_CHANNEL_ID
ENV COMPETITION_CHANNEL_NAME $COMPETITION_CHANNEL_NAME
ENV COMPETITION_POST_ID $COMPETITION_POST_ID
ENV DISCORD_BASE_API $DISCORD_BASE_API
ENV GUILD_ID $GUILD_ID
ENV SECONDS_TO_DELETE_MESSAGE $SECONDS_TO_DELETE_MESSAGE

CMD [ "node", "index.js" ]