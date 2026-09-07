# 插件地图：混合三维预览

打开 http://127.0.0.1:51059/（预览服务器运行期间有效），或直接双击本目录的 index.html。单文件已内嵌 three.js 0.180.0、Vue 组件、现有地图样式和本地图标字体，不需要 CDN 或模型服务。

## 这次展示的不是精修单场景

默认使用项目现有的“轨道站 · 观测舱”测试输入，不改它来迎合三维模板：

- 操作台、椅子：命中本地程序造型模板。
- 休息床：合法的 bed 图标，但本 Demo 没有 bed 三维模板，因此仍是矩形矮块。
- 观景窗：矩形占地，不擅自变成竖直玻璃窗。
- 相位场：圆形矮块，不擅自补科幻特效。
- 谐振装置：保留原五点轮廓，不以包围盒代替多边形。
- 气闸、人物：位置标记；墙体沿原路径抬升，保留入口缺口。

右侧（手机端“物件”）列出全部元素、实际支持类别和原始字段。顶部可切换项目已有的酒馆、溪谷样本，观察更多模板、闭合曲线、开放线和旋转占地。二维中的合法图标不等于三维已有模板，确定性 unknown 也不等于缺少模型。

## 接到了插件的哪部分

唯一输入是 modules/xiaobai-os/tests/fixtures/scene-maps.js 内的手写工具测试样本，**不是用户存档，不是真实模型调用结果**。

构建阶段：

1. 用现有 compileSceneIntent 将每份工具输入编译为当前 MapDomain。
2. 用 validateMapDomain 校验，并检查没有被跳过或遗漏的元素。
3. 将同一个 MapScene 同时交给真实 MapScene.vue 和候选三维渲染器。

二维直接打包生产组件 MapScene.vue / MapViewport.vue / SceneObject.vue，使用其原有手势、符号、材质、图层与样式。离线构建适配层只将地图字体 URL 换成本地同字体的内嵌 data URL，不改生产组件。

三维复用现有 sceneElementPath / sceneElementBounds / isAreaElement / isSceneObject / sortedSceneElements。形状和模板分发只读结构化字段，不分析 label 猜物品。SVGLoader 仅转换由这些几何函数生成的本地路径，不读取任意 SVG 或远程资源。

## 文件边界

- scene-data.js：Demo 的造型覆盖规则、分类说明与几何边界转换。
- room-model.js：有限造型模板、原轮廓矮块、区域/墙线/标记、选中轮廓。
- plan-view.js：真实二维组件的独立挂载，不启动 APP 业务服务。
- preview.js：场景切换、视图、相机、点选、主题和资源释放；全是临时 UI 状态。
- template.html：独立预览外壳，不是地图 APP 正式 UI 改造。
- build.mjs：现有工具编译、校验、Vue 编译和单文件构建。
- vendor/：固定 three.js 0.180.0、OrbitControls、SVGLoader、MIT 许可。
- serve.mjs：可选预览服务器，仅绑定 127.0.0.1，仅提供生成的 HTML。

在仓库根运行：

    node --import tsx output/map-interior-demo/build.mjs
    node output/map-interior-demo/serve.mjs

服务器使用空闲端口，重启后以打印的地址为准。

## 验证与局限

浏览器检查脚本位于 output/playwright/map-interior-check.js。使用 Playwright CLI 的 run-code 执行。新版检查覆盖元素/字段对应、真实二维组件、模板与缺失分类、旋转/缩放/点选、手机尺寸返回、320px 布局、触控模拟、深浅主题、无外部资源请求、WebGL 初始化失败及上下文丢失回退。实际截图为 output/playwright/map-mixed-*.png；旧的 map-interior-*.png 仅属于上一版，不是本版验收证据。

高度、桌腿、书籍、软垫、植物形态和材质细节都是本地显示预设，不是模型提供的剧情事实；地表微小叠层仅用于绘制顺序，不表示楼层或海拔。此 Demo 不证明任意场景都能正确渲染，不提供真实尺度、多层建筑、物体堆叠、碰撞、寻路或模型调用质量保证。当前树木模板仍是盆栽式造型，不能代表所有树种或室外植被。

未改真实 APP、工具契约、存档格式、生产组件、项目依赖或业务构建产物；未连接聊天、存储、模型或语音。没有新增持久化实体，删除本 Demo 目录及其预览检查/截图即可退出。手机检查是桌面浏览器的尺寸与触控模拟，不是真机 GPU 性能验收。
