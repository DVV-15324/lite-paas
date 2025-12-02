FROM node:20-alpine AS base

WORKDIR /app

COPY package.json ./

RUN corepack enable pnpm
RUN pnpm install

# SAU KHI ĐÃ CÓ .dockerignore, bạn có thể safely COPY . .
COPY . .

RUN pnpm build

FROM nginx:1.24-alpine AS prod

COPY --from=base /app/dist /usr/share/nginx/html
COPY ./nginx.conf /etc/nginx/conf.d/default.conf

# Copy chứng chỉ vào container (nếu không dùng volume mount)
COPY ./certs/bloghomnay.com.crt /etc/ssl/certs/bloghomnay.com.crt
COPY ./certs/bloghomnay.com.key /etc/ssl/certs/bloghomnay.com.key
COPY ./certs/bloghomnay.com.ca-bundle /etc/ssl/certs/bloghomnay.com.ca-bundle

EXPOSE 80
EXPOSE 443

CMD ["nginx", "-g", "daemon off;"]
