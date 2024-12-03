from rest_framework.views import APIView
from rest_framework.response import Response

import json
from django.http import JsonResponse, HttpResponse
from .models import *
from django.views.decorators.csrf import csrf_exempt
from django.core import serializers
from django.http import JsonResponse
import json
from django.views.decorators.csrf import csrf_exempt
from rest_framework.views import APIView
from rest_framework.response import Response
from selenium import webdriver
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.common.by import By
from selenium.webdriver.common.keys import Keys
from selenium.webdriver.chrome.options import Options
import time
from webdriver_manager.chrome import ChromeDriverManager


class PriceTrendAPIView(APIView):
    def post(self, request, *args, **kwargs):
        """
        接收前端发送的商品链接，爬取商品历史趋势价格并返回。
        """
        # print(request)
        # 从请求中获取商品链接
        data = request.data
        url = data.get("url")

        if not url:
            return Response({"error": "URL is required"}, status=400)

        # 配置 ChromeDriver 路径
        service = Service(ChromeDriverManager().install())  # 自动下载匹配版本
        # service = Service("D:/Daily APP/GBrowser/Gbrowser/chromedriver.exe")  # 请确保路径正确
        chrome_options = Options("D:/Daily APP/GBrowser/Gbrowser/Gbrowser.exe")
        chrome_options.add_argument("--headless")  # 后台运行（无界面模式）
        chrome_options.add_argument("--disable-gpu")
        chrome_options.add_argument("--no-sandbox")  # 一般在服务器运行时需要

        try:
            # 启动 Selenium WebDriver
            driver = webdriver.Chrome(service=service, options=chrome_options)
            driver.get("https://www.gwdang.com/v2/trend?from=search")

            # 找到输入框并输入商品链接
            search_input = driver.find_element(By.ID, "url")
            search_input.clear()
            search_input.send_keys(url)
            search_input.send_keys(Keys.RETURN)  # 模拟按回车键

            # 等待页面加载（根据页面实际需要调整时间）
            time.sleep(5)  # 简单等待，生产环境可用显式等待

            # 爬取跳转页面的历史价格数据
            search_content = driver.find_element(By.CLASS_NAME, "search_content").get_attribute("innerHTML")

            # 关闭 WebDriver
            driver.quit()

            return Response({"data": search_content}, status=200)

        except Exception as e:
            # 捕获异常并返回错误信息
            if "driver" in locals():
                driver.quit()  # 确保 WebDriver 正常关闭
            return Response({"error": str(e)}, status=500)

