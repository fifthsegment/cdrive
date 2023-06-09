FROM node:16-alpine

WORKDIR /usr/src/app
# WORKDIR /server

# RUN chmod +x /opt/jboss/startup-scripts/configure-keycloak.sh
COPY . .
RUN cp -r server/* .
# COPY package*.json ./
RUN yarn --production
RUN yarn build


EXPOSE 3000

# RUN rm /opt/jboss/keycloak/standalone/configuration/keycloak-add-user.json

CMD ["yarn", "prod"]