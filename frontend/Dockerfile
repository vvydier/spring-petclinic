FROM node:8

ENV NODE_ENV=production

RUN mkdir /usr/src/petclinic-frontend
ENV PATH /usr/src/petclinic-frontend/client/node_modules/.bin:$PATH
COPY client /usr/src/petclinic-frontend/client
WORKDIR /usr/src/petclinic-frontend/client
RUN npm i npm@latest -g
RUN npm install
RUN npm run build:prod

COPY server /usr/src/petclinic-frontend/server
WORKDIR /usr/src/petclinic-frontend/server
ENV PATH /usr/src/petclinic-frontend/server/node_modules/.bin:$PATH
RUN npm install
RUN cp /usr/src/petclinic-frontend/client/dist/* /usr/src/petclinic-frontend/server/public/

ENV NODE_ENV production
EXPOSE 3000
CMD ["npm","start"]
