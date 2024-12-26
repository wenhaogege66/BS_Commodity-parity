#!/bin/bash
# 检查 Nginx 是否正常运行
curl -f http://localhost/ || exit 1 