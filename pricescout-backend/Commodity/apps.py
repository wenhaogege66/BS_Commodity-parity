from django.apps import AppConfig
import os


class CommodityConfig(AppConfig):
    default_auto_field = "django.db.models.BigAutoField"
    name = "Commodity"

    def ready(self):
        """当应用就绪时调用"""
        # 防止在开发环境中重复运行
        if os.environ.get('RUN_MAIN', None) != 'true':
            try:
                # 导入监控器并启动
                from .detail_views import monitor
                monitor.start()
                print("价格监控调度器启动成功")
                
                # 只在主进程中预初始化浏览器
                import sys
                if 'gunicorn' not in sys.modules:
                    print("正在预初始化浏览器...")
                    from .detail_views import PriceTrendAPIView
                    try:
                        with PriceTrendAPIView._driver_lock:  # 使用锁来保护初始化过程
                            if PriceTrendAPIView._driver is None:  # 双重检查
                                PriceTrendAPIView.get_driver()
                                print("浏览器预初始化成功！")
                            else:
                                print("浏览器已经初始化过了")
                    except Exception as e:
                        print(f"浏览器预初始化失败: {str(e)}")
                        
            except Exception as e:
                print(f"应用初始化失败: {str(e)}")
