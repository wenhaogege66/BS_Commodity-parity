# 使用 Nginx 作为基础镜像
FROM nginx:alpine

# 复制本地构建好的文件到 Nginx 目录
COPY build/ /usr/share/nginx/html/

# 复制 Nginx 配置
COPY frontend.conf /etc/nginx/conf.d/default.conf

# 创建价格历史图片目录
RUN mkdir -p /usr/share/nginx/pricehis && \
    chmod 777 /usr/share/nginx/pricehis

# 确保 Nginx 可以访问静态文件
RUN chmod -R 755 /usr/share/nginx/html

# 添加健康检查
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD wget --quiet --tries=1 --spider http://localhost:80 || exit 1

# 暴露端口
EXPOSE 80

# 启动 Nginx
CMD ["nginx", "-g", "daemon off;"] 