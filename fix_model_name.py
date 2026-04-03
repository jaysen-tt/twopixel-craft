import re

with open('main.py', 'r') as f:
    content = f.read()

# Add a model alias mapping logic right before the LiteLLM request
model_mapping_logic = '''
    # Handle model name aliases from old clients
    model = body.get("model", "")
    if model == "deepseek-proxy":
        model = "deepseek-chat"
        body["model"] = "deepseek-chat"
    elif model == "deepseek-coder-proxy":
        model = "deepseek-coder"
        body["model"] = "deepseek-coder"
        
    is_stream = body.get("stream", False)
'''

# Replace the original model assignment
content = content.replace('    model = body.get("model", "")\n    is_stream = body.get("stream", False)', model_mapping_logic)

with open('main.py.patched5', 'w') as f:
    f.write(content)
