#!/usr/bin/env bash
sh -c 'cd frontend && yarn run build'
./gradlew shadowJar
heroku deploy:jar build/libs/zhlevel-all.jar -i .env -a zhlevel
