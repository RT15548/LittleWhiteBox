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

放好后目录里应包含：`index.js`、`package.json`、`manifest.json`、`README.md`。

> 注意：不是 `public/scripts/extensions/`（那是前端扩展目录），而是 SillyTavern 根目录下的 `plugins/`。

### 2. 开启 server plugins
编辑 SillyTavern 根目录的 `config.yaml`，把下面这行改为 `true`（没有就新增）：

```yaml
enableServerPlugins: true
```

### 3. 重启 SillyTavern
重启后，启动日志里应出现：

```
[littlewhitebox-nai] server plugin initialized (v1.0.0)
```

回到 LittleWhiteBox 的 NovelAI 绘图设置 →「API 配置」→「发送方式」点「后端发送」，
状态栏应显示 🟢 已就绪，点「测试连接」通过即可正常生图。

---

## 提供的接口

由 SillyTavern 自动挂载到 `/api/plugins/littlewhitebox-nai/`：

| 方法 | 路径 | 说明 |
|---|---|---|
| GET | `/status` | 前端检测插件是否就绪 |
| POST | `/generate-image` | 代发 NovelAI 生图请求，返回图片 base64 |
| POST | `/test` | 测试第三方端点连通性 |

`generate-image` / `test` 请求体：`{ url?, key, payload?, insecure? }`
- `url`：第三方端点根地址（留空 = 官方 `https://image.novelai.net`）
- `key`：NovelAI API Key
- `insecure`：为 `true` 时后端忽略 TLS 证书校验（仅连接自签证书端点时使用）

---

## 安全说明
- 本插件只做「把前端给定的 payload + key 转发到 NovelAI/第三方端点并回传图片」，不落盘、不改配置。
- `insecure` 会在单次请求内临时放宽 TLS 校验，请仅在信任的自签证书端点上使用。
