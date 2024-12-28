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
                
                # 只在主进程中预初始化浏览器
                import sys
                if 'gunicorn' not in sys.modules or os.environ.get('GUNICORN_WORKER_ID') == '1':
                    print("正在预初始化浏览器...")
                    from .detail_views import PriceTrendAPIView
                    try:
                        PriceTrendAPIView.get_driver()
                        print("浏览器预初始化成功！")
                    except Exception as e:
                        print(f"浏览器预初始化失败: {str(e)}")
                        
            except Exception as e:
                print(f"应用初始化失败: {str(e)}")
