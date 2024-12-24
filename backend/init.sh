#!/bin/bash
# 等待数据库服务就绪
echo "Waiting for MySQL to start..."
while ! nc -z db 3306; do
  sleep 1
done

echo "Making migrations..."
python manage.py makemigrations

echo "Applying migrations..."
python manage.py migrate

echo "Starting Gunicorn..."
gunicorn --bind 0.0.0.0:8000 \
         --timeout 300 \
         --workers 3 \
         --threads 2 \
         backend.wsgi:application 