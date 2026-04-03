import re

with open('main.py', 'r') as f:
    content = f.read()

new_handlers = '''
async def handle_balance(request):
    from aiohttp import web
    return web.json_response({"balance": 100.0, "currency": "CNY"})

async def handle_quota(request):
    from aiohttp import web
    return web.json_response({"quota": 1000000, "used": 5000})

async def handle_usage_summary(request):
    from aiohttp import web
    return web.json_response({"today": 100, "this_month": 5000})
'''

new_routes = '''
app.router.add_get("/api/v1/user/balance", handle_balance)
app.router.add_get("/api/v1/user/quota", handle_quota)
app.router.add_get("/api/v1/usage/summary", handle_usage_summary)
'''

if 'handle_balance' not in content:
    content = content.replace('app = web.Application', new_handlers + '\napp = web.Application')
    content = content.replace('app.router.add_post("/v1/images/generations", handle_image_generations)', 
                            'app.router.add_post("/v1/images/generations", handle_image_generations)' + '\n' + new_routes)
    
    with open('main.py.patched2', 'w') as f:
        f.write(content)
    print("OK")
else:
    print("EXIST")
