from rest_framework.views import APIView
from rest_framework.response import Response
from selenium.webdriver.common.by import By
from selenium.webdriver.common.keys import Keys
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium import webdriver
from threading import Lock

class PriceTrendAPIView(APIView):
    # 使用类变量实现 WebDriver 共享
    _driver = None
    _driver_lock = Lock()  # 防止并发初始化

    @classmethod
    def get_driver(cls):
        """获取共享 WebDriver 实例"""
        if cls._driver is None:
            with cls._driver_lock:  # 确保线程安全
                if cls._driver is None:
                    # 配置 WebDriver
                    chrome_driver = r"C:\Python312\chromedriver.exe"
                    chrome_path = r"D:\Program Files\Google\Chrome\Application\chrome.exe"
                    options = Options()
                    options.binary_location = chrome_path
                    options.add_argument("--headless")  # 无头模式，提升性能
                    options.add_argument("--disable-gpu")
                    options.add_argument("--no-sandbox")
                    service = Service(chrome_driver)
                    cls._driver = webdriver.Chrome(service=service, options=options)
        return cls._driver

    def post(self, request, *args, **kwargs):
        """
        接收前端发送的商品链接，爬取商品历史趋势价格并返回。
        """
        data = request.data
        url = data.get("url")

        if not url:
            return Response({"error": "URL is required"}, status=400)

        try:
            driver = self.get_driver()
            driver.get("http://wap.tool168.cn/history/")

            # 等待输入框加载并输入数据
            WebDriverWait(driver, 10).until(
                EC.presence_of_element_located((By.ID, "kValId"))
            ).send_keys(url + Keys.RETURN)

            # 等待目标数据加载
            WebDriverWait(driver, 10).until(
                EC.presence_of_element_located((By.ID, "container"))
            )

            # 获取目标数据
            search_content = driver.find_element(By.ID, "container").get_attribute("innerHTML")

            return Response({"data": search_content}, status=200)

        except Exception as e:
            return Response({"error": str(e)}, status=500)
