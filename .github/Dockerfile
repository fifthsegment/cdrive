#FROM node:16-alpine
FROM nginx:stable-alpine

WORKDIR /usr/src/app
# WORKDIR /server

# RUN chmod +x /opt/jboss/startup-scripts/configure-keycloak.sh
COPY . .
RUN apk add --no-cache nodejs yarn

RUN ls -la
RUN cp -r server/* .
# COPY package*.json ./
RUN yarn --production
RUN yarn build
RUN ls -la
RUN yarn global add pm2


RUN cd frontend && yarn && yarn build && rm -rf node_modules && cd ..

COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 3000 80


#CMD ["yarn", "start"]
CMD ["sh", "-c", "cd /usr/src/app && pm2-runtime start yarn --interpreter bash --name my-app -- prod & nginx -g 'daemon off;'"]
