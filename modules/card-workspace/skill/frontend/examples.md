# 前端示例索引

先按前端承担的职责选择例子。路径从插件目录算起，用 Read 打开；读取示例不会安装或执行它。

## 一体游玩界面：解铃会成品

[解铃会经营版](<examples/jieling.md>)是作者完成版的完整卡工程：场景入口、正文阅读、行动条与输入、案头状态、经营按钮和聊天图片操作都在同一界面内，底层使用酒馆聊天与小白X变量。按钮提交经营结算，流水与账本反映实际收支。

做主要游玩界面时从这个例子看完整过程，再读[一体界面参考](<../references/xiaobaix-heavy-ui.md>)确认宿主衔接与生命周期。示例中的美术、布局和经营规则属于解铃会；按自己的题材设计，不把它们当固定模板。

## 普通聊天与只读案卷

[雾港证物审理](<../../../variables/state3/skill/references/examples/wugang.md>)由玩家在聊天框输入行动，变量更新模型负责前后两阶段，楼层面板只展示案卷。需要“正常聊天加状态展示”时读这个例子，不把展示层写成另一套结算入口。

## 本楼展示与单项组件

- `docs/user/render.md`：AI 回复或开场白里的 HTML 代码块怎样变成楼层网页，以及怎样执行命令、调用生成、取得楼号。
- `docs/user/template.md`：把每楼输出填进固定版式，生成过程中实时更新。
- `docs/user/media-api.md`：“在自己的聊天 UI 中显示图片卡”说明一体界面怎样挂载已有聊天图片；`html draw-example` 和 `html tts-example` 演示独立画图、语音请求及取消、失败和结果显示。

## 变量结算教学

这些例子讲结算与回执，面板只是操作载体，不用它们代替一体界面的体验设计：

- `modules/variables/state3/skill/references/examples/camp/`：变量 3.0 动作提交与条件失败反馈。
- `modules/variables/state3/skill/references/examples/jieling.md`：按周经营的解铃会结算教学卡，讲前后阶段、派生值、随机数与一次性奖励。它与上面按日经营的成品是两套独立规则，文件分别成套使用。
- `modules/variables/state2/skill/references/examples/state2-direct/`：变量 2.0 初始化与面板直接写入。
