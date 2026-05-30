# Build stage
FROM node:22-alpine AS build
WORKDIR /app

ENV HOST=0.0.0.0
ENV PORT=3000

COPY package*.json ./
RUN npm ci

COPY . .
ARG VITE_API_URL=http://localhost:8081/api
ENV VITE_API_URL=${VITE_API_URL}
RUN npm run build

# Runtime stage
FROM node:22-alpine AS runtime
WORKDIR /app

ENV NODE_ENV=production
ENV HOST=0.0.0.0
ENV PORT=3000

COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/package.json ./package.json
COPY --from=build /app/dist ./dist
COPY --from=build /app/instrument.server.mjs ./instrument.server.mjs
COPY --from=build /app/server.node.mjs ./server.node.mjs

EXPOSE 3000
CMD ["npm", "start"]
