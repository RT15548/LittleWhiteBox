const session = require("express-session");
const cookieParser = require("cookie-parser");
const crypto = require("crypto");
const express = require("express");
const http = require("http");
const { EventEmitter } = require("events");
const fs = require("fs");
const path = require("path");
const { firefox } = require("playwright");
const os = require("os");

// 最大查询长度（token 数），单条消息超过此值则上传为文件
const MAX_QUERY_TOKENS = 3000;

// DEBUG 模式（设置 DEBUG=true 环境变量启用详细日志）
const DEBUG_MODE = process.env.DEBUG === 'true' || process.env.DEBUG === '1';

// ===================================================================================
// LOGGER MODULE
// ===================================================================================
const Logger = {
  info: (msg, ...args) =>
    console.log(`[INFO] ${new Date().toISOString()} - ${msg}`, ...args),
  warn: (msg, ...args) =>
    console.warn(`[WARN] ${new Date().toISOString()} - ${msg}`, ...args),
  error: (msg, ...args) =>
    console.error(`[ERROR] ${new Date().toISOString()} - ${msg}`, ...args),
  debug: (msg, ...args) => {
    if (DEBUG_MODE) {
      console.log(`[DEBUG] ${new Date().toISOString()} - ${msg}`, ...args);
    }
  },
};

// ===================================================================================
// AUTH SOURCE MANAGEMENT MODULE
// ===================================================================================
class AuthSource {
  constructor(logger) {
    this.logger = logger;
    this.authMode = "file";
    this.availableIndices = [];
    this.initialIndices = [];
    this.accountNameMap = new Map();

    if (process.env.AUTH_JSON_1) {
      this.authMode = "env";
      this.logger.info(
        "[Auth] 检测到 AUTH_JSON_1 环境变量，切换到环境变量认证模式。"
      );
    } else {
      this.logger.info(
        '[Auth] 未检测到环境变量认证，将使用 "auth/" 目录下的文件。'
      );
    }

    this._discoverAvailableIndices();
    this._preValidateAndFilter();

    if (this.availableIndices.length === 0) {
      this.logger.error(
        `[Auth] 致命错误：在 '${this.authMode}' 模式下未找到任何有效的认证源。`
      );
      throw new Error("No valid authentication sources found.");
    }
  }

  _discoverAvailableIndices() {
    let indices = [];
    if (this.authMode === "env") {
      const regex = /^AUTH_JSON_(\d+)$/;
      for (const key in process.env) {
        const match = key.match(regex);
        if (match) {
          indices.push(parseInt(match[1], 10));
        }
      }
    } else {
      const authDir = path.join(__dirname, "auth");
      if (fs.existsSync(authDir)) {
        const files = fs.readdirSync(authDir);
        files.forEach((file) => {
          const match = file.match(/^auth-(\d+)\.json$/);
          if (match) {
            indices.push(parseInt(match[1], 10));
          }
        });
      }
    }
    indices.sort((a, b) => a - b);
    this.logger.info(`[Auth] 发现的索引列表: [${indices.join(", ")}]`);
    this.availableIndices = indices;
    this.initialIndices = [...indices];
  }

  _preValidateAndFilter() {
    const validIndices = [];
    for (const index of this.availableIndices) {
      const auth = this.getAuth(index);
      if (auth && auth.cookies && auth.cookies.length > 0) {
        validIndices.push(index);
        const accountName =
          auth.accountName || `you_${crypto.randomBytes(4).toString("hex")}`;
        this.accountNameMap.set(index, accountName);
        this.logger.info(
          `[Auth] 索引 ${index} 有效，账户名: ${accountName}，Cookies 数量: ${auth.cookies.length}`
        );
      } else {
        this.logger.warn(
          `[Auth] 索引 ${index} 的认证数据无效或缺少 Cookies，将被跳过。`
        );
      }
    }
    this.availableIndices = validIndices;
  }

  getAuth(index) {
    try {
      let rawData;
      if (this.authMode === "env") {
        rawData = process.env[`AUTH_JSON_${index}`];
      } else {
        const filePath = path.join(__dirname, "auth", `auth-${index}.json`);
        if (fs.existsSync(filePath)) {
          rawData = fs.readFileSync(filePath, "utf-8");
        }
      }
      if (!rawData) return null;
      return JSON.parse(rawData);
    } catch (e) {
      this.logger.error(
        `[Auth] 解析认证索引 ${index} 失败: ${e.message}`
      );
      return null;
    }
  }

  getAccountName(index) {
    return this.accountNameMap.get(index) || `unknown_${index}`;
  }

  getAvailableIndices() {
    return [...this.availableIndices];
  }

  getFirstIndex() {
    return this.availableIndices.length > 0 ? this.availableIndices[0] : null;
  }
}

// ===================================================================================
// BROWSER MANAGER MODULE - Using Playwright's context.request for API calls
// ===================================================================================
class BrowserManager extends EventEmitter {
  constructor(logger, authSource) {
    super();
    this.logger = logger;
    this.authSource = authSource;
    this.browser = null;
    this.context = null;
    this.page = null;
    this.currentAuthIndex = null;
    this.requestContext = null;
  }

  async launchOrSwitchContext(authIndex) {
    this.logger.info("==================================================");
    this.logger.info(
      `[Browser] 正在初始化账号 ${authIndex} (${this.authSource.getAccountName(
        authIndex
      )}) 的上下文...`
    );
    this.logger.info("==================================================");

    const storageStateObject = this.authSource.getAuth(authIndex);
    if (!storageStateObject) {
      throw new Error(
        `Failed to get or parse auth source for index ${authIndex}.`
      );
    }

    try {
      // 如果浏览器未启动，先启动
      if (!this.browser) {
        this.logger.info("[Browser] 正在启动 Camoufox 浏览器...");
        const camoufoxPath = path.join(__dirname, "camoufox", "camoufox");
        if (!fs.existsSync(camoufoxPath)) {
          throw new Error(`Camoufox 浏览器可执行文件未找到: ${camoufoxPath}`);
        }

        this.browser = await firefox.launch({
          headless: true,
          executablePath: camoufoxPath,
          args: ["--no-remote"],
        });
        this.logger.info("[Browser] ✅ Camoufox 浏览器已启动。");
      }

      // 关闭旧的上下文
      if (this.context) {
        this.logger.info("[Browser] 正在关闭旧的浏览器上下文...");
        await this.context.close();
        this.context = null;
        this.page = null;
        this.requestContext = null;
      }

      // 创建新的上下文
      this.context = await this.browser.newContext({
        storageState: storageStateObject,
        viewport: { width: 1920, height: 1080 },
      });

      // 获取请求上下文 - 这会自动携带 Cookie
      this.requestContext = this.context.request;

      // 创建页面用于验证登录状态
      this.page = await this.context.newPage();

      this.logger.info(`[Browser] 正在验证 Cookie 有效性...`);
      const targetUrl = "https://you.com";
      await this.page.goto(targetUrl, {
        timeout: 60000,
        waitUntil: "domcontentloaded",
      });

      const currentUrl = this.page.url();
      let pageTitle = "";
      try {
        pageTitle = await this.page.title();
      } catch (e) {
        this.logger.warn(`[Browser] 无法获取页面标题: ${e.message}`);
      }

      this.logger.info(`[Browser] [诊断] URL: ${currentUrl}`);
      this.logger.info(`[Browser] [诊断] Title: "${pageTitle}"`);

      // 检查 Cookie 是否失效
      if (
        currentUrl.includes("/auth/") ||
        currentUrl.includes("/login") ||
        pageTitle.toLowerCase().includes("sign in") ||
        pageTitle.toLowerCase().includes("log in")
      ) {
        throw new Error(
          "🚨 Cookie 已失效/过期！请重新保存 Cookie。"
        );
      }

      this.currentAuthIndex = authIndex;
      this.logger.info("==================================================");
      this.logger.info(`✅ [Browser] 账号 ${authIndex} 的上下文初始化成功！`);
      this.logger.info("✅ [Browser] 浏览器代理已准备就绪。");
      this.logger.info("==================================================");
    } catch (error) {
      this.logger.error(
        `❌ [Browser] 账户 ${authIndex} 的上下文初始化失败: ${error.message}`
      );
      throw error;
    }
  }

  async closeBrowser() {
    if (this.browser) {
      this.logger.info("[Browser] 正在关闭整个浏览器实例...");
      await this.browser.close();
      this.browser = null;
      this.context = null;
      this.page = null;
      this.requestContext = null;
      this.logger.info("[Browser] 浏览器实例已关闭。");
    }
  }

  // 使用 Playwright 的 context.request API 发起请求
  async makeRequest(options) {
    if (!this.requestContext) {
      throw new Error("Browser context not initialized");
    }

    const { method, url, headers, body, timeout = 180000 } = options; // 默认 3 分钟超时
    
    this.logger.info(`[Proxy] ${method} ${url.substring(0, 150)}${url.length > 150 ? '...' : ''}`);
    this.logger.debug(`[DEBUG] 请求超时设置: ${timeout}ms`);

    try {
      const requestOptions = {
        headers: this._sanitizeHeaders(headers),
        timeout: timeout, // 添加超时设置
      };

      if (body && ["POST", "PUT", "PATCH"].includes(method)) {
        requestOptions.data = body;
      }

      this.logger.debug(`[DEBUG] 开始发送请求...`);
      const startTime = Date.now();
      
      let response;
      switch (method.toUpperCase()) {
        case "GET":
          response = await this.requestContext.get(url, requestOptions);
          break;
        case "POST":
          response = await this.requestContext.post(url, requestOptions);
          break;
        case "PUT":
          response = await this.requestContext.put(url, requestOptions);
          break;
        case "DELETE":
          response = await this.requestContext.delete(url, requestOptions);
          break;
        case "PATCH":
          response = await this.requestContext.patch(url, requestOptions);
          break;
        default:
          response = await this.requestContext.fetch(url, {
            method,
            ...requestOptions,
          });
      }

      const elapsed = Date.now() - startTime;
      this.logger.debug(`[DEBUG] 请求完成，耗时: ${elapsed}ms, 状态: ${response.status()}`);
      
      const responseBody = await response.body();
      this.logger.debug(`[DEBUG] 响应体大小: ${responseBody.length} 字节`);
      
      // DEBUG: 输出响应内容预览
      const bodyPreview = responseBody.toString().substring(0, 500);
      this.logger.debug(`[DEBUG] 响应内容预览: ${bodyPreview}${responseBody.length > 500 ? '... (已截断)' : ''}`);

      return {
        status: response.status(),
        statusText: response.statusText(),
        headers: response.headers(),
        body: responseBody,
        text: async () => responseBody.toString(),
      };
    } catch (error) {
      this.logger.error(`[Proxy] 请求失败: ${error.message}`);
      throw error;
    }
  }

  _sanitizeHeaders(headers) {
    const sanitized = { ...headers };
    const headersToRemove = [
      "host",
      "connection",
      "content-length",
      "transfer-encoding",
    ];
    headersToRemove.forEach((h) => {
      delete sanitized[h];
      delete sanitized[h.toLowerCase()];
    });
    return sanitized;
  }
}

// ===================================================================================
// REQUEST HANDLER MODULE - 支持大内容（8000+ token）处理
// ===================================================================================
class RequestHandler {
  constructor(logger, browserManager) {
    this.logger = logger;
    this.browserManager = browserManager;
    this.requestTimeout = 300000; // 5分钟超时
    this.MAX_QUERY_TOKENS = 30; // 超过此 token 数则上传文件
  }

  // 简单的 token 估算（字符数 / 4）
  _estimateTokens(text) {
    if (!text) return 0;
    return Math.ceil(text.length / 4);
  }

  // 生成随机文件名
  _generateShortFileName() {
    const prefixes = ["content", "file", "notes"];
    const prefix = prefixes[Math.floor(Math.random() * prefixes.length)];
    const day = Math.floor(Math.random() * 28) + 1; // 1-28
    const month = Math.floor(Math.random() * 12) + 1; // 1-12
    return `${prefix}${month.toString().padStart(2, "0")}${day.toString().padStart(2, "0")}`;
  }

  // 随机延迟（模拟人类行为）
  async _randomDelay() {
    const delay = 500 + Math.random() * 1500; // 0.5-2秒
    this.logger.info(`[API] 添加随机延迟: ${Math.round(delay)}ms`);
    await new Promise(resolve => setTimeout(resolve, delay));
  }

  // 添加 UTF-8 BOM
  _addUTF8BOM(content) {
    const bom = Buffer.from([0xEF, 0xBB, 0xBF]);
    return Buffer.concat([bom, Buffer.from(content, "utf8")]);
  }

  // 获取 nonce
  async _getNonce() {
    try {
      const response = await this.browserManager.makeRequest({
        method: "GET",
        url: "https://you.com/api/get_nonce",
        headers: {},
      });
      const nonce = response.body.toString().trim();
      this.logger.info(`[Upload] 获取 nonce: ${nonce.substring(0, 20)}...`);
      return nonce;
    } catch (error) {
      this.logger.error(`[Upload] 获取 nonce 失败: ${error.message}`);
      throw error;
    }
  }

  // 上传文件到 You.com
  async _uploadFile(content, filename) {
    try {
      // 获取 nonce
      await this._getNonce();

      // 使用页面内的 fetch 上传文件（需要正确的 Cookie）
      const result = await this.browserManager.page.evaluate(async ({ content, filename }) => {
        const formData = new FormData();
        const blob = new Blob([content], { type: "text/plain; charset=utf-8" });
        formData.append("file", blob, filename);

        try {
          const response = await fetch("https://you.com/api/upload", {
            method: "POST",
            body: formData,
            credentials: "include",
          });

          if (!response.ok) {
            const errorText = await response.text();
            return { error: `Upload failed: ${response.status} - ${errorText}` };
          }

          const data = await response.json();
          return { success: true, data };
        } catch (e) {
          return { error: e.message };
        }
      }, { content, filename });

      if (result.error) {
        throw new Error(result.error);
      }

      this.logger.info(`[Upload] 文件上传成功: ${result.data.filename} -> ${result.data.user_filename}`);
      return result.data;
    } catch (error) {
      this.logger.error(`[Upload] 文件上传失败: ${error.message}`);
      throw error;
    }
  }

  async handleChatRequest(req, res) {
    const requestBody = req.body;
    const isStream = requestBody.stream !== false;

    this.logger.info(
      `[API] 收到聊天请求 - Model: ${requestBody.model}, Stream: ${isStream}`
    );

    try {
      const messages = requestBody.messages || [];
      const sources = [];
      
      // 处理消息，构建聊天历史和上传大内容
      const processedData = await this._processMessages(messages, sources);
      
      // 构建请求参数
      const youApiUrl = "https://you.com/api/streamingSearch";
      const params = this._buildParams(processedData, requestBody.model, sources);

      this.logger.info(`[API] 发送请求到 You.com, 参数长度: ${params.toString().length}`);

      // 添加随机延迟 (0.5-2秒)，模拟人类操作间隔
      const delay = 500 + Math.random() * 1500;
      this.logger.info(`[API] 等待 ${Math.round(delay)}ms 后发送请求...`);
      await new Promise(resolve => setTimeout(resolve, delay));

      // 发送请求 (流式响应可能需要较长时间，设置 3 分钟超时)
      const response = await this.browserManager.makeRequest({
        method: "GET",
        url: `${youApiUrl}?${params.toString()}`,
        headers: {
          "Accept": "text/event-stream",
          "Accept-Language": "en-US,en;q=0.9",
          "Cache-Control": "no-cache",
          "Referer": "https://you.com/search?q=&fromSearchBar=true&tbm=youchat",
        },
        timeout: 180000, // 3 分钟超时，因为需要等待完整的流式响应
      });

      if (response.status !== 200) {
        const errorText = response.body.toString();
        this.logger.error(`[API] You.com 返回错误: ${response.status} - ${errorText.substring(0, 500)}`);
        return res.status(response.status).json({
          error: {
            message: `You.com API error: ${errorText.substring(0, 200)}`,
            type: "api_error",
            code: response.status,
          },
        });
      }

      if (isStream) {
        res.setHeader("Content-Type", "text/event-stream");
        res.setHeader("Cache-Control", "no-cache");
        res.setHeader("Connection", "keep-alive");
        res.setHeader("X-Accel-Buffering", "no");

        await this._handleStreamResponse(response, res, requestBody);
      } else {
        const fullResponse = await this._handleNonStreamResponse(response, requestBody);
        res.json(fullResponse);
      }
    } catch (error) {
      this.logger.error(`[API] 请求处理失败: ${error.message}`);
      if (!res.headersSent) {
        res.status(500).json({
          error: {
            message: error.message,
            type: "internal_error",
          },
        });
      }
    }
  }

  // 处理消息 - 按照 bohesocool 方式: chatHistory 数组 + q 参数是最后一条消息
  async _processMessages(messages, sources) {
    // 将所有 system 消息合并到第一条 user 消息中
    const mergedMessages = this._convertSystemToUserMessages(messages);
    
    // 处理消息为 chatHistory 数组和最终查询
    return await this._processMessagesAsChat(mergedMessages, sources);
  }
  
  // 将 system 消息合并到第一条 user 消息中（bohesocool 的 convertSystemToUserMessages）
  _convertSystemToUserMessages(messages) {
    if (!messages || messages.length === 0) {
      return [];
    }
    
    // 收集所有 system 消息的内容
    let systemContents = [];
    let otherMessages = [];
    
    for (const msg of messages) {
      if (msg.role === "system") {
        const content = typeof msg.content === "string" ? msg.content : JSON.stringify(msg.content);
        if (content.trim()) {
          systemContents.push(content);
        }
      } else {
        otherMessages.push(msg);
      }
    }
    
    // 如果没有 system 消息，直接返回原消息
    if (systemContents.length === 0) {
      return otherMessages;
    }
    
    // 合并 system 内容
    const mergedSystemContent = systemContents.join("\n");
    
    // 找到第一条 user 消息并将 system 内容合并进去
    let result = [];
    let mergedSystem = false;
    
    for (const msg of otherMessages) {
      if (!mergedSystem && msg.role === "user") {
        const userContent = typeof msg.content === "string" ? msg.content : JSON.stringify(msg.content);
        result.push({
          role: "user",
          content: mergedSystemContent + "\n\n" + userContent
        });
        mergedSystem = true;
      } else {
        result.push(msg);
      }
    }
    
    // 如果没有 user 消息，将 system 内容作为第一条 user 消息
    if (!mergedSystem) {
      result.unshift({
        role: "user",
        content: mergedSystemContent
      });
    }
    
    this.logger.debug(`[DEBUG] System 消息已合并到第一条 user 消息中`);
    return result;
  }
  
  // 处理消息为 chatHistory 格式 (bohesocool 方式)
  async _processMessagesAsChat(messages, sources) {
    const chatHistory = [];
    
    if (!messages || messages.length === 0) {
      return { chatHistory: [], finalQuery: "" };
    }
    
    // 最后一条消息的内容作为 q 参数
    const lastMessage = messages[messages.length - 1];
    let finalQuery = typeof lastMessage.content === "string" 
      ? lastMessage.content 
      : JSON.stringify(lastMessage.content);
    
    // 检查最后一条消息是否需要上传为文件
    const lastTokens = this._estimateTokens(finalQuery);
    if (lastTokens > this.MAX_QUERY_TOKENS) {
      const shortName = this._generateShortFileName();
      const filename = `${shortName}.txt`;
      const uploadResp = await this._uploadFile(finalQuery, filename);
      
      sources.push({
        source_type: "user_file",
        filename: uploadResp.filename,
        user_filename: uploadResp.user_filename,
        size_bytes: finalQuery.length,
      });
      
      // 替换为文件引用提示
      finalQuery = this._generateFileReferencePrompt(uploadResp.user_filename);
      this.logger.info(`[API] 最后消息 (${lastTokens} tokens) 已上传为文件: ${uploadResp.user_filename}`);
    }
    
    // 处理前面的消息为 chatHistory
    const historyMessages = messages.slice(0, -1);
    let currentQuestion = "";
    let currentAnswer = "";
    
    for (let i = 0; i < historyMessages.length; i++) {
      const msg = historyMessages[i];
      const content = typeof msg.content === "string" ? msg.content : JSON.stringify(msg.content);
      
      if (msg.role === "user") {
        // 如果已有问答对，先保存
        if (currentQuestion && currentAnswer) {
          const entry = await this._processHistoryEntry(currentQuestion, currentAnswer, sources);
          chatHistory.push(entry);
          currentQuestion = "";
          currentAnswer = "";
        }
        
        // 累积连续的 user 消息
        if (currentQuestion) {
          currentQuestion += "\n" + content;
        } else {
          currentQuestion = content;
        }
      } else if (msg.role === "assistant") {
        // 累积连续的 assistant 消息
        if (currentAnswer) {
          currentAnswer += "\n" + content;
        } else {
          currentAnswer = content;
        }
      }
    }
    
    // 处理最后一组未完成的问答
    if (currentQuestion && currentAnswer) {
      const entry = await this._processHistoryEntry(currentQuestion, currentAnswer, sources);
      chatHistory.push(entry);
    } else if (currentQuestion) {
      // 有问题没答案的情况（可能发生在对话中间）
      // 将其与最后的 query 合并
      finalQuery = currentQuestion + "\n" + finalQuery;
    }
    
    this.logger.info(`[API] 处理完成: chatHistory=${chatHistory.length}条, finalQuery=${finalQuery.length}字符`);
    this.logger.debug(`[DEBUG] chatHistory: ${JSON.stringify(chatHistory, null, 2).substring(0, 500)}`);
    
    return { chatHistory, finalQuery };
  }
  
  // 生成文件引用提示 (bohesocool 风格)
  _generateFileReferencePrompt(filename) {
    const prompts = [
      // 中文 (bohesocool 原版风格)
      `查看这个文件并且直接与文件内容进行聊天：${filename}`,
      `请阅读${filename}并回复里面的内容`,
      `${filename}包含我的问题，请查看并回答`,
      `我把内容放在${filename}了，请处理`,
      `请查看${filename}中的内容并回复`,
      // 英文
      `Please read and respond to the content in ${filename}`,
      `Check ${filename} and reply to what's inside`,
      `I've put my message in ${filename}, please respond`,
      `See ${filename} for my full question`,
      `The file ${filename} contains my request, please handle it`,
    ];
    return prompts[Math.floor(Math.random() * prompts.length)];
  }

  // 处理单个历史条目
  async _processHistoryEntry(question, answer, sources) {
    let processedQuestion = question;
    let processedAnswer = answer;

    // 处理长问题
    const questionTokens = this._estimateTokens(question);
    if (questionTokens > this.MAX_QUERY_TOKENS && question) {
      const shortName = this._generateShortFileName();
      const filename = `${shortName}.txt`;
      const uploadResp = await this._uploadFile(question, filename);
      
      sources.push({
        source_type: "user_file",
        filename: uploadResp.filename,
        user_filename: uploadResp.user_filename,
        size_bytes: question.length,
      });
      
      processedQuestion = this._generateFileReferencePrompt(uploadResp.user_filename);
    }

    // 处理长回答
    const answerTokens = this._estimateTokens(answer);
    if (answerTokens > this.MAX_QUERY_TOKENS && answer) {
      const shortName = this._generateShortFileName();
      const filename = `${shortName}.txt`;
      const uploadResp = await this._uploadFile(answer, filename);
      
      sources.push({
        source_type: "user_file",
        filename: uploadResp.filename,
        user_filename: uploadResp.user_filename,
        size_bytes: answer.length,
      });
      
      processedAnswer = this._generateFileReferencePrompt(uploadResp.user_filename);
    }

    return {
      question: processedQuestion,
      answer: processedAnswer,
    };
  }

  // 构建 API 参数
  _buildParams(processedData, model, sources) {
    const { chatHistory, finalQuery } = processedData;
    
    const params = new URLSearchParams();
    params.append("q", finalQuery);
    params.append("page", "1");
    params.append("count", "10");
    params.append("safeSearch", "Off");
    params.append("mkt", "en-US");
    params.append("domain", "youchat");
    params.append("use_personalization_extraction", "false");
    params.append("queryTraceId", crypto.randomUUID());
    params.append("chatId", crypto.randomUUID());
    params.append("conversationTurnId", crypto.randomUUID());
    params.append("pastChatLength", chatHistory.length.toString());
    params.append("selectedChatMode", "custom");
    params.append("enable_agent_clarification_questions", "true");
    params.append("use_nested_youchat_updates", "true");

    if (chatHistory.length > 0) {
      params.append("chat", JSON.stringify(chatHistory));
    }

    // 添加 sources
    if (sources.length > 0) {
      params.append("sources", JSON.stringify(sources));
    }

    const youModel = this._mapModel(model);
    if (youModel !== "default") {
      params.append("selectedAiModel", youModel);
    }

    // DEBUG: 输出发送到 You.com 的完整请求格式
    this.logger.debug(`[DEBUG] ===== 发送到 You.com 的请求参数 =====`);
    this.logger.debug(`[DEBUG] 查询 (q): ${finalQuery}`);
    this.logger.debug(`[DEBUG] 模型: ${model} -> ${youModel}`);
    this.logger.debug(`[DEBUG] 历史记录条数: ${chatHistory.length}`);
    if (chatHistory.length > 0) {
      this.logger.debug(`[DEBUG] 历史记录内容: ${JSON.stringify(chatHistory, null, 2).substring(0, 500)}${JSON.stringify(chatHistory).length > 500 ? '... (已截断)' : ''}`);
    }
    this.logger.debug(`[DEBUG] Sources 数量: ${sources.length}`);
    if (sources.length > 0) {
      this.logger.debug(`[DEBUG] Sources 内容: ${JSON.stringify(sources, null, 2)}`);
    }
    this.logger.debug(`[DEBUG] 完整 URL 参数长度: ${params.toString().length} 字符`);
    this.logger.debug(`[DEBUG] ===== 请求参数结束 =====`);

    return params;
  }

  _mapModel(model) {
    const modelMap = {
      // OpenAI 系列
      "[you]gpt-5.1-instant": "gpt_5_1_instant",
      "[you]gpt-5.1-thinking": "gpt_5_1_thinking",
      "[you]gpt-5": "gpt_5",
      "[you]o3-pro": "openai_o3_pro",
      "[you]gpt-4o": "gpt_4o",
      // Google 系列
      "[you]gemini-3-pro": "gemini_3_pro",
      // Anthropic 系列
      "[you]claude-4.5-sonnet-thinking": "claude_4_5_sonnet_thinking",
      "[you]claude-4.5-sonnet": "claude_4_5_sonnet",
      "[you]claude-4.1-opus-thinking": "claude_4_1_opus_thinking",
      "[you]claude-4.1-opus": "claude_4_1_opus",
      // 其他
      "[you]grok-4": "grok_4",
      "[you]qwen3-235b": "qwen3_235b",
      "[you]deepseek-r1": "deepseek_r1",
      "[you]deepseek-v3": "deepseek_v3",
      "default": "default",
    };
    return modelMap[model] || "default";
  }

  _calculateContentLength(messages) {
    if (!messages || !Array.isArray(messages)) return 0;
    return messages.reduce((total, msg) => {
      const content = typeof msg.content === "string" ? msg.content : JSON.stringify(msg.content);
      return total + content.length;
    }, 0);
  }

  async _handleStreamResponse(response, res, requestBody) {
    const bodyText = response.body.toString();
    const lines = bodyText.split("\n");

    const chatId = `chatcmpl-${crypto.randomUUID()}`;
    const created = Math.floor(Date.now() / 1000);
    let tokenCount = 0;

    for (const line of lines) {
      if (line.startsWith("data: ")) {
        try {
          const data = JSON.parse(line.slice(6));
          if (data.youChatToken) {
            tokenCount++;
            const chunk = {
              id: chatId,
              object: "chat.completion.chunk",
              created: created,
              model: requestBody.model || "you.com",
              choices: [
                {
                  index: 0,
                  delta: {
                    content: data.youChatToken,
                  },
                  finish_reason: null,
                },
              ],
            };
            res.write(`data: ${JSON.stringify(chunk)}\n\n`);
          }
        } catch (e) {
          // 忽略无法解析的行
        }
      }
    }

    this.logger.info(`[API] 流式响应完成，共 ${tokenCount} 个 token 块`);

    // 发送结束标记
    const finalChunk = {
      id: chatId,
      object: "chat.completion.chunk",
      created: created,
      model: requestBody.model || "you.com",
      choices: [
        {
          index: 0,
          delta: {},
          finish_reason: "stop",
        },
      ],
    };
    res.write(`data: ${JSON.stringify(finalChunk)}\n\n`);
    res.write("data: [DONE]\n\n");
    res.end();
  }

  async _handleNonStreamResponse(response, requestBody) {
    const bodyText = response.body.toString();
    const lines = bodyText.split("\n");

    let fullContent = "";
    let tokenCount = 0;

    for (const line of lines) {
      if (line.startsWith("data: ")) {
        try {
          const data = JSON.parse(line.slice(6));
          if (data.youChatToken) {
            fullContent += data.youChatToken;
            tokenCount++;
          }
        } catch (e) {
          // 忽略无法解析的行
        }
      }
    }

    this.logger.info(`[API] 非流式响应完成，内容长度: ${fullContent.length} 字符`);

    // 估算 token 数量（粗略：1 token ≈ 4 字符）
    const estimatedPromptTokens = Math.ceil(this._calculateContentLength(requestBody.messages) / 4);
    const estimatedCompletionTokens = Math.ceil(fullContent.length / 4);

    return {
      id: `chatcmpl-${crypto.randomUUID()}`,
      object: "chat.completion",
      created: Math.floor(Date.now() / 1000),
      model: requestBody.model || "you.com",
      choices: [
        {
          index: 0,
          message: {
            role: "assistant",
            content: fullContent,
          },
          finish_reason: "stop",
        },
      ],
      usage: {
        prompt_tokens: estimatedPromptTokens,
        completion_tokens: estimatedCompletionTokens,
        total_tokens: estimatedPromptTokens + estimatedCompletionTokens,
      },
    };
  }
}

// ===================================================================================
// EXPRESS APP SETUP
// ===================================================================================
async function main() {
  const app = express();
  const server = http.createServer(app);

  const PORT = process.env.PORT || 3000;
  const API_KEY = process.env.API_KEY || "";
  const SESSION_SECRET =
    process.env.SESSION_SECRET || crypto.randomBytes(32).toString("hex");

  // 中间件
  app.use(express.json({ limit: "50mb" }));
  app.use(express.urlencoded({ extended: true }));
  app.use(cookieParser());
  app.use(
    session({
      secret: SESSION_SECRET,
      resave: false,
      saveUninitialized: false,
      cookie: { secure: false, maxAge: 24 * 60 * 60 * 1000 },
    })
  );

  // 初始化组件
  const authSource = new AuthSource(Logger);
  const browserManager = new BrowserManager(Logger, authSource);
  const requestHandler = new RequestHandler(Logger, browserManager);

  // 启动浏览器
  const firstIndex = authSource.getFirstIndex();
  if (firstIndex !== null) {
    await browserManager.launchOrSwitchContext(firstIndex);
  }

  // API Key 验证中间件
  const authenticateApiKey = (req, res, next) => {
    if (!API_KEY) return next();
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ error: { message: "Missing API key" } });
    }
    const providedKey = authHeader.substring(7);
    if (providedKey !== API_KEY) {
      return res.status(401).json({ error: { message: "Invalid API key" } });
    }
    next();
  };

  // 路由
  app.get("/", (req, res) => {
    res.json({
      status: "ok",
      message: "You2API Proxy Server",
      endpoints: {
        chat: "/v1/chat/completions",
        models: "/v1/models",
      },
    });
  });

  app.get("/v1/models", authenticateApiKey, (req, res) => {
    res.json({
      object: "list",
      data: [
        // OpenAI 系列
        { id: "[you]gpt-5.1-instant", object: "model", created: Date.now(), owned_by: "you.com" },
        { id: "[you]gpt-5.1-thinking", object: "model", created: Date.now(), owned_by: "you.com" },
        { id: "[you]gpt-5", object: "model", created: Date.now(), owned_by: "you.com" },
        { id: "[you]o3-pro", object: "model", created: Date.now(), owned_by: "you.com" },
        { id: "[you]gpt-4o", object: "model", created: Date.now(), owned_by: "you.com" },
        // Google 系列
        { id: "[you]gemini-3-pro", object: "model", created: Date.now(), owned_by: "you.com" },
        // Anthropic 系列
        { id: "[you]claude-4.5-sonnet-thinking", object: "model", created: Date.now(), owned_by: "you.com" },
        { id: "[you]claude-4.5-sonnet", object: "model", created: Date.now(), owned_by: "you.com" },
        { id: "[you]claude-4.1-opus-thinking", object: "model", created: Date.now(), owned_by: "you.com" },
        { id: "[you]claude-4.1-opus", object: "model", created: Date.now(), owned_by: "you.com" },
        // 其他
        { id: "[you]grok-4", object: "model", created: Date.now(), owned_by: "you.com" },
        { id: "[you]qwen3-235b", object: "model", created: Date.now(), owned_by: "you.com" },
        { id: "[you]deepseek-r1", object: "model", created: Date.now(), owned_by: "you.com" },
        { id: "[you]deepseek-v3", object: "model", created: Date.now(), owned_by: "you.com" },
      ],
    });
  });

  app.post("/v1/chat/completions", authenticateApiKey, async (req, res) => {
    await requestHandler.handleChatRequest(req, res);
  });

  // 管理页面
  app.get("/admin", (req, res) => {
    const accounts = authSource.getAvailableIndices().map((idx) => ({
      index: idx,
      name: authSource.getAccountName(idx),
      active: idx === browserManager.currentAuthIndex,
    }));

    res.send(`
<!DOCTYPE html>
<html>
<head>
  <title>You2API Admin</title>
  <style>
    body { font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px; }
    h1 { color: #333; }
    .account { padding: 10px; margin: 10px 0; border: 1px solid #ddd; border-radius: 5px; }
    .account.active { background: #e6ffe6; border-color: #4CAF50; }
    button { padding: 5px 15px; cursor: pointer; }
    .status { margin-top: 20px; padding: 10px; background: #f0f0f0; border-radius: 5px; }
  </style>
</head>
<body>
  <h1>You2API 管理面板</h1>
  <h2>已配置的账户</h2>
  ${accounts.map((acc) => `
    <div class="account ${acc.active ? "active" : ""}">
      <strong>${acc.name}</strong> (索引: ${acc.index})
      ${acc.active ? " - 当前激活" : ""}
    </div>
  `).join("")}
  <div class="status">
    <h3>服务状态</h3>
    <p>当前账户索引: ${browserManager.currentAuthIndex}</p>
    <p>浏览器状态: ${browserManager.browser ? "运行中" : "未启动"}</p>
  </div>
</body>
</html>
    `);
  });

  // 启动服务器
  server.listen(PORT, "0.0.0.0", () => {
    Logger.info(`==========================================`);
    Logger.info(`You2API Proxy Server 已启动`);
    Logger.info(`监听地址: http://0.0.0.0:${PORT}`);
    Logger.info(`API 端点: http://0.0.0.0:${PORT}/v1/chat/completions`);
    Logger.info(`管理面板: http://0.0.0.0:${PORT}/admin`);
    Logger.info(`==========================================`);
  });

  // 优雅关闭
  process.on("SIGINT", async () => {
    Logger.info("正在关闭服务器...");
    await browserManager.closeBrowser();
    server.close(() => {
      Logger.info("服务器已关闭");
      process.exit(0);
    });
  });

  process.on("SIGTERM", async () => {
    Logger.info("正在关闭服务器...");
    await browserManager.closeBrowser();
    server.close(() => {
      Logger.info("服务器已关闭");
      process.exit(0);
    });
  });
}

main().catch((error) => {
  Logger.error(`启动失败: ${error.message}`);
  process.exit(1);
});
