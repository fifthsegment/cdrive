FROM node:16-alpine
WORKDIR /app
RUN apk update && apk upgrade && \
    apk add --no-cache bash git openssh
#RUN apt-get update && \
#    apt-get install -y git
RUN git clone https://github.com/fifthsegment/cdrive.git .
RUN cd frontend && yarn build && cd ..
RUN cp -r server/* .
#RUN rm yarn.lock
RUN yarn
EXPOSE 3000
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
ENV MONGO_ADMIN_USER a
ENV MONGO_ADMIN_PASS b
ENV MONGO_ADMIN_DB database
CMD ["yarn", "start"]
