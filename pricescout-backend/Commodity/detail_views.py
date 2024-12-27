import time
from venv import logger
from django.http import JsonResponse
import httpx
from selenium import webdriver
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.common.by import By
from selenium.webdriver.common.keys import Keys
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.common.exceptions import TimeoutException, WebDriverException
from rest_framework.response import Response
from rest_framework.views import APIView
from threading import Lock
from django.conf import settings
from PIL import Image
import re
import hashlib
import os
from .models import *
from rest_framework.decorators import api_view
from apscheduler.schedulers.asyncio import AsyncIOScheduler
from apscheduler.triggers.cron import CronTrigger
from django.core.mail import send_mail


class PriceTrendAPIView(APIView):
    _driver = None
    _driver_lock = Lock()

    @classmethod
    def get_driver(cls):
        """获取共享 WebDriver 实例"""
        if cls._driver is None:
            with cls._driver_lock:
                if cls._driver is None:
                    try:
                        options = Options()
                        options.add_argument("--headless")
                        options.add_argument("--disable-gpu")
                        options.add_argument("--no-sandbox")
                        options.add_argument("--disable-dev-shm-usage")
                        
                        options.binary_location = "/usr/bin/chromium"
                        
                        cls._driver = webdriver.Chrome(options=options)
                        
                        cls._driver.set_page_load_timeout(30)
                        cls._driver.set_script_timeout(30)
                        
                    except WebDriverException as e:
                        print(f"WebDriver 初始化失败: {e}")
                        raise
        return cls._driver
    
    def get_image_path(self, url_hash):
        """根据 URL 哈希值生成图片的文件路径"""
        # 统一使用 nginx 的静态文件目录
        save_dir = "/usr/share/nginx/pricehis"
        try:
            os.makedirs(save_dir, exist_ok=True)
            print(f"目录创建/确认成功: {save_dir}")
            # 检查目录权限
            print(f"目录权限: {oct(os.stat(save_dir).st_mode)[-3:]}")
        except Exception as e:
            print(f"创建目录失败: {str(e)}")
        
        full_page_path = os.path.join(save_dir, f"full_page_{url_hash}.png")
        screenshot_path = os.path.join(save_dir, f"price_trend_{url_hash}.png")
        print(f"生成的文件路径: \n全页面: {full_page_path}\n裁剪图: {screenshot_path}")
        return full_page_path, screenshot_path

    def post(self, request, *args, **kwargs):
        """接收前端发送的商品链接，爬取商品历史趋势价格并返回。"""
        data = request.data
        url = data.get("url")
        print("url:", url)
        if not url:
            return Response({"error": "URL is required"}, status=400)
        
                # 生成 URL 的哈希值，用于唯一标识
        url_hash = hashlib.md5(url.encode()).hexdigest()
                # 检查是否已经存在该 URL 的图片文件
        full_page_path, screenshot_path = self.get_image_path(url_hash)
        if os.path.exists(screenshot_path):
            print("图片已存在，直接返回图片路径")
            return Response({
                "screenshots": {
                    "full_page": full_page_path,
                    "cropped": screenshot_path
                },
                "message": "返回已存在的图片"
            }, status=200)
            
        driver = None
        try:
            driver = self.get_driver()
            driver.set_window_size(1920, 1080)
            driver.get("http://www.hisprice.cn/")
            print("已打开网站")
            input_box = WebDriverWait(driver, 10).until(
                EC.presence_of_element_located((By.ID, "kValId"))
            )
            input_box.clear()
            input_box.send_keys(url + Keys.RETURN)
            print("已输入URL并回车")
            # 等待 container 内内容加载且不为空
            WebDriverWait(driver, 15).until(
                lambda d: d.find_element(By.ID, "container").get_attribute("innerHTML").strip() != ""
            )
            print("已加载目标内容")

            # 不需要重新定义 save_dir，直接使用 get_image_path 的返回值
            full_page_path, screenshot_path = self.get_image_path(url_hash)
            
            container = driver.find_element(By.ID, "container")
            # 确保滚动完成后再截图
            driver.execute_script("arguments[0].scrollIntoView();", container)
            # 截取整个页面
            print(f"尝试保存全页面截图到: {full_page_path}")
            driver.save_screenshot(full_page_path)
            print(f"全页面截图保存成功，检查文件是否存在: {os.path.exists(full_page_path)}")
            print(f"文件大小: {os.path.getsize(full_page_path)} bytes")

            # 只截取页面的上部分
            image = Image.open(full_page_path)
            print(f"全页面截图的宽高: 宽度={image.width}, 高度={image.height}")

            # 设定裁剪的区域（假设我们只截取页面的上半部分）
            # 可以根据实际需求调整 height 值
            height = 400  
            location = container.location
            size = container.size

            # 打印位置和大小
            print(f'container 的位置: {location}')
            print(f'container 的大小: {size}')

            left = location['x']
            top = 0
            right = left + size['width']
            bottom = top + size['height']

            cropped_image = image.crop((left, top, right, bottom))
            print(f"尝试保存裁剪图片到: {screenshot_path}")
            cropped_image.save(screenshot_path)
            print(f"裁剪图片保存成功，检查文件是否存在: {os.path.exists(screenshot_path)}")
            print(f"文件大小: {os.path.getsize(screenshot_path)} bytes")


            # 使用 JS 获取内容
            search_content = driver.execute_script("return document.getElementById('container').innerHTML;")
            # 清理 HTML 内容
            clean_content = re.sub(r'\s+', ' ', search_content).strip()
            print("清理后的内容:", clean_content)

            # 返回截图路径和内容
            return Response({
                "data": clean_content,
                "screenshots": {
                    "full_page": f"/pricehis/full_page_{url_hash}.png",  # 返回相对路径
                    "cropped": f"/pricehis/price_trend_{url_hash}.png"   # 返回相对路径
                }
            }, status=200)
        except TimeoutException:
            return Response({"error": "页面加载超时，请检查目标网站状态或输入内容"}, status=504)
        except WebDriverException as e:
            return Response({"error": f"浏览器操作失败: {e}"}, status=500)
        except Exception as e:
            return Response({"error": f"发生未知错误: {str(e)}"}, status=500)
        # finally:
        #     # 可选：关闭当前 WebDriver 实例，释放资源
        #     if driver:
        #         driver.quit()
        #         self.__class__._driver = None  # 重置共享 driver 实例
        #         print("已关闭浏览器，释放资源")
        
@api_view(['GET'])
def health_check(request):
    """健康检查接口"""
    return Response({"status": "healthy"}, status=200)
        
class PriceMonitor:
    def __init__(self):
        self.scheduler = None
        
    def start(self):
        """在应用启动时调用此方法来启动调度器"""
        if not self.scheduler:
            self.scheduler = AsyncIOScheduler()
            self.scheduler.add_job(
                self.check_price_changes,
                CronTrigger(hour="*/2"),  # 每2小时检查一次
                id="price_monitor"
            )
            try:
                self.scheduler.start()
            except Exception as e:
                print(f"启动调度器失败: {str(e)}")

    async def check_price_changes(self):
        # 获取所有收藏商品，使用同步操作
        favorites = Favorite.objects.select_related('product', 'user').all()
        
        for favorite in favorites:
            try:
                # 使用你现有的搜索API获取最新价格
                current_price = await self.get_current_price(favorite.product)
                
                if current_price and current_price < favorite.price_at_favorite:
                    # 发送邮件通知
                    await self.send_price_alert(
                        favorite.user.email,
                        favorite.product,
                        favorite.price_at_favorite,
                        current_price
                    )
                    
                    # 更新收藏时的价格，使用同步操作
                    favorite.price_at_favorite = current_price
                    favorite.save()
                    
            except Exception as e:
                logger.error(f"Error checking price for product {favorite.product.id}: {str(e)}")
                
    async def get_current_price(self, product):
        # 使用你的搜索API
        try:
            response = await httpx.get(
                "http://121.36.199.66:80/search/ajax_search_product_list",
                params={
                    "keywords": product.favorite_set.first().search_keyword,  # 使用收藏时的搜索关键词
                    "mall_id": product.platform.mall_id,
                }
            )
            
            if response.status_code == 200:
                data = response.json()
                # 找到完全匹配的商品
                for item in data.get("data", []):
                    if item["wiki_id"] == product.product_id:
                        return item["article_price"]
            return None
        except Exception as e:
            logger.error(f"Error getting current price: {str(e)}")
            return None
            
    async def send_price_alert(self, email, product, old_price, new_price):
        # 发送邮件通知
        discount_percentage = ((old_price - new_price) / old_price) * 100
        
        message = f"""
        您收藏的商品 {product.name} 降价了！
        
        原价: ¥{old_price}
        现价: ¥{new_price}
        降幅: {discount_percentage:.1f}%
        
        立即查看: {product.link}
        """
        
        await send_email(email, "商品降价提醒", message)

async def send_email(email, subject, message):
    try:
        send_mail(
            subject=subject,
            message=message,
            from_email=settings.EMAIL_HOST_USER,
            recipient_list=[email],
            fail_silently=False,
        )
        return True
    except Exception as e:
        logger.error(f"Failed to send email: {str(e)}")
        return False

@api_view(['POST'])
async def trigger_price_check(request):
    """手动触发价格检查"""
    try:
        await monitor.check_price_changes()
        return Response({
            "status": "success",
            "message": "价格检查已触发，邮件通知将在发现降价时发送"
        })
    except Exception as e:
        logger.error(f"手动触发价格检查失败: {str(e)}")
        return Response({
            "status": "error",
            "message": f"触发失败: {str(e)}"
        }, status=500)

# 创建监控器实例，但不立即启动
monitor = PriceMonitor()
        