FROM nginx:alpine

# 安装必要的工具
RUN apk add --no-cache bash curl

# 创建必要的目录
RUN mkdir -p /usr/share/nginx/pricehis && \
    chmod 777 /usr/share/nginx/pricehis

# 复制 Nginx 配置
COPY nginx.conf /etc/nginx/conf.d/default.conf

# 添加健康检查脚本
COPY healthcheck.sh /
RUN chmod +x /healthcheck.sh

HEALTHCHECK --interval=30s --timeout=3s \
    CMD /healthcheck.sh 