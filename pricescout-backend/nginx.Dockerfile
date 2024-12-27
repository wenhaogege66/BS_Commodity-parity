FROM nginx:latest

# 复制自定义的nginx配置
COPY nginx.conf /etc/nginx/conf.d/default.conf

# 创建目录用于存储价格历史图片
RUN mkdir -p /usr/share/nginx/pricehis && \
    chmod 777 /usr/share/nginx/pricehis 