FROM node:12.18.2

# Create app directory
WORKDIR /usr/src/app

# Install app dependencies
COPY package*.json ./

RUN npm install
# If you are building your code for production
# RUN npm ci --only=production

# Bundle app source
COPY . .
COPY .env ./
COPY servicevirtualizationdata /usr/service-virtualization-data/servicevirtualizationdata
COPY static /usr/service-virtualization-ui/static

RUN /bin/bash -l -c "ls -la"

RUN groupadd --gid 2000 appusergroup  && useradd --uid 2000 --gid appusergroup --shell /bin/bash --create-home appuser
RUN chown -R appuser:appusergroup /usr/service-virtualization-data/servicevirtualizationdata
RUN chmod -R 755 /usr/service-virtualization-data/servicevirtualizationdata
RUN chown -R appuser:appusergroup /usr/service-virtualization-ui/static
RUN chmod -R 755 /usr/service-virtualization-ui/static

USER appuser

EXPOSE 8080

CMD [ "node", "index.js" ]