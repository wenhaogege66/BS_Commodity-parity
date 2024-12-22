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
from django.core.exceptions import ObjectDoesNotExist
from django.views.decorators.http import require_http_methods
import jwt
from datetime import datetime, timedelta

# 添加 JWT 密钥配置
JWT_SECRET = 'your-secret-key'  # 实际应用中应该放在环境变量中
JWT_ALGORITHM = 'HS256'

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
            print("接收到的注册数据:", data)
            
            # 检查必要字段
            required_fields = ['user_name', 'email', 'password', 'phone_num']
            for field in required_fields:
                if not data.get(field):
                    return JsonResponse({
                        'state': False,
                        'error': f'缺少必要字段: {field}'
                    }, status=400)
            
            # 添加默认角色
            if 'role' not in data:
                data['role'] = 'user'
                
            if OnlineUser.objects.filter(user_name=data.get('user_name')).exists():
                return JsonResponse({"error": "用户名已存在", 'state': False}, status=403)
            if OnlineUser.objects.filter(email=data.get('email')).exists():
                return JsonResponse({"error": "邮箱已被注册", 'state': False}, status=403)
            
            try:
                user = OnlineUser(
                    user_name=data.get('user_name'),
                    email=data.get('email'),
                    phone_num=data.get('phone_num'),
                    role=data.get('role')
                )
                user.set_password(data.get('password'))
                user.save()
                
                token = jwt.encode({
                    'user_id': user.user_id,
                    'user_name': user.user_name,
                    'exp': datetime.utcnow() + timedelta(days=1)
                }, JWT_SECRET, algorithm=JWT_ALGORITHM)
                
                return JsonResponse({
                    'state': True,
                    'userInfo': {
                        'user_id': user.user_id,
                        'user_name': user.user_name,
                        'email': user.email,
                        'role': user.role,
                        'token': token
                    }
                })
            except Exception as e:
                print("创建用户时出错:", str(e))
                return JsonResponse({
                    'error': f'创建用户失败: {str(e)}',
                    'state': False
                }, status=500)
        except json.JSONDecodeError as e:
            print("JSON解析错误:", str(e))
            return JsonResponse({
                'error': '无效的请求数据格式',
                'state': False
            }, status=400)
        except Exception as e:
            print("其他错误:", str(e))
            return JsonResponse({
                'error': str(e),
                'state': False
            }, status=500)
    return JsonResponse({
        'error': "不支持的请求方法",
        'state': False
    }, status=405)


@csrf_exempt
def user_log_in(request):
    if request.method == 'POST':
        try:
            data = json.loads(request.body.decode('utf-8'))
            print(data)
            login_id = data.get('user_name')  # 可以是用户名或邮箱
            password = data.get('password')
            
            # 尝试通过用户名或邮箱查找用户
            try:
                # 使用 Q 对象实现 OR 查询
                from django.db.models import Q
                user = OnlineUser.objects.get(
                    Q(user_name=login_id) | Q(email=login_id)
                )
                
                if user.check_password(password):
                    # 生成 JWT token
                    token = jwt.encode({
                        'user_id': user.user_id,
                        'user_name': user.user_name,
                        'exp': datetime.utcnow() + timedelta(days=1)
                    }, JWT_SECRET, algorithm=JWT_ALGORITHM)
                    
                    return JsonResponse({
                        'state': True,
                        'userInfo': {
                            'user_id': user.user_id,
                            'user_name': user.user_name,
                            'email': user.email,
                            'role': user.role,
                            'token': token
                        }
                    })
                else:
                    return JsonResponse({
                        'state': False,
                        'error': '密码错误'
                    })
            except OnlineUser.DoesNotExist:
                return JsonResponse({
                    'state': False,
                    'error': '用户不存在'
                })
        except json.JSONDecodeError:
            return JsonResponse({
                'state': False,
                'error': '无效的请求数据'
            })
    else:
        return JsonResponse({
            'state': False,
            'error': '不支持的请求方法'
        })


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


@csrf_exempt
@require_http_methods(["POST"])
def add_favorite(request):
    try:
        data = json.loads(request.body)
        print("收到的数据:", data)
        user_id = data.get('user_id')
        product_id = data.get('product_id')
        platform_id = data.get('platform_id')
        price = data.get('price')
        note = data.get('note', '')
        link = data.get('link', '')

        # 获取用户
        user = OnlineUser.objects.get(user_id=user_id)

        # 获取或创建 Platform
        platform, _ = Platform.objects.get_or_create(
            platform_id=platform_id,
            defaults={
                'platform_name': data.get('article_mall', '未知平台'),
                'website_url': data.get('link', '#')
            }
        )

        # 获取或创建 Product
        product, _ = Product.objects.get_or_create(
            product_id=product_id,
            defaults={
                'name': data.get('article_title', '未知商品'),
                'description': '',
                'image_url': data.get('article_pic', ''),
                'link': data.get('link', '')
            }
        )

        # 检查是否已收藏
        if Favorite.objects.filter(user=user, product=product).exists():
            return JsonResponse({
                'status': 'error',
                'message': '该商品已在收藏夹中'
            })

        # 创建收藏记录
        favorite = Favorite.objects.create(
            user=user,
            product=product,
            platform=platform,
            price_at_favorite=price,
            note=note,
            link=link
        )

        # 创建价格历史记录
        PriceHistory.objects.create(
            product=product,
            platform=platform,
            price=price
        )

        return JsonResponse({
            'status': 'success',
            'message': '收藏成功',
            'data': {
                'favorite_id': favorite.favorite_id,
                'added_at': favorite.added_at
            }
        })

    except OnlineUser.DoesNotExist:
        return JsonResponse({
            'status': 'error',
            'message': '用户不存在'
        })
    except Exception as e:
        print("错误详情:", str(e))  # 打印具体错误信息
        return JsonResponse({
            'status': 'error',
            'message': f'收藏失败: {str(e)}'
        })

@csrf_exempt
@require_http_methods(["POST"])
def remove_favorite(request):
    try:
        data = json.loads(request.body)
        user_id = data.get('user_id')
        product_id = data.get('product_id')

        favorite = Favorite.objects.get(
            user__user_id=user_id,
            product__product_id=product_id
        )
        favorite.delete()

        return JsonResponse({
            'status': 'success',
            'message': '已从收藏夹中移除'
        })

    except Favorite.DoesNotExist:
        return JsonResponse({
            'status': 'error',
            'message': '该商品未在收藏夹中'
        })
    except Exception as e:
        return JsonResponse({
            'status': 'error',
            'message': str(e)
        })

@require_http_methods(["GET"])
def get_favorites(request):
    try:
        user_id = request.GET.get('user_id')
        favorites = Favorite.objects.filter(user__user_id=user_id).select_related('product', 'platform')
        
        favorites_data = []
        for fav in favorites:
            favorites_data.append({
                'favorite_id': fav.favorite_id,
                'product_id': fav.product.product_id,
                'link': fav.product.link,
                'product_name': fav.product.name,
                'product_image': fav.product.image_url,
                'platform_name': fav.platform.platform_name,
                'price_at_favorite': str(fav.price_at_favorite),
                'current_price': str(fav.product.price_history.latest('timestamp').price),
                'added_at': fav.added_at.strftime('%Y-%m-%d %H:%M:%S'),
                'note': fav.note
            })

        return JsonResponse({
            'status': 'success',
            'data': favorites_data
        })

    except Exception as e:
        return JsonResponse({
            'status': 'error',
            'message': str(e)
        })

# 添加一个装饰器用于验证 token
def token_required(view_func):
    def wrapper(request, *args, **kwargs):
        token = request.headers.get('Authorization')
        if not token:
            return JsonResponse({'error': 'Token is missing'}, status=401)
        
        try:
            payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
            request.user_id = payload['user_id']  # 将用户ID添加到request对象中
        except jwt.ExpiredSignatureError:
            return JsonResponse({'error': 'Token has expired'}, status=401)
        except jwt.InvalidTokenError:
            return JsonResponse({'error': 'Invalid token'}, status=401)
            
        return view_func(request, *args, **kwargs)
    return wrapper





