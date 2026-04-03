import requests

url = "http://43.160.252.207:16686/v1/chat/completions"
headers = {
    "Content-Type": "application/json",
    "Authorization": "Bearer any_token_to_bypass_auth_if_test"
}
data = {
    "model": "deepseek-chat",
    "messages": [{"role": "user", "content": "Say hello"}],
    "stream": True
}

try:
    response = requests.post(url, json=data, headers=headers, stream=True)
    print(f"Status Code: {response.status_code}")
    for chunk in response.iter_content(chunk_size=1024):
        if chunk:
            print(chunk.decode('utf-8', errors='ignore'), end='')
except Exception as e:
    print(f"Error: {e}")
