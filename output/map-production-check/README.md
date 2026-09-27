# Map APP 生产组件验收

这里用真实 MapApp、MapScene/MapScene3D、AppNavigationScope 和固定工具输入建立隔离浏览器环境。Bridge 只在内存中模拟，不连接聊天存储或模型服务。

## 2026-09-27 回退验收

地图恢复到 `5143cccf` 的地区浏览与分层搜索版本，额外保留 NPC 显示名继承及工具说明修复；不包含世界／地区地貌及其格式兼容。其他业务源码不回退。

- 地图／场景测试 130 项通过；全量 OS 测试 1535 项通过。类型检查、lint、导入检查、生产构建、独立二维构建及 `git diff --check` 通过。
- `check-regions.cjs` 的 9 组报告全部通过，包含桌面／390／320px 深浅主题、同名地点隔离、地区与地点定位、返回和切聊。
- `check-objects.cjs` 的 7 个场景及两组 128 元素负载通过；世界页没有 WebGL 画布或模型下载。静止场景停止绘制，切换二维及最终卸载后追踪的 GPU 缓冲、纹理、程序、VAO 均为零。浏览不修改地图事实。
- 已检查酒馆、溪谷、观测舱及地区／世界截图。上述结果来自桌面浏览器的生产组件隔离环境，不代表实体手机、真实模型补图、长期运行或浏览器总内存验收；未连接或改写实际存档。

## 运行方法

在仓库根目录运行 `node --import tsx output/map-production-check/build.mjs`，再用本地静态服务器打开 `output/map-production-check/dist/index.html`。构建支持动态导入；应通过 HTTP 访问。

可切换酒馆、溪谷、观测舱、旅舍起居室、厨卫间、工坊、庭院、无当前场景和空地图；`?loading=1` 模拟异步首读。新增四场景来自真实工具输入，合计覆盖 37 类；页顶的测试控件不属于正式 APP。

`?scene=regions` 使用 `tests/fixtures/map-browse.js` 的地区浏览样例。Playwright CLI `run-code --filename output/map-production-check/check-regions.cjs` 验证世界／地区／场景切换、横幅与列表范围一致、同名地点隔离、空地区、异地空场景返回、当前位置变化、地区级与具体地点级定位、切聊与零 Host 请求；覆盖地区 key 与世界层级同名、嵌套地区不扰动外层坐标，并检查桌面/390/320px 深浅主题。结果为 `window.mapRegionReport`，截图位于 `output/playwright/map-regions-*.png`。

生成 bundle 和检查日志不提交；正式运行产物仍在 `modules/xiaobai-os/dist/`。

37 类验收（下列回调默认静态服务器为 `http://127.0.0.1:8765/`）：

- `node output/map-production-check/check-2d-build.mjs`：真实二维组件及依赖独立构建，禁止引入 Three。
- Playwright CLI `run-code --filename output/map-production-check/check-objects.cjs`：7 场景、桌面/390/320px、深浅主题、二维、128 元素负载、静止停止绘制与 GPU 资源释放。结果用 `eval "window.mapObjectReport"` 读取；耗时为桌面 CPU 绘制回调，不是实体手机帧率。用新浏览器 session 运行，避免重复安装诊断包装影响测量。
- `run-code --filename output/map-production-check/check-failures.cjs`：独立页面注入 404、解析失败、延迟响应/切换/卸载、WebGL 不可用、上下文丢失、绘制异常与字体失败。结果为 `window.mapFailureReport`。
- `run-code --filename output/map-production-check/check-framing.cjs`：延迟角落落地灯的真实模型响应，验证横向桌面/390/320px 首屏无需按“全图”便能完整显示加载后的灯与名称，且加载不改变初始或用户旋转、缩放、平移后的视角。结果为 `window.mapFramingReport`。
- `run-code --filename output/map-production-check/check-map-regressions.cjs`：桌面/390/320px 下验证圆形人物与无名称的细矩形入口在手动二维及上下文丢失回退中保留标记；旋转、缩放、平移后扩展/平移/恢复 viewBox 不改变原位置点的屏幕坐标，手动全图能看到新增远端入口。并截图复查 200×200 柜子的原占地轮廓。结果为 `window.mapRegressionReport`。

上述诊断只在测试页面临时包装浏览器 API，不进入生产组件，不连接真实存档或语音/模型服务。截图、日志统一写入忽略目录 `output/playwright/`。CLI 报错时须检查输出的 `Error`，不能仅以进程退出码判定通过。

手势回归：构建后，通过 Playwright CLI 打开本页的 `?scene=tavern`，再执行 `playwright-cli -s=<session> run-code --filename output/map-production-check/check-gestures.cjs`。检查使用 Chromium 原生触摸事件，验证 390/320px 单指平移、双指旋转、捏合缩放、手势结束后恢复单指平移，以及 PC 的右键/Shift＋右键不移动地图、之后 Shift＋左键平移、松开 Shift 后左键旋转和滚轮缩放。通过屏幕上入口/人物锚点的屏幕位置判断静止、平移与旋转，不读取控制器内部状态，也不修改地图数据。右键测试只证明地图不响应，不能证明浏览器自身的后退手势被禁用。
