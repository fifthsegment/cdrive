FROM node:16-alpine

WORKDIR /app
# WORKDIR /server

# RUN chmod +x /opt/jboss/startup-scripts/configure-keycloak.sh


COPY package*.json ./
RUN yarn install --production

COPY . .

ENV NODE_ENV production
ENV PORT 3000
ENV MONGO_HOST mongodb
ENV MONGO_PORT 27017
ENV MONGO_DB mydrive
ENV MONGO_USER myuser
ENV MONGO_PASS mypassword
ENV S3_ENDPOINT http://minio:9000
ENV S3_ACCESS_KEY myaccesskey
ENV S3_SECRET_KEY mysecretkey
ENV S3_BUCKET mybucket
ENV OPENID_ISSUER_URL http://keycloak:8080/realms/myrealm
ENV OPENID_CLIENT_ID frontend
ENV OPENID_CLIENT_SECRET ""
ENV JWT_SECRET myjwtsecret

EXPOSE 3000

RUN ls

# RUN rm /opt/jboss/keycloak/standalone/configuration/keycloak-add-user.json
CMD (ls -la && pwd && && npm start)
