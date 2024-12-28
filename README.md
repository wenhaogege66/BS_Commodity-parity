# PriceScout 比价小子

PriceScout 是一个智能化的商品比价平台，旨在帮助用户快速找到心仪商品的最佳购买时机和渠道。通过整合多个电商平台的数据，提供实时价格比较、历史价格追踪、降价提醒等功能，让用户享受更明智的购物体验。

## 在线访问
- 网站地址：http://121.36.199.66
- 管理员账号：admin
- 管理员密码：admin

> **注意**：如果历史价格查询功能出现反复失败的情况，这可能是由于服务器资源占用过高导致。请通过以下方式联系作者重启服务器：
> - 邮箱：wenhaogege66@gmail.com
> - 电话：18786980391

## 功能特点

### 1. 多平台比价
- 支持京东、天猫、淘宝、拼多多等主流电商平台
- 实时比较各平台价格，展示最优惠选择
- 智能分类展示，快速定位目标商品

### 2. 历史价格追踪
- 展示商品历史价格走势图
- 帮助判断当前购买时机
- 价格波动分析

### 3. 智能收藏提醒
- 收藏感兴趣的商品
- 降价自动邮件通知
- 定时检查价格变化（每2小时）

### 4. 用户系统
- 账号注册与登录
- 个人收藏夹管理
- 邮件通知服务

## 技术栈

### 前端
- React 18
- TypeScript
- Material-UI (MUI)
- Axios
- React Router

### 后端
- Django
- Django REST framework
- MySQL
- Selenium (价格爬取)
- JWT (用户认证)
- Gunicorn (WSGI服务器)

### 部署
- Docker & Docker Compose
- Nginx
- 阿里云服务器

## 项目结构
```
PriceScout/
├── pricescout-frontend/    # 前端项目
│   ├── src/
│   ├── public/
│   └── package.json
├── pricescout-backend/     # 后端项目
│   ├── backend/
│   ├── Commodity/
│   └── manage.py
├── docker-compose.yml      # Docker 编排配置
└── nginx.conf             # Nginx 配置
```

## 本地开发

### 前端开发
```bash
cd pricescout-frontend
npm install
npm start
```

### 后端开发
```bash
cd pricescout-backend
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
python manage.py migrate
python manage.py runserver
```

## 部署说明

### 1. 环境要求
- Docker
- Docker Compose
- Node.js >= 14
- Python >= 3.8

### 2. 配置文件
- 复制 `.env.example` 到 `.env`
- 修改必要的环境变量（数据库配置、邮件服务等）

### 3. Docker 部署
```bash
# 构建镜像
docker-compose build

# 启动服务
docker-compose up -d

# 执行数据库迁移
docker-compose exec backend python manage.py migrate

# 创建管理员账号（如果需要）
docker-compose exec backend python manage.py createsuperuser
```

### 4. Nginx 配置
```nginx
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://frontend:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }

    location /api {
        proxy_pass http://backend:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

## 开发注意事项

### 1. 环境变量
- 前端环境变量在 `.env` 文件中配置
- 后端环境变量在 `settings.py` 中配置
- 生产环境的敏感信息应通过环境变量注入

### 2. 数据库
- 开发环境使用 SQLite
- 生产环境推荐使用 MySQL
- 定期备份数据库

### 3. 安全性
- 所有API请求都需要进行认证
- 密码必须加密存储
- 敏感信息通过环境变量管理

## 常见问题

### 1. 爬虫相关
- 确保 Selenium 和 ChromeDriver 版本匹配
- 注意请求频率限制
- 定期更新爬虫规则

### 2. 邮件服务
- 配置正确的 SMTP 服务器
- 检查邮件发送权限
- 避免频繁发送邮件

### 3. 性能优化
- 使用缓存减少数据库查询
- 优化图片加载
- 合理控制爬虫频率

## 贡献指南

1. Fork 项目
2. 创建特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 提交 Pull Request

## 联系方式

- 邮箱：wenhaogege66@gmail.com
- 电话：18786980391

## 许可证

本项目采用 MIT 许可证 - 查看 [LICENSE](LICENSE) 文件了解详情 