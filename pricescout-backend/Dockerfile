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

# 更新 apt 缓存
RUN apt-get update

# 安装核心依赖
RUN apt-get install -y --no-install-recommends \
    default-libmysqlclient-dev \
    default-mysql-client \
    build-essential \
    wget \
    gnupg \
    curl 

# 安装其他工具
RUN apt-get install -y --no-install-recommends \
    unzip \
    chromium \
    chromium-driver

RUN apt-get install -y --no-install-recommends \
    fonts-wqy-microhei \
    fonts-wqy-zenhei \
    xfonts-wqy \
    && fc-cache -f -v


# 清理缓存
RUN rm -rf /var/lib/apt/lists/*


# 创建价格历史图片目录
RUN mkdir -p /app/pricehis && chmod 777 /app/pricehis

# 配置pip使用国内镜像源
RUN pip config set global.index-url https://pypi.tuna.tsinghua.edu.cn/simple

# 升级pip
RUN pip install --upgrade pip

# 复制requirements.txt并安装依赖
COPY requirements.txt /app/
RUN pip install --no-cache-dir -r requirements.txt

# 复制其他项目文件
COPY . /app/

# 复制初始化脚本
COPY init.sh /app/
RUN chmod +x /app/init.sh

# 安装 netcat 用于检查数据库连接
RUN apt-get update && apt-get install -y netcat-openbsd

# 创建并设置目录权限
RUN mkdir -p /usr/share/nginx/pricehis && \
    chmod 777 /usr/share/nginx/pricehis

# 暴露端口
EXPOSE 8000

# 启动命令
CMD ["/app/init.sh"]

# 在最后添加
VOLUME /usr/share/nginx/pricehis

# 确保目录存在并设置权限
RUN mkdir -p /usr/share/nginx/pricehis && \
    chmod 777 /usr/share/nginx/pricehis