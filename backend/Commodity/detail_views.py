import time
from django.http import JsonResponse
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


class PriceTrendAPIView(APIView):
    _driver = None
    _driver_lock = Lock()  # 防止并发初始化

    @classmethod
    def get_driver(cls):
        """获取共享 WebDriver 实例"""
        if cls._driver is None:
            with cls._driver_lock:
                if cls._driver is None:
                    try:
                        # WebDriver配置
                        chrome_driver = r"C:\Python312\chromedriver.exe"
                        chrome_path = r"D:\Program Files\Google\Chrome\Application\chrome.exe"
                        options = Options()
                        options.binary_location = chrome_path
                        options.add_argument("--headless")  # 无头模式
                        options.add_argument("--disable-gpu")
                        options.add_argument("--no-sandbox")
                        options.add_argument("--disable-dev-shm-usage")  # 避免共享内存问题
                        options.add_argument(f"user-data-dir={r'D:\study-at-zju\BS\Commodity parity\cache'}")  # 指定缓存目录
                        service = Service(chrome_driver)

                        # 初始化 WebDriver
                        cls._driver = webdriver.Chrome(service=service, options=options)
                    except WebDriverException as e:
                        print(f"WebDriver 初始化失败: {e}")
                        raise
        return cls._driver
    
    def get_image_path(self, url_hash):
        """根据 URL 哈希值生成图片的文件路径"""
        save_dir = r"D:\study-at-zju\BS\Commodity parity\frontend\src\asset\pricehis"
        full_page_path = os.path.join(save_dir, f"full_page_{url_hash}.png")
        screenshot_path = os.path.join(save_dir, f"price_trend_{url_hash}.png")
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

            # 生成截图存储路径
            save_dir = r"D:\study-at-zju\BS\Commodity parity\frontend\src\asset\pricehis"
            os.makedirs(save_dir, exist_ok=True)

            # 使用 URL 生成唯一文件名
            url_hash = hashlib.md5(url.encode()).hexdigest()
            full_page_path = os.path.join(save_dir, f"full_page_{url_hash}.png")
            screenshot_path = os.path.join(save_dir, f"price_trend_{url_hash}.png")
            
            container = driver.find_element(By.ID, "container")
            # 确保滚动完成后再截图
            driver.execute_script("arguments[0].scrollIntoView();", container)
            # 截取整个页面
            driver.save_screenshot(full_page_path)
            print(f"全页面截图已保存到: {full_page_path}")

            # 只截取页面的上部分
            image = Image.open(full_page_path)

            # 设定裁剪的区域（假设我们只截取页面的上半部分）
            # 可以根据实际需求调整 height 值
            height = 705  # 例如，裁剪前 800px 高度的区域
            location = container.location
            size = container.size

            # 打印位置和大小
            print(f'container 的位置: {location}')
            print(f'container 的大小: {size}')

            left = location['x']
            print(f'container 左侧位置 (left): {left}')

            cropped_image = image.crop((811, 0, image.width-830, height))
            cropped_image.save(screenshot_path)
            print(f"裁剪后的截图已保存到: {screenshot_path}")


            # 使用 JS 获取内容
            search_content = driver.execute_script("return document.getElementById('container').innerHTML;")
            # 清理 HTML 内容
            clean_content = re.sub(r'\s+', ' ', search_content).strip()
            print("清理后的内容:", clean_content)

            # 返回截图路径和内容
            return Response({
                "data": clean_content,
                "screenshots": {
                    "full_page": full_page_path,
                    "cropped": screenshot_path
                }
            }, status=200)
        except TimeoutException:
            return Response({"error": "页面加载超时，请检查目标网站状态或输入内容"}, status=504)
        except WebDriverException as e:
            return Response({"error": f"浏览器操作失败: {e}"}, status=500)
        except Exception as e:
            return Response({"error": f"发生未知错误: {str(e)}"}, status=500)
        finally:
            # 可选：关闭当前 WebDriver 实例，释放资源
            if driver:
                driver.quit()
                self.__class__._driver = None  # 重置共享 driver 实例
                print("已关闭浏览器，释放资源")


# 爬wap比价网
    # def post(self, request, *args, **kwargs):
    #     """
    #     接收前端发送的商品链接，爬取商品历史趋势价格并返回。
    #     """
    #     data = request.data
    #     url = data.get("url")

    #     if not url:
    #         return Response({"error": "URL is required"}, status=400)

    #     try:
    #         driver = self.get_driver()
    #         driver.get("http://wap.tool168.cn/history/")

    #         # 等待输入框加载并输入数据
    #         WebDriverWait(driver, 10).until(
    #             EC.presence_of_element_located((By.ID, "kValId"))
    #         ).send_keys(url + Keys.RETURN)

    #         # 等待目标数据加载
    #         WebDriverWait(driver, 10).until(
    #             EC.presence_of_element_located((By.ID, "container"))
    #         )

    #         # 获取目标数据
    #         search_content = driver.find_element(By.ID, "container").get_attribute("innerHTML")

    #         return Response({"data": search_content}, status=200)

    #     except Exception as e:
    #         return Response({"error": str(e)}, status=500)
        
