# 使用Python3.10作为基础镜像
FROM python:3.10

# 设置工作目录
WORKDIR /app

# 设置环境变量
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

# 安装系统依赖
RUN apt-get update && apt-get install -y \
    default-libmysqlclient-dev \
    build-essential \
    wget \
    gnupg \
    unzip \
    chromium \
    chromium-driver \
    && rm -rf /var/lib/apt/lists/*

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