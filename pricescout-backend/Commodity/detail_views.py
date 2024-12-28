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
                        print("开始初始化浏览器...")
                        
                        options = Options()
                        # 基本设置
                        options.add_argument("--headless")
                        options.add_argument("--disable-gpu")
                        options.add_argument("--no-sandbox")
                        options.add_argument("--disable-dev-shm-usage")
                        
                        # 性能优化设置
                        options.add_argument("--disable-extensions")
                        options.add_argument("--disable-default-apps")
                        options.add_argument("--disable-sync")
                        options.add_argument("--disable-translate")
                        options.add_argument("--metrics-recording-only")
                        options.add_argument("--no-first-run")
                        
                        # 设置页面大小
                        options.add_argument("--window-size=1920,1080")
                        
                        # 添加临时目录设置
                        import tempfile
                        temp_dir = tempfile.mkdtemp()
                        options.add_argument(f"--user-data-dir={temp_dir}")
                        
                        # 直接使用系统安装的 ChromeDriver
                        service = Service('/usr/bin/chromedriver')
                        
                        print("Chrome 选项配置完成，正在创建 WebDriver 实例...")
                        
                        # 添加重试机制
                        max_retries = 3
                        retry_count = 0
                        last_error = None
                        
                        while retry_count < max_retries:
                            try:
                                print(f"尝试创建 WebDriver 实例 (第 {retry_count + 1} 次)")
                                cls._driver = webdriver.Chrome(service=service, options=options)
                                print("WebDriver 实例创建成功")
                                
                                # 设置超时
                                cls._driver.set_page_load_timeout(30)
                                cls._driver.set_script_timeout(30)
                                cls._driver.implicitly_wait(10)
                                
                                # 预热浏览器
                                print("正在预热浏览器...")
                                try:
                                    cls._driver.get("about:blank")
                                    print("空白页面加载成功")
                                except Exception as e:
                                    print(f"空白页面加载失败: {str(e)}")
                                
                                print("浏览器初始化完成！")
                                break
                                
                            except Exception as e:
                                last_error = e
                                retry_count += 1
                                print(f"第 {retry_count} 次尝试失败: {str(e)}")
                                if retry_count < max_retries:
                                    wait_time = 5
                                    print(f"等待 {wait_time} 秒后重试...")
                                    time.sleep(wait_time)
                                else:
                                    print("已达到最大重试次数")
                                    raise last_error
                                    
                    except Exception as e:
                        print(f"浏览器初始化过程中发生错误: {str(e)}")
                        cls._driver = None
                        raise
                        
        return cls._driver

    @classmethod
    def reset_driver(cls):
        """重置浏览器实例（当发生错误时调用）"""
        with cls._driver_lock:
            if cls._driver:
                try:
                    cls._driver.quit()
                except:
                    pass
                finally:
                    cls._driver = None

    def __del__(self):
        """在对象被销毁时关闭浏览器"""
        if self._driver:
            try:
                self._driver.quit()
            except:
                pass
    
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
        print("开始处理URL请求:", url)
        if not url:
            return Response({"error": "URL is required"}, status=400)
        
        # 生成 URL 的哈希值，用于唯一标识
        url_hash = hashlib.md5(url.encode()).hexdigest()
        print(f"生成的URL哈希值: {url_hash}")
        
        # 检查是否已经存在该 URL 的图片文件
        full_page_path, screenshot_path = self.get_image_path(url_hash)
        if os.path.exists(screenshot_path):
            print(f"找到已存在的图片文件: {screenshot_path}")
            return Response({
                "screenshots": {
                    "full_page": f"/pricehis/full_page_{url_hash}.png",
                    "cropped": f"/pricehis/price_trend_{url_hash}.png"
                },
                "message": "返回已存在的图片"
            }, status=200)
            
        driver = None
        try:
            print("准备获取WebDriver实例...")
            driver = self.get_driver()
            print("成功获取WebDriver实例")
            
            driver.set_window_size(1920, 1080)
            print("设置窗口大小完成")
            
            print("开始访问价格网站...")
            driver.get("http://www.hisprice.cn/")
            print("成功加载价格网站")

            print("等待输入框出现...")
            input_box = WebDriverWait(driver, 10).until(
                EC.presence_of_element_located((By.ID, "kValId"))
            )
            print("找到输入框，准备输入URL")
            
            input_box.clear()
            input_box.send_keys(url + Keys.RETURN)
            print("已输入URL并回车")

            print("等待内容加载...")
            WebDriverWait(driver, 15).until(
                lambda d: d.find_element(By.ID, "container").get_attribute("innerHTML").strip() != ""
            )
            print("内容加载完成")

            container = driver.find_element(By.ID, "container")
            print("找到container元素")

            print(f"准备保存全页面截图: {full_page_path}")
            driver.execute_script("arguments[0].scrollIntoView();", container)
            driver.save_screenshot(full_page_path)
            print("全页面截图保存成功")

            print("开始处理图片裁剪...")
            image = Image.open(full_page_path)
            location = container.location
            size = container.size
            
            print(f"container位置: {location}")
            print(f"container大小: {size}")

            left = location['x']
            top = 0
            right = left + size['width']
            bottom = top + size['height']

            cropped_image = image.crop((left, top, right, bottom))
            print(f"准备保存裁剪后的图片: {screenshot_path}")
            cropped_image.save(screenshot_path)
            print("裁剪图片保存成功")

            print("获取页面内容...")
            search_content = driver.execute_script("return document.getElementById('container').innerHTML;")
            clean_content = re.sub(r'\s+', ' ', search_content).strip()
            print("页面内容获取完成")

            print("准备返回响应...")
            return Response({
                "data": clean_content,
                "screenshots": {
                    "full_page": f"/pricehis/full_page_{url_hash}.png",
                    "cropped": f"/pricehis/price_trend_{url_hash}.png"
                }
            }, status=200)
        except TimeoutException:
            self.__class__.reset_driver()  # 超时时重置浏览器
            return Response({"error": "页面加载超时，请检查目标网站状态或输入内容"}, status=504)
        except WebDriverException as e:
            self.__class__.reset_driver()  # 浏览器错误时重置
            return Response({"error": f"浏览器操作失败: {e}"}, status=500)
        except Exception as e:
            self.__class__.reset_driver()  # 其他错误时也重置
            return Response({"error": f"发生未知错误: {str(e)}"}, status=500)
        
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
        