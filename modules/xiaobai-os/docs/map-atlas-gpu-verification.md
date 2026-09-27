# Atlas GPU 重整验收记录

本记录对应 [Atlas 空间规格](map-atlas-geography-design.md) 的重整候选实现，不代表发布批准。基线 HEAD：`3b13de04ad92c8d6171086e13354412fa44c19d1`。最终 Map 源码指纹在 `output/playwright/atlas-candidate-source.json`。本轮不提交、不推送、不清档、不回退工作区。

## 实现与范围

- **事实所有者**：`domains/map`。新增 `space/browse.ts` 统一浏览归属，`space/composition.ts` 统一空间裁剪表达，`space/coverage.ts` 从同一投影派生底图缺口。没有新增保存字段、纹理存档或跨挂载缓存。
- **显示边界**：世界只含世界地貌、地区轮廓和地区入口；地区只含本区细节及可映射、可裁剪的世界地貌。坐标重表达不改归属；外部承载／跨越依赖只作蒙版，不获得绘制资格。路线、坐标、地点、到访和 Scene 仍是原数据。
- **AI 接口**：地图读回、维护注入和编辑反馈共享底图诊断。维护与管理员引用同一空间指引；按 `writing-model-prompts` 把环境／主体地表作为完整性的条件，并保留普通地理补全与事件事实的边界。可执行示例与 UI fixture 不是模型质量成绩。
- **渲染所有者**：`apps/map/ui/atlas/AtlasCanvas.vue` 与 `gpu-*.ts`。现有 Three.js 正交渲染、共享小纹理、网格／实例、视口 stencil；SVG 继续拥有地点交互。完整图层包含主体和装饰，避免重叠森林被去重逻辑抹平；未声明建筑群形态的单栋占地不生成成组屋顶。
- **临时资源**：当前挂载拥有 GPU 资源；离开视野淘汰对应几何，卸载、进入 Scene、切聊释放。`ui/render` 只共享像素倍率、按需帧和资源所有权三个真实共用能力，未改 Scene 模型、资产或视觉参数。
- **依赖与入口**：无新增运行依赖／远程素材；沿用 Map 注册、工具、维护和管理员入口。GPU 导入失败或上下文丢失明确报错，地点导航保留，不回退旧重纹理实现。
- **删除路径与兼容**：沿用 Map 功能删除边界。本轮不改现行文件格式；旧 Worker／瓦片／PNG／缓存从运行入口断开，但须在模型、画面和性能共同验收后删除及清理专属测试，不留作长期双实现。

游戏／moving、绘图、管理员和工作区既有构建改动不属于本轮修改范围，未撤销。没有打开或改写用户实际地图存档；数据保留由既有存储／升级回归和隔离工具回环验证，不能冒充指定用户存档实测。

## 功能与工程检查

2026-09-27 最终候选：地图与 Scene **185 项测试通过，0 失败**。新增回归只保护浏览归属、无边界承载可见、河流／桥面关系、诊断一致性、名称／人物不重建地貌、细节预算及单栋占地行为。旧纹理测试暂未删，测试总数不等于 GPU 质量证明。

执行命令：

```powershell
node --import tsx --test modules/xiaobai-os/tests/map-*.test.js modules/xiaobai-os/tests/scene-map-*.test.js
npm run lint:xiaobai-os
npm run lint:imports
npx eslint modules/xiaobai-os/tests/map-atlas-layer.test.js modules/xiaobai-os/tests/map-maintenance-participant.test.js modules/xiaobai-os/tests/map-scene-3d.test.js modules/xiaobai-os/tests/map-space.test.js
$env:XIAOBAI_OS_OUT_DIR='output/playwright/atlas-candidate-build'
npm run build:xiaobai-os
git diff --check
```

上述检查全部通过。构建包含类型检查、App、Host、Agent，验收产物只写 `output/playwright/atlas-candidate-build`，其中没有 Atlas Worker 产物。现有工作区 `dist` 的其他改动未清理或覆盖。

## 真实组件画面

依据 `frontend-design` 用实际 MapApp 而非静态设计稿检查；`playwright-cli` 驱动隔离内存 bridge，不保存用户数据。

- 自然、城市、太空、沙漠、海洋、巨构、幻想：390×844 深浅主题、放大、进入地区、更新中。另查 320×780 与 1280×720 窗口的定位和详情避让。
- 延迟 GPU 导入时有纯色地表和河流预览；没有等待 PNG 的加载孔洞。GPU 初始化失败与实际 context loss 都有错误提示，SVG 地点保留键盘导航；context loss 后 canvas 数为 0。
- 模拟 DPR 3 时 Atlas 与 Scene 实际绘制比例都为 1.8。此项是桌面浏览器模拟，不是手机性能实测。
- 无边界地区的隐形世界承载体没有被绘出，但其上的占地可见且轮廓仍正确裁剪；重叠森林前后截图留存。

原始记录：`output/playwright/atlas-visual-final.json`。截图见同目录 `atlas-*-light.png`、`atlas-*-dark.png`、`atlas-*-region-updating.png`、`atlas-detail-320.png`、`atlas-first-paint-preview.png`、`atlas-context-lost.png`、`atlas-overlap*.png`。这些是工具编译 fixture，不能称为正常 AI 补图成功。

## 性能与持续使用

环境、逐次原始数据、口径及最终汇总见 `output/playwright/atlas-final-performance-summary.json`，来源为 `atlas-comparison-final.json` 与 `browser-process-final-revision.json`。固定酒馆、山谷、舱室场景未增加物体或负载；与自然、城市、太空 Atlas 同一 390×844 窗口，各五次、每次十次交替缩放。

口径：

- 浏览器进程树工作集与 private bytes 分开采样。工作集求和可能重复计算共享页；private bytes 是提交量，不是物理驻留量。既报告总量，也报告相对卸载状态的增量。
- JS 堆使用强制 GC 后的 active-minus-released，不能替代浏览器总内存或未采样的瞬时堆峰值。
- GPU 缓冲字节可跟踪；纹理与默认 framebuffer 只估算，不包含驱动不可见分配，不能声称是真实显存总量。
- 交互使用 EventTiming 输入到下一次绘制，8ms 取整，16ms 报告下限。RAF CPU 时间另报，包含测量钩子的 GL 查询开销，不当作手机帧率。
- 预热重开对照与新浏览器首次加载分开。首次 GL 绘制命令不是显示器实际呈现，更不是所有资产完成时间。

### 同环境对照结果

Windows、HeadlessChrome 153、Intel Graphics / ANGLE D3D11、DPR 1。每个数值取该组最差值：内存取五次中的最大值，交互先取每个 fixture 五十次点击的 P95，再取三种内容的上限。没有给 Scene 增加物体、资产或渲染负载。

| 指标 | 三种 Scene 上限 | 三种 Atlas 上限 | Atlas / Scene |
| --- | ---: | ---: | ---: |
| 冷加载进程树采样峰值工作集 | 598.50 MiB | 531.31 MiB | 0.89 |
| 冷加载工作集增量（相对空浏览器） | 167.86 MiB | 108.55 MiB | 0.65 |
| 冷加载 private bytes 采样峰值 | 351.49 MiB | 279.98 MiB | 0.80 |
| 稳定工作集总量 | 588.66 MiB | 528.78 MiB | 0.90 |
| 稳定工作集增量（相对空浏览器） | 158.02 MiB | 116.71 MiB | 0.74 |
| 稳定 private bytes 增量 | 125.33 MiB | 65.03 MiB | 0.52 |
| 预热重开 JS 堆增量（active − released） | 1.04 MiB | 0.58 MiB | 0.56 |
| GPU 缓冲＋纹理／framebuffer 估算 | 11.61 MiB | 10.89 MiB | 0.94 |
| 预热交互输入至下一次绘制 P95 | 56 ms | 64 ms | 1.14 |

已取得的上述指标在 1.25 倍门槛内。首次 GL 绘制命令距导航起点：Atlas 508–713ms，Scene 541–838ms；它不是资产全部就绪或显示器呈现时间。没有测试实体手机或完整酒馆页面的全部扩展共存负载。

冷加载每轮新建独立 Chrome 进程与空 HTTP 缓存，未清系统磁盘缓存。有效收据为 `atlas-cold-final.json`，派生汇总为 `atlas-cold-performance-summary.json`。最初十轮未采到空闲基线，保留在 `atlas-cold-before-sampler-ready.json`；只重跑缺口轮次并等待采样器实际就绪，最终每类五轮均有四阶段数据，没有用估值补齐。

预热对照的浏览器工作集出现过一次后台进程数量变化及约 65MiB 的持续台阶，原样保留在 `browser-process-final-revision.json`。不使用这次台阶放宽内存门槛；表中的进程内存采用独立浏览器的冷加载／稳定采样。JS 堆、GPU 句柄和交互数据独立计量；预热三十次关闭后，上下文、buffer、texture、program 计数均为零。

中间版本的 `before-*`、`first`、`second` 文件只保留排查证据，不代替最终版本验收。原始收据位于本地被 Git 忽略的 `output/playwright`，本轮没有提交它们。

### 持续使用

最终候选连续运行 **20 分 7.2 秒**：122 次开关、732 次缩放、244 次地区切换、48 次 Scene 切换、122 次宿主式卸载切聊和 122 次真实地形编辑。使用真实 MapApp，轮换自然、城市、太空、沙漠及带 Scene 的自然地图；另验证 122 次改名不上传几何、真实地形编辑上传、空闲不绘制。错误记录为空，没有崩溃。

释放后 canvas、GL 上下文、buffer、texture、program 全部归零，317 个已建上下文全部释放。进程树工作集相对预热空闲基线下降 24.91 MiB，private bytes 下降 19.81 MiB。连续使用的第 2–5 分钟与最后 3 分钟中位数相比，工作集上升 2.41 MiB、private bytes 上升 17.00 MiB；二者关闭后都回到初始基线以下，不能把活跃期增长隐去。

强制 GC 后 JS 堆从 5,441,144 增至 7,760,756 字节（+2.21 MiB）。初始只预热了 Scene，Atlas 模块在首轮才导入，因此这不是同等模块加载状态；也不将差值全部推定为模块开销。随后在已加载 Atlas 的同一页面补做 **120 次开关**，每 30 次 GC 采样：7,764,456 → 7,871,532 → 7,918,280 → 7,916,648 → 7,937,608 字节。总增量 0.17 MiB，后 60 次增量 0.02 MiB，趋于稳定但不声称绝对零泄漏；补测结束 GPU 句柄仍全部为零，累计 437 个上下文全部释放。

原始 20 分钟收据为 `output/playwright/atlas-soak-20min.json`，含补测的完整收据为 `atlas-soak-final.json`，进程采样为 `browser-process-soak-final.json`，派生汇总为 `atlas-soak-summary.json`。测试达到本轮持续时间和操作次数要求，资源回收有实测证据；结论限于该桌面环境及覆盖内容，不外推为手机、任意复杂地图或更长使用周期的稳定性保证。

## 真实模型：未通过鉴权，非质量结果

自然、城市、太空 × 普通维护／管理员共 **6 次请求全部 HTTP 401（令牌无效），0 次工具调用，0 份成功生成地图**。使用当前配置的 Agent 供应商和模型；没有切账号、换供应商或重复购买请求。

`output/playwright/atlas-live-model/` 保存每次输入、原始请求／响应、管理员历史、隔离地图与摘要。未写入 Authorization 请求头。失败后空地图不是模型绘图成绩；现有手工 fixture 不能填补这六项缺口。

继续需要在应用内修复当前 Agent 的可用凭据，并在保留失败收据的新目录重跑这六项；不要把密钥贴到对话中。验收脚本为 `output/playwright/atlas-live-model.mjs`，再次执行前必须更换输出目录，既有收据以独占写入保护。

## 交付闸门

候选代码已接入；整体方案**尚不能标完成**。真实模型验收仍阻断发布与旧链路清理。手机、WebView、真实驱动显存总量和用户指定真实存档未实测。没有自动清档、回退、提交或推送。

恢复验收时先读取上述原始记录，修复凭据后完成模型六项；再用实际模型输出检查画面与空间事实，必要调整后重跑相应性能／生命周期检查，全部满足才替换发布构建并删除旧链路。
