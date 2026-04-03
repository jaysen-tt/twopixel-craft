import re

with open('main.py.bak', 'r') as f:
    content = f.read()

new_chat = '''
async def handle_chat_completions(request):
    import json
    import httpx
    from aiohttp import web
    import sys
    sys.path.insert(0, "/opt/llm-proxy")
    from billing.auth import verify_token
    from billing.database import get_user_by_id
    from billing.middleware import billing_middleware
    
    try:
        body = await request.json()
    except json.JSONDecodeError:
        return web.json_response({"error": {"message": "Invalid JSON"}}, status=400)
        
    auth_header = request.headers.get("Authorization")
    user_token = auth_header[7:] if auth_header and auth_header.startswith("Bearer ") else (body.get("api_key") if "api_key" in body else None)
    
    if not user_token:
        return web.json_response({"error": {"message": "Unauthorized"}}, status=401)
        
    user_payload = verify_token(user_token)
    if not user_payload:
        return web.json_response({"error": {"message": "Invalid token"}}, status=401)
        
    user = get_user_by_id(int(user_payload["sub"]))
    if not user:
        return web.json_response({"error": {"message": "User not found"}}, status=401)
        
    model = body.get("model", "")
    is_stream = body.get("stream", False)
    
    billing_result = billing_middleware.start_request(user["id"], "litellm", model)
    if not billing_result.get("ok"):
        return web.json_response({"error": {"message": billing_result.get("error", "Billing error")}}, status=402)
        
    LITELLM_URL = "http://127.0.0.1:4000/v1/chat/completions"
    headers = {"Content-Type": "application/json", "Authorization": "Bearer dummy_key"}

    try:
        async with httpx.AsyncClient(timeout=60.0) as client:
            request_kwargs = {"method": "POST", "url": LITELLM_URL, "json": body, "headers": headers}
            
            if is_stream:
                req = client.build_request(**request_kwargs)
                resp = await client.send(req, stream=True)
                
                stream_response = web.StreamResponse(
                    status=resp.status_code,
                    headers={"Content-Type": "text/event-stream", "Cache-Control": "no-cache"}
                )
                await stream_response.prepare(request)
                
                total_tokens = 0
                async for chunk in resp.aiter_bytes():
                    await stream_response.write(chunk)
                    total_tokens += len(chunk) // 4
                    
                billing_middleware.end_request(billing_result["request_id"], prompt_tokens=0, completion_tokens=total_tokens)
                return stream_response
            else:
                resp = await client.request(**request_kwargs)
                body_bytes = await resp.aread()
                try:
                    data = json.loads(body_bytes)
                    usage = data.get("usage", {})
                    billing_middleware.end_request(billing_result["request_id"], usage.get("prompt_tokens", 0), usage.get("completion_tokens", 0))
                except:
                    billing_middleware.end_request(billing_result["request_id"], 0, len(body_bytes)//4)
                    
                return web.Response(body=body_bytes, status=resp.status_code, content_type="application/json")
                
    except Exception as e:
        billing_middleware.end_request(billing_result["request_id"], 0, 0, error=str(e))
        return web.json_response({"error": {"message": "Upstream gateway error", "details": str(e)}}, status=502)
'''

pattern = r'async def handle_chat_completions\(request\):.*?(?=async def handle_image_generations)'
match = re.search(pattern, content, re.DOTALL)
if match:
    new_content = content.replace(match.group(0), new_chat + '\n\n')
    with open('main.py.patched', 'w') as f:
        f.write(new_content)
    print('Patched successfully locally')
else:
    print('Failed to find pattern')
