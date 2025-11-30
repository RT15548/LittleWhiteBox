FROM node:18-slim

# 安装 Camoufox 依赖和下载工具
RUN apt-get update && apt-get install -y \
    libgtk-3-0 \
    libdbus-glib-1-2 \
    libxt6 \
    libx11-xcb1 \
    libasound2 \
    libxcomposite1 \
    libxdamage1 \
    libxfixes3 \
    libxrandr2 \
    libgbm1 \
    libpango-1.0-0 \
    libcairo2 \
    libatk1.0-0 \
    libatk-bridge2.0-0 \
    libcups2 \
    libdrm2 \
    libxkbcommon0 \
    libxshmfence1 \
    fonts-liberation \
    wget \
    python3 \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# 复制 package.json
COPY package.json package-lock.json ./

# 安装依赖
RUN npm ci --only=production

# 复制应用文件
COPY server.js save-cookie.js ./

# 复制 auth 目录（包含 Cookie 文件）
COPY auth/ ./auth/

# 尝试复制本地 camoufox，如果不存在则下载
COPY camoufox* ./camoufox_local/
RUN if [ -f "./camoufox_local/camoufox" ]; then \
        echo "使用本地 camoufox"; \
        mv ./camoufox_local ./camoufox; \
    else \
        echo "下载 camoufox..."; \
        rm -rf ./camoufox_local; \
        mkdir -p camoufox; \
        wget -q https://github.com/daijro/camoufox/releases/download/v135.0.1-beta.24/camoufox-135.0.1-beta.24-lin.x86_64.zip -O camoufox.zip; \
        python3 -c "import zipfile; zipfile.ZipFile('camoufox.zip').extractall('camoufox')"; \
        rm camoufox.zip; \
    fi \
    && chmod +x ./camoufox/camoufox ./camoufox/camoufox-bin

# 环境变量 (Hugging Face Spaces 使用 7860 端口)
ENV PORT=7860
ENV NODE_ENV=production
ENV API_KEY=0709-bot
ENV DEBUG=true

EXPOSE 7860

CMD ["node", "server.js"]
