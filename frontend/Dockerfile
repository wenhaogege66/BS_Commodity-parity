# 构建阶段
FROM node:18 as build

# 设置工作目录
WORKDIR /app

# 复制 package.json 和 package-lock.json
COPY package*.json ./

# 安装依赖
RUN npm install

# 复制源代码
COPY . .

# 修改 API 配置（生产环境）
RUN sed -i 's|http://localhost:8000|http://121.36.199.66/api|g' src/config/api.config.ts

# 构建生产环境代码
RUN npm run build

# 生产阶段
FROM nginx:alpine

# 复制构建产物到 nginx 目录
COPY --from=build /app/build /usr/share/nginx/html

# 复制 nginx 配置
COPY nginx.conf /etc/nginx/conf.d/default.conf

# 暴露 80 端口
EXPOSE 80

# 启动 nginx
CMD ["nginx", "-g", "daemon off;"] 