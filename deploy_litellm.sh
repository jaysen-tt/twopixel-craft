#!/bin/bash

# Create config directory
mkdir -p /opt/litellm

# Extract existing API keys from the Python config
cat << 'CONFIG_EOF' > /opt/litellm/config.yaml
model_list:
  - model_name: deepseek-chat
    litellm_params:
      model: openai/deepseek-chat
      api_base: https://api.deepseek.com/v1
      api_key: sk-7c86a854b40d44aea8e9b83460869985
  - model_name: deepseek-coder
    litellm_params:
      model: openai/deepseek-coder
      api_base: https://api.deepseek.com/v1
      api_key: sk-7c86a854b40d44aea8e9b83460869985
  - model_name: moonshot-v1-8k
    litellm_params:
      model: openai/moonshot-v1-8k
      api_base: https://api.moonshot.cn/v1
      api_key: sk-DPPMNuxK3457f2DVuNvuU9GtdfhjdeIXRIcziyufh9v1vHQA
  - model_name: moonshot-v1-32k
    litellm_params:
      model: openai/moonshot-v1-32k
      api_base: https://api.moonshot.cn/v1
      api_key: sk-DPPMNuxK3457f2DVuNvuU9GtdfhjdeIXRIcziyufh9v1vHQA
  - model_name: qwen-turbo
    litellm_params:
      model: openai/qwen-turbo
      api_base: https://dashscope.aliyuncs.com/compatible-mode/v1
      api_key: sk-5644e25541674b1ebf290f485ef7a8f9
  - model_name: qwen-max
    litellm_params:
      model: openai/qwen-max
      api_base: https://dashscope.aliyuncs.com/compatible-mode/v1
      api_key: sk-5644e25541674b1ebf290f485ef7a8f9
  - model_name: glm-4
    litellm_params:
      model: openai/glm-4
      api_base: https://open.bigmodel.cn/api/paas/v4
      api_key: 44dbe883994349d7865a9c15834e9de2.vxq7e26JZFK2w60X
  - model_name: gemini-pro
    litellm_params:
      model: gemini/gemini-pro
      api_key: AIzaSyASa95K9T_lsWq7NMxSOdia08uqPE7_B-k

litellm_settings:
  drop_params: true
  set_verbose: false
  cache: true
  cache_params:
    type: redis
    host: 127.0.0.1
    port: 6379

router_settings:
  routing_strategy: usage-based-routing-v2
  num_retries: 2
  timeout: 60
CONFIG_EOF

cat << 'COMPOSE_EOF' > /opt/litellm/docker-compose.yml
version: '3.9'
services:
  litellm:
    image: ghcr.io/berriai/litellm:main-latest
    network_mode: "host"
    volumes:
      - ./config.yaml:/app/config.yaml
    command: [ "--config", "/app/config.yaml", "--port", "4000", "--num_workers", "8" ]
    restart: always
COMPOSE_EOF

cd /opt/litellm
docker compose up -d
