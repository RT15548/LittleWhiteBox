# LittleWhiteBox NovelAI 后端转发插件

这是 **LittleWhiteBox** 绘图模块的可选**后端插件**（SillyTavern Server Plugin）。

安装后，NovelAI 绘图的「发送方式」就能选 **后端发送**，由 SillyTavern 后端（Node）代发请求，
从而**绕过浏览器的 CORS 限制与自签证书限制**，可正常使用需要 CORS 白名单/证书受限的第三方中转端点。

> 不装此插件也能用「前端直连」；只有在浏览器直连被 CORS / 证书拦截时才需要它。

---

## 安装步骤（三步）

### 1. 放置插件文件夹
把本文件夹 `littlewhitebox-nai/` 整个复制/剪切到 SillyTavern 的 **后端插件目录**：

```
SillyTavern/plugins/littlewhitebox-nai/
```

放好后目录里应包含：`index.js`、`novelai-client.js`、`package.json`、`manifest.json`、`README.md`。

> 注意：不是 `public/scripts/extensions/`（那是前端扩展目录），而是 SillyTavern 根目录下的 `plugins/`。

### 2. 开启 server plugins
编辑 SillyTavern 根目录的 `config.yaml`，把下面这行改为 `true`（没有就新增）：

```yaml
enableServerPlugins: true
```

### 3. 重启 SillyTavern
重启后，启动日志里应出现：

```
[littlewhitebox-nai] server plugin initialized (v1.2.0)
```

回到 LittleWhiteBox 的 NovelAI 绘图设置 →「API 配置」→「发送方式」点「后端发送」，
状态栏应显示 🟢 已就绪，点「测试连接」通过即可正常生图。

---

## 提供的接口

由 SillyTavern 自动挂载到 `/api/plugins/littlewhitebox-nai/`：

| 方法 | 路径 | 说明 |
|---|---|---|
| GET | `/status` | 前端检测插件是否就绪 |
| POST | `/v1/generate-image` | 冻结的 v1.0.1 兼容入口：接收根地址并代发旧图片协议 |
| POST | `/v2/generate-image` | 接收完整图片端点和 payload，返回图片 base64 与 MIME |
| POST | `/v1/generate-image-stream` | 代发 NovelAI V5 multipart 请求并透传 MessagePack 流 |
| POST | `/v1/test` | 冻结的 v1.0.1 兼容连接测试 |
| POST | `/v2/test` | 使用前端提供的完整端点与探针 payload 测试连接 |

`v1/generate-image` 请求体：`{ url?, key, payload, insecure?, timeout }`

`v2/generate-image` 请求体：`{ url, key, payload, insecure?, timeout }`

`v1/test` 请求体：`{ url?, key, insecure?, timeout }`

`v2/test` 请求体：`{ url, key, payload, multipart?, insecure?, timeout }`

`v1/generate-image-stream` 请求体：`{ url, key, payload, insecure?, timeout }`

- v2 与 stream 请求的 `url`：前端根据当前模型解析好的完整 HTTP(S) 图片端点
- v1 请求的 `url`：正式线 v1.0.1 保存的根地址或旧完整端点
- `payload`：前端按当前模型构造的生成或连接测试报文；后端不解释模型协议
- `multipart`：连接测试是否使用 V5 multipart 传输
- `key`：NovelAI API Key
- `insecure`：为 `true` 时后端忽略 TLS 证书校验（仅连接自签证书端点时使用）
- `timeout`：沿用前端设置的请求超时，单位为毫秒

---

## 安全说明
- v2 与 stream 入口只做「把前端给定的完整 URL、payload 和 key 转发到 NovelAI/第三方端点并回传图片」，不落盘、不改配置；v1 入口仅为正式线 v1.0.1 客户端保留旧端点解析规则。
- `insecure` 只会关闭当前这一笔上游 HTTPS 请求的证书校验，请仅在信任的自签证书端点上使用。
- 浏览器取消请求或断开连接时，上游请求会同步终止；正常响应和单张图片解压结果各有 128 MiB 上限，错误响应读取上限为 1 MiB。
