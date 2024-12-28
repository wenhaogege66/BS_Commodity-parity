import os
import django

# 设置 Django 环境
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from Commodity.models import OnlineUser

def create_admin_user():
    """创建默认管理员用户"""
    try:
        # 检查用户是否已存在
        if not OnlineUser.objects.filter(user_name='admin').exists():
            # 创建新管理员用户
            admin = OnlineUser(
                user_name='admin',
                email='admin@example.com',  # 设置一个默认邮箱
                phone_num='18985633972',
                role='admin'  # 设置为管理员角色
            )
            # 设置密码（会自动进行哈希处理）
            admin.set_password('admin')
            admin.save()
            print("管理员用户创建成功！")
        else:
            print("管理员用户已存在，跳过创建。")
    except Exception as e:
        print(f"创建管理员用户时出错: {str(e)}")

if __name__ == '__main__':
    create_admin_user() 