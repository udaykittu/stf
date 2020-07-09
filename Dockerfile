FROM ubuntu:18.04 AS nodebase

# Install base packages
RUN export DEBIAN_FRONTEND=noninteractive && \
    apt-get update && \
    apt-get -y --no-install-recommends install curl wget libxml-bare-perl libzmq3-dev libprotobuf-dev graphicsmagick ca-certificates

# Install node
RUN export DEBIAN_FRONTEND=noninteractive && \
    curl -sL -o /tmp/install_node.sh https://deb.nodesource.com/setup_8.x && \
    /bin/bash /tmp/install_node.sh && \
    apt install --no-install-recommends -y nodejs

FROM nodebase as builder

# Install additional packages for building things
RUN export DEBIAN_FRONTEND=noninteractive && \
    apt-get -y --no-install-recommends install build-essential git yasm jq python vim

# Install node-gyp ahead of time to avoid installation on native module install
# RUN /bin/bash -c '/usr/lib/node_modules/npm/node_modules/node-gyp/bin/node-gyp.js install'

# Install just the package dependencies before copying in the full source
RUN mkdir -p /tmp/build/res/build
COPY ./package*.json /tmp/build/
RUN set -x && \
    cd /tmp/build && \
    export PATH=$PWD/node_modules/.bin:$PATH && \
    npm install --loglevel http && \
    curl -sf https://gobinaries.com/tj/node-prune | sh

# Removed this from package.json -> "prepublish": "bower install && not-in-install && gulp build || in-install"

# Install bower dependencies
WORKDIR /tmp/build
COPY ./bower.json /tmp/build/
RUN echo '{ "allow_root": true }' > /root/.bowerrc && \
    ./node_modules/.bin/bower install

# Copy the rest of the app source in
COPY . /tmp/build/

# Package and cleanup
RUN ./node_modules/.bin/gulp build && \
    npm prune --production && \
    node-prune && \
    npm pack && \
    mv devicefarmer-stf-$(jq .version package.json -j).tgz stf.tgz

FROM nodebase as runtime

EXPOSE 3000

# Setup user
RUN useradd --system --create-home --shell /usr/sbin/nologin stf
RUN mkdir -p /app && chown stf:stf /app
#USER stf

WORKDIR /app

COPY ./webpack.config.js /app/
COPY --from=builder --chown=stf:stf /tmp/build/stf.tgz /tmp/stf.tgz
COPY --from=builder --chown=stf:stf /tmp/build/node_modules /app/node_modules
COPY --from=builder --chown=stf:stf /tmp/build/res/build /app/res/build
RUN tar xf /tmp/stf.tgz --strip-components 1 -C /app && \
    chown stf:stf /app/* -R && \
    rm /tmp/stf.tgz && \
    npm prune --production
    
#USER root
#RUN apt-get -y --no-install-recommends install ncdu

# Add stf executable dir into $PATH
ENV PATH /app/bin:$PATH
    
# Show help by default.
CMD stf --help
