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


class LoginReturn(APIView):
    def get(self, request):
        response = {
            'code': 4001,
            'username': '',
            'token': '',
            'msg': '认证成功',
        }
        HTTPToken = request.META.get("HTTP_AUTHORIZATION")
        print(SearchTokenName(HTTPToken))
        if SearchTokenName(HTTPToken) == 404:
            token = request.GET.get('token')
            if token is None:
                response['msg'] = "Token为空"
                return Response(response, status=400)
            if SearchTokenName(token) == 404:
                response['msg'] = "需要认证"
                return Response(response, status=400)
        username = SearchTokenName(token)[0]
        username_per = SearchTokenName(token)[1]
        cache.set(token, {"username": username, "per": username_per}, timeout=60 * 60 * 24)
        PrintLog = "token -> %s |username -> %s|per -> %s |" % (token, username, username_per)
        print(PrintLog)
        response['username'] = username
        response['token'] = token
        response['msg'] = "认证成功"
        response['code'] = 200
        return Response(response, status=200)  # 返回成功数据


def get_user_info(request):
    if request.method == 'GET':
        user_id = request.GET.get('user_id')
        try:
            user = OnlineUser.objects.get(user_id=user_id)
            result = {
                "user_name": user.user_name,
                "email": user.email,
                "phone_num": user.phone_num
            }
            return JsonResponse(result, status=200)
        except OnlineUser.DoesNotExist:
            return JsonResponse({"error": "User not found"}, status=404)
    else:
        return JsonResponse({"error": "Method not allowed"}, status=405)



@csrf_exempt
def user_add(request):
    if request.method == 'POST':
        try:
            data = json.loads(request.body.decode('utf-8'))
            # 检查用户名和邮箱唯一性
            if OnlineUser.objects.filter(user_name=data.get('user_name')).exists():
                return JsonResponse({"error": "Username already exists", 'state': False}, status=403)
            if OnlineUser.objects.filter(email=data.get('email')).exists():
                return JsonResponse({"error": "Email already exists", 'state': False}, status=403)

            # 创建新用户
            new_user = OnlineUser(
                user_name=data.get('user_name'),
                email=data.get('email'),
                phone_num=data.get('phone_num'),
                is_blacklisted=False
            )
            new_user.set_password(data.get('password'))
            new_user.save()
            return JsonResponse({"success": "User added successfully", 'state': True}, status=201)
        except KeyError:
            return JsonResponse({"error": "Invalid request body", 'state': False}, status=400)
    elif request.method == 'OPTIONS':
        return JsonResponse({"success": "OPTIONS operation"}, status=200)
    else:
        return JsonResponse({"error": "Method not allowed", 'state': False}, status=405)


@csrf_exempt
def user_log_in(request):
    if request.method == 'POST':
        try:
            data = json.loads(request.body.decode('utf-8'))
            # 根据用户名或邮箱查找用户
            user = OnlineUser.objects.filter(user_name=data.get('user_name')).first() or \
                   OnlineUser.objects.filter(email=data.get('user_name')).first()
            if not user:
                return JsonResponse({"error": "User does not exist", 'state': False}, status=403)
            if user.is_blacklisted:
                return JsonResponse({"error": "This user is blacklisted", 'state': False}, status=403)
            # 验证密码
            if user.check_password(data.get('password')):
                return JsonResponse({"user_id": user.user_id, "state": True}, status=200)
            else:
                return JsonResponse({"error": "Password is incorrect", 'state': False}, status=400)
        except KeyError:
            return JsonResponse({"error": "Invalid request body", 'state': False}, status=400)
    elif request.method == 'OPTIONS':
        return JsonResponse({"success": "OPTIONS operation"}, status=200)
    else:
        return JsonResponse({"error": "Method not allowed", 'state': False}, status=405)


@csrf_exempt
def user_change_password(request):
    if request.method == 'POST':
        try:
            data = json.loads(request.body.decode('utf-8'))
            user = OnlineUser.objects.filter(user_name=data.get('user_name')).first()
            if not user:
                return JsonResponse({"error": "User does not exist", 'state': False}, status=403)
            if user.email == data.get('email') and user.phone_num == data.get('phone_num'):
                user.set_password(data.get('new_password'))
                user.save()
                return JsonResponse({"success": "Password updated successfully", 'state': True}, status=200)
            else:
                return JsonResponse({"error": "Information is incorrect", 'state': False}, status=400)
        except KeyError:
            return JsonResponse({"error": "Invalid request body", 'state': False}, status=400)
    elif request.method == 'OPTIONS':
        return JsonResponse({"success": "OPTIONS operation"}, status=200)
    else:
        return JsonResponse({"error": "Method not allowed", 'state': False}, status=405)





