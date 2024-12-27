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
            except Exception as e:
                print(f"启动价格监控失败: {str(e)}")
