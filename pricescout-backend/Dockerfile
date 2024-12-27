# 使用Python3.10作为基础镜像
FROM python:3.10

# 设置工作目录
WORKDIR /app

# 设置环境变量
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

# 设置镜像源
RUN echo "deb http://deb.debian.org/debian bullseye main" > /etc/apt/sources.list && \
    echo "deb http://security.debian.org/debian-security bullseye-security main" >> /etc/apt/sources.list && \
    sed -i 's|http://deb.debian.org|http://mirrors.aliyun.com|g' /etc/apt/sources.list && \
    sed -i 's|http://security.debian.org|http://mirrors.aliyun.com|g' /etc/apt/sources.list

# 更新 apt 缓存并安装所有需要的包
RUN apt-get update && \
    apt-get install -y --no-install-recommends \
    default-libmysqlclient-dev \
    default-mysql-client \
    build-essential \
    wget \
    gnupg \
    curl \
    unzip \
    chromium \
    chromium-driver \
    fonts-wqy-microhei \
    fonts-wqy-zenhei \
    xfonts-wqy \
    netcat-openbsd && \
    fc-cache -f -v && \
    rm -rf /var/lib/apt/lists/*

# 配置pip使用国内镜像源并升级
RUN pip config set global.index-url https://pypi.tuna.tsinghua.edu.cn/simple && \
    pip install --upgrade pip

# 复制requirements.txt并安装依赖
COPY requirements.txt /app/
RUN pip install --no-cache-dir -r requirements.txt

# 创建所需的目录并设置权限
RUN mkdir -p /app/pricehis /usr/share/nginx/pricehis && \
    chmod 777 /app/pricehis /usr/share/nginx/pricehis

# 复制所有源代码
COPY . /app/

# 设置init.sh的执行权限（确保在复制文件后执行）
RUN chmod +x /app/init.sh

# 暴露端口
EXPOSE 8000

# 设置卷
VOLUME /usr/share/nginx/pricehis

# 启动命令
CMD ["/app/init.sh"]