FROM node:lts-alpine

COPY index.js .

CMD ["node", "index.js"]
