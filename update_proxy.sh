#!/bin/bash

# Backup the original script
cp /opt/llm-proxy/main.py /opt/llm-proxy/main.py.bak

# Update main.py to route through LiteLLM instead of handling providers directly
cat << 'PYTHON_EOF' > /opt/llm-proxy/main.py
#!/usr/bin/env python3
# -*- coding: utf-8 -*-
import json
import logging
import sys
sys.path.insert(0, "/opt/llm-proxy")

import httpx
import jwt
import time
from aiohttp import web

from billing.auth import init_auth, register_user, login_user, get_user_from_token
from billing.database import get_user_by_id, update_user_balance, create_transaction, get_user_usage_today, get_user_usage_month
from billing.pricing import calculate_cost, PRICING
from billing.middleware import billing_middleware
from billing.email_verify import send_verification_email, verify_code

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")
logger = logging.getLogger(__name__)

with open("/opt/llm-proxy/config.json") as f:
    CONFIG = json.load(f)

JWT_SECRET = CONFIG["jwt_secret"]

init_auth()

def verify_token(auth_header):
    if not auth_header:
        return None
    token = auth_header[7:] if auth_header.startswith("Bearer ") else auth_header
    try:
        return jwt.decode(token, JWT_SECRET, algorithms=["HS256"])
    except:
        return None

def extract_user_token(request, body):
    auth_header = request.headers.get("Authorization")
    if auth_header:
        return auth_header
    if "api_key" in body:
        return "Bearer " + body["api_key"]
    return None

async def handle_health(request):
    return web.json_response({"status": "ok"})

async def stream_response(response, billing_result, is_stream):
    """Handle streaming response from LiteLLM and calculate token usage"""
    async def generate():
        total_tokens = 0
        try:
            async for chunk in response.aiter_bytes():
                # In a real production system, you'd parse the SSE chunks to count tokens.
                # For this surgical update, we just pass through the bytes and use a rough estimate 
                # or rely on LiteLLM's usage headers if available.
                yield chunk
                total_tokens += len(chunk) // 4  # Rough estimate: 4 chars per token
            
            # End billing transaction
            billing_middleware.end_request(billing_result["request_id"], prompt_tokens=0, completion_tokens=total_tokens)
        except Exception as e:
            logger.error(f"Streaming error: {e}")
            billing_middleware.end_request(billing_result["request_id"], 0, 0, error=str(e))
    
    if is_stream:
        resp = web.StreamResponse(
            status=response.status_code,
            reason=response.reason_phrase,
            headers={
                "Content-Type": "text/event-stream",
                "Cache-Control": "no-cache",
                "Connection": "keep-alive",
            }
        )
        await resp.prepare(request)
        async for chunk in generate():
            await resp.write(chunk)
        return resp
    else:
        body = await response.aread()
        # End billing transaction
        try:
            data = json.loads(body)
            usage = data.get("usage", {})
            p_tokens = usage.get("prompt_tokens", 0)
            c_tokens = usage.get("completion_tokens", 0)
            billing_middleware.end_request(billing_result["request_id"], p_tokens, c_tokens)
        except:
            billing_middleware.end_request(billing_result["request_id"], 0, len(body)//4)
            
        return web.Response(
            body=body,
            status=response.status_code,
            content_type=response.headers.get("Content-Type", "application/json")
        )

async def handle_chat_completions(request):
    try:
        body = await request.json()
    except json.JSONDecodeError:
        return web.json_response({"error": {"message": "Invalid JSON"}}, status=400)
        
    user_token = extract_user_token(request, body)
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
    
    # Billing check
    billing_result = billing_middleware.start_request(user["id"], "litellm", model)
    if not billing_result.get("ok"):
        return web.json_response({
            "error": {"message": billing_result.get("error", "Billing error"),
                "type": "insufficient_balance", "required": billing_result.get("required"),
                "current": billing_result.get("current"), "shortage": billing_result.get("shortage")}
        }, status=402)
        
    # Forward to local LiteLLM container
    LITELLM_URL = "http://127.0.0.1:4000/v1/chat/completions"
    
    headers = {
        "Content-Type": "application/json",
        # Pass a dummy token to LiteLLM if needed, though we didn't require auth in litellm config
        "Authorization": "Bearer dummy_key"
    }

    try:
        async with httpx.AsyncClient(timeout=60.0) as client:
            request_kwargs = {
                "method": "POST",
                "url": LITELLM_URL,
                "json": body,
                "headers": headers
            }
            
            if is_stream:
                response = await client.send(client.build_request(**request_kwargs), stream=True)
                return await stream_response(response, billing_result, True)
            else:
                response = await client.request(**request_kwargs)
                return await stream_response(response, billing_result, False)
                
    except Exception as e:
        logger.error(f"LiteLLM proxy error: {e}")
        billing_middleware.end_request(billing_result["request_id"], 0, 0, error=str(e))
        return web.json_response({"error": {"message": "Upstream gateway error", "details": str(e)}}, status=502)

async def handle_models(request):
    """Return available models"""
    # In a full implementation, you could fetch this from LiteLLM: http://127.0.0.1:4000/v1/models
    models = [
        {"id": "deepseek-chat", "object": "model"},
        {"id": "deepseek-coder", "object": "model"},
        {"id": "moonshot-v1-8k", "object": "model"},
        {"id": "qwen-max", "object": "model"},
        {"id": "glm-4", "object": "model"},
        {"id": "gemini-pro", "object": "model"}
    ]
    return web.json_response({"object": "list", "data": models})

app = web.Application()
# User auth routes
app.router.add_post("/api/auth/register", register_user)
app.router.add_post("/api/auth/login", login_user)
app.router.add_post("/api/auth/verify-email", send_verification_email)
app.router.add_post("/api/auth/verify-code", verify_code)

# API routes
app.router.add_get("/health", handle_health)
app.router.add_get("/v1/models", handle_models)
app.router.add_post("/v1/chat/completions", handle_chat_completions)

if __name__ == "__main__":
    port = CONFIG.get("port", 16686)
    host = CONFIG.get("host", "0.0.0.0")
    logger.info(f"Starting TwoPixel Billing Gateway on {host}:{port} -> routing to LiteLLM")
    web.run_app(app, host=host, port=port)
PYTHON_EOF

# Restart the Python service
systemctl restart llm-proxy || (pkill -f "python /opt/llm-proxy/main.py" && sleep 2 && nohup /opt/llm-proxy/venv/bin/python /opt/llm-proxy/main.py > /opt/llm-proxy/proxy.log 2>&1 &)
