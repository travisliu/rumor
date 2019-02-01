FROM node:10.15.0-alpine 

ENV LC_ALL C.UTF-8
ENV PORT 3030
ENV APP_HOME /usr/src/app
RUN mkdir -p $APP_HOME

RUN cd $APP_HOME
WORKDIR $APP_HOME

ADD . $APP_HOME

ENV NODE_ENV production

cmd ["node", "index.js"]

EXPOSE 3030
