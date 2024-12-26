# 使用 Nginx 作为基础镜像
FROM nginx:alpine

# 复制本地构建好的文件到 Nginx 目录
COPY build/ /usr/share/nginx/html/

# 创建价格历史图片目录
RUN mkdir -p /usr/share/nginx/pricehis && \
    chmod 777 /usr/share/nginx/pricehis

# 添加健康检查
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD wget --quiet --tries=1 --spider http://localhost:80 || exit 1

# 暴露端口
EXPOSE 80

# 启动 Nginx
CMD ["nginx", "-g", "daemon off;"] 