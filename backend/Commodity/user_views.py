from rest_framework.views import APIView
from rest_framework.response import Response

import json
from django.http import JsonResponse, HttpResponse
from .models import *
from django.views.decorators.csrf import csrf_exempt
from django.core import serializers

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
        filter_users = online_user.objects.filter(user_id=request.GET.get('user_id'))
        if filter_users.exists():
            filter_user = filter_users[0]
        else:
            return JsonResponse({"error": "User not found"}, status=404)
        result = {
            "user_name": filter_user.user_name,
            "email": filter_user.email,
            "phone_num": filter_user.phone_num
        }
        return JsonResponse(result, safe=False)
    else:
        return JsonResponse({"error": "Method not allowed"}, status=405)

@csrf_exempt
def user_add(request):
    if request.method == 'POST':
        # 将请求体中的数据转化为json格式
        data = json.loads(request.body.decode('utf-8'))
        print('看看data:{}'.format(data))
        # 检查用户名和邮箱是否已经存在
        filter_email = online_user.objects.filter(email=data.get('email'))
        filter_username = online_user.objects.filter(user_name=data.get('user_name'))
        # print('看看filter_email:{}'.format(filter_email))
        # print('看看filter_username:{}'.format(filter_username))

        # 检查邮箱是否已经存在
        if filter_email.exists():
            print("User with this email already exists")
            return JsonResponse({"error": "User with this email already exists", 'state': False}, status=403)

        # 检查用户名是否已经存在
        if filter_username.exists():
            print("User with this username already exists")
            return JsonResponse({"error": "User with this username already exists", 'state': False}, status=403)

        # 如果不存在该邮箱和用户名，则继续创建新用户
        if online_user.objects.count() == 0:
            print("新用户")
            cur_id = 1
            new_user = online_user(
                user_id=cur_id,
                user_name=data.get('user_name'),
                password=data.get('password'),
                email=data.get('email'),
                phone_num=data.get('phone_num'),
                is_blacklisted=False
            )
            new_user.save()
        else:
            print("新用户1")
            new_user = online_user(
                user_name=data.get('user_name'),
                password=data.get('password'),
                email=data.get('email'),
                phone_num=data.get('phone_num'),
                is_blacklisted=False
            )
            new_user.save()

        return JsonResponse({"success": "User added successfully", 'state': True}, status=201)

    elif request.method == 'OPTIONS':
        return JsonResponse({"success": "OPTIONS operation"}, status=200)

    else:
        return JsonResponse({"error": "Method not allowed", 'state': False}, status=405)



@csrf_exempt
def user_log_in(request):
    if request.method == 'POST':
        # 将请求体中的数据转化为json格式
        data = json.loads(request.body.decode('utf-8'))
        # 尝试通过用户名查找用户
        filter_online_user = online_user.objects.filter(user_name=data.get('user_name'))
        # 如果用户名不存在，尝试通过邮箱查找用户
        if not filter_online_user.exists():
            filter_online_user = online_user.objects.filter(email=data.get('user_name'))  # 这里用 user_name 来作为邮箱输入
        # 检查用户是否存在
        if filter_online_user.exists():
            cur_user = filter_online_user[0]
            # 检查是否在黑名单中
            if cur_user.is_blacklisted:
                return JsonResponse({"error": "This user is blacklisted", 'state': False}, status=400)
            # 用户存在，对照密码
            if data.get('password') == cur_user.password:
                return_data = {'user_id': cur_user.user_id, 'state': True}
                return JsonResponse(return_data, status=200)
            else:
                return JsonResponse({"error": "Password is wrong", 'state': False}, status=400)
        else:
            return JsonResponse({"error": "User does not exist", 'state': False}, status=403)
    elif request.method == 'OPTIONS':
        return JsonResponse({"success": "OPTIONS operation"}, status=200)
    else:
        return JsonResponse({"error": "Method not allowed", 'state': True}, status=405)

    
@csrf_exempt
def user_change_password(request):
    if request.method == 'POST':
        # 将请求体中的数据转化为json格式
        data = json.loads(request.body.decode('utf-8'))
        print('看看data:{}'.format(data))
        filter_online_user = online_user.objects.filter(user_name=data.get('user_name'))
        # print('看看filter_online_user:{}'.format(filter_online_user))
        if (filter_online_user.exists()):
            # 用户存在开始对照密码
            cur_user =  online_user.objects.get(user_name = data.get('user_name'))
            if(data.get('email') == cur_user.email and data.get('phone_num') == cur_user.phone_num):
                online_user.objects.filter(user_name = data.get('user_name')).update(password = data.get('new_password'))
                return_data = {'state': True}
                return JsonResponse(return_data, status=200)
            else:
                return JsonResponse({"error": "information is wrong",'state': False}, status=400)
        else:
            return JsonResponse({"error": "User don't exist",'state': False}, status=403)
    elif request.method == 'OPTION':
        return JsonResponse({"success": "OPTION operation"}, status=200)
    else:
        return JsonResponse({"error": "Method not allowed",'state': True}, status=405)




