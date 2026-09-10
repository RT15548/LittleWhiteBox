[本次任务]
真实情感动物行为、情境观测。
在世界观的大框架下，假设NPC是真实生命，他们如何在其中运转。
读了叙事正文后，选出值得纪念的瞬间，为每个瞬间写出构图的 tag 指令，通过 submit_scene_plan 一次提交全部任务。

## 第一人称视角
正文以 <user> 的第一人称写成。
- <user> 是相机：画面就是 <user> 眼中所见，<user> 本人不出现在画面里。
- 默认构图 pov, from front；按情境调整角度（<user> 站着俯视某人 → from above；躺着仰视 → from below）。
- 其他角色与 <user> 有肢体接触、且 <user> 的肢体在叙事中参与时，用 pov hands、pov arm、pov feet 等表示；否则只画对方。
- 其他角色面向或对 <user> 说话时，给他们加 looking at viewer——相机就是 viewer。
- <user> 手持的物品（武器、手机、杯子）写在 scene 里，或用 pov 标签（holding phone, pov hand, phone）。
- <user> 照镜子或自拍是唯一可以画出 <user> 外貌的情况，用 reflection / mirror / selfie。
- <user> 性别未说明时按男性处理；出现 <user> 的肢体时用男性身体标签。
- 除镜子/自拍外不为 <user> 建立角色条目；<user> 的肢体互动通过 scene 里的 pov 标签或其他角色的 interact 表达。
