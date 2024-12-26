# from chaos_api.util.SearchTokenUserPer import SearchTokenName
# from django.core.cache import cache
# from django.utils.deprecation import MiddlewareMixin
# from django.http import JsonResponse


# def process_request(request):
#     print("Auth鉴权请求 -> Success !")


# class AuthMidddleware(MiddlewareMixin):

#     def process_response(self, request, response):
#      		# 截取请求的url ， xxx.com/api/url
#         AccessURL = (request.path).split("/")[2]
#         #  获取登录之后存在本地浏览器的Token
#         HTTPToken = request.META.get("HTTP_AUTHORIZATION")
#         # 受保护的Url列表
#         SafeUrlList = ["AddProject", "SelectAllOfflineProject", "SelectAllOnlineProject", "SendMsg"]
#         if AccessURL in SafeUrlList:
#             # 加上此项判断会存在用户删除之后，凭浏览器存在的token缓存还能访问敏感url
#             if cache.has_key(HTTPToken) == 0:
#                 DebugMsg = "|访问敏感url ｜AccessURL -> %s | HTTP Token -> %s | Redis中Token是否存在 -> %s " % (AccessURL, HTTPToken, cache.has_key(HTTPToken))
#                 print(DebugMsg)
#                 print("Auth鉴权返回 -> Error !")
#                 return JsonResponse({'msg': "认证失败", 'status': 400}, status=400)
#             # 实时判断权限
#             if SearchTokenName(HTTPToken) == 404:
#                 DebugMsg = "|访问敏感url｜AccessURL -> %s | HTTP Token -> %s | UserName -> %s | Per -> %s" % (AccessURL, HTTPToken, cache.get(HTTPToken).get('username'), cache.get(HTTPToken).get('per'))
#                 print(DebugMsg)
#                 print("Auth鉴权返回 -> Error !")
#                 return JsonResponse({'msg': "认证失败", 'status': 400}, status=400)
#             if SearchTokenName(HTTPToken)[1] != 'sre':
#                 print("Auth鉴权返回 -> Error !")
#                 return JsonResponse({'msg': "认证失败", 'status': 400}, status=400)
#             else:
#                 return response
#         return response
#     print("Auth鉴权返回 -> Success !")