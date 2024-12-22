from django.db import models
from django.contrib.auth.hashers import make_password, check_password
from datetime import datetime

# 用户模型
class OnlineUser(models.Model):
    user_id = models.AutoField(primary_key=True)
    role = models.CharField(max_length=20, null=False)
    user_name = models.CharField(max_length=30, unique=True, null=False)
    password = models.CharField(max_length=128, null=False)  # 增加字段长度用于存储加密后的密码
    email = models.EmailField(unique=True, null=False)
    phone_num = models.CharField(max_length=15, null=False)  # 限制手机号格式
    is_blacklisted = models.BooleanField(default=False)

    def set_password(self, raw_password):
        self.password = make_password(raw_password)
    
    def check_password(self, raw_password):
        return check_password(raw_password, self.password)

# 平台模型
class Platform(models.Model):
    platform_id = models.AutoField(primary_key=True)
    platform_name = models.CharField(max_length=50, unique=True, null=False)
    website_url = models.URLField(max_length=200, null=False)

# 商品模型
class Product(models.Model):
    product_id = models.AutoField(primary_key=True)
    name = models.CharField(max_length=100, null=False)
    description = models.TextField(null=True, blank=True)
    category = models.CharField(max_length=50, null=True)  # 商品类别
    image_url = models.URLField(max_length=300, null=True, blank=True)
    link = models.URLField(max_length=300, null=True, blank=True)

# 价格历史记录模型
class PriceHistory(models.Model):
    record_id = models.AutoField(primary_key=True)
    product = models.ForeignKey(Product, on_delete=models.CASCADE, related_name="price_history")
    platform = models.ForeignKey(Platform, on_delete=models.CASCADE, related_name="price_history")
    price = models.DecimalField(max_digits=10, decimal_places=2, null=False)  # 存储价格
    timestamp = models.DateTimeField(auto_now_add=True)  # 自动记录价格变化时间

# 收藏夹模型
class Favorite(models.Model):
    favorite_id = models.AutoField(primary_key=True)
    user = models.ForeignKey(OnlineUser, on_delete=models.CASCADE, related_name="favorites")
    product = models.ForeignKey(Product, on_delete=models.CASCADE, related_name="favorited_by")
    added_at = models.DateTimeField(auto_now_add=True)  # 收藏时间
    price_at_favorite = models.DecimalField(max_digits=10, decimal_places=2, null=True)  # 收藏时的价格
    platform = models.ForeignKey(Platform, on_delete=models.CASCADE, related_name="favorites", null=True)  # 收藏时的平台
    note = models.TextField(null=True, blank=True)  # 用户备注

# 降价提醒模型
class PriceAlert(models.Model):
    alert_id = models.AutoField(primary_key=True)
    user = models.ForeignKey(OnlineUser, on_delete=models.CASCADE, related_name="price_alerts")
    product = models.ForeignKey(Product, on_delete=models.CASCADE, related_name="alerts")
    target_price = models.DecimalField(max_digits=10, decimal_places=2, null=False)  # 用户设置的目标价格
    created_at = models.DateTimeField(auto_now_add=True)  # 设置提醒时间
    is_active = models.BooleanField(default=True)  # 提醒是否有效
