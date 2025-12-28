FROM node:18

# Install dependencies
RUN apt-get update && \
  apt-get install -y \
  git \
  ca-certificates \
  openssl \
  openssh-client

# Install global npm packages
RUN npm install -g rollup
