import re

with open('main.py', 'r') as f:
    content = f.read()

# Replace end_request with complete_request
content = content.replace('billing_middleware.end_request', 'billing_middleware.complete_request')

with open('main.py.patched3', 'w') as f:
    f.write(content)
