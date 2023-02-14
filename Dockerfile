# take default image of node boron i.e  node 9.x
FROM node:9.11.1

MAINTAINER christina <christinadivya.P@optisolbusiness.com>

RUN yarn global add gulp@3 gulp-cli node-gyp pm2
 

# create app directory in container
RUN mkdir -p /home/ubuntu/projects/spotted/

# set /app directory as default working directory
WORKDIR /home/ubuntu/projects/spotted/

# only copy package.json initially so that `RUN yarn` layer is recreated only
# if there are changes in package.json
ADD package.json yarn.lock /home/ubuntu/projects/spotted/

# --pure-lockfile: Don’t generate a yarn.lock lockfile
RUN yarn --pure-lockfile

# copy all file from current dir to /app in container
COPY . /home/ubuntu/projects/spotted/

# expose port 8003
EXPOSE 8003

# cmd to start service
CMD [ "yarn", "start", "serve"]
