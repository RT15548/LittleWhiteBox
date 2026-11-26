# 随卡导出的图片

## 制作时把图放在哪

自行准备的图和助手绘制的图都从工作区选。需要画图时用助手的 `DrawImage`；已有工作区图片可用 `ReadImage` 看一眼再选用。

打开 CardFiles 的工作副本后，为图片选一个专用 `tasks/` 文件，用 CardAssets `set` 把工作区图片存成卡内图片键。同一任务可以装多张图；替换同一个键不改变前端的引用。用 `list` 找键和运行时引用，`read` 查看已有图，`remove` 移除键。读图和换图对导入的卡也一样，原作者的工作区不需要保留。

用 CardFiles 写回图片任务之后，才会修改实际角色卡。卡导出时带着图片字节和加载任务；发布前在另一份导入的卡里打开聊天，启用卡的循环任务后检查画面。已打开的聊天可以重新进入以启动新写回的加载任务。

## 运行时根据状态挑哪张图

加载任务的 `runtime.reference` 是宿主页面上的 JavaScript 表达式；它的 `url(key)` 返回可赋给 `img.src` 的 Blob URL，`get(key)` 返回 `{key,digest,mime,size}`。不存在的键返回 `undefined`。楼层 iframe 从 `window.parent` 读取同一个接口；同一张图不放进每楼的 HTML。加载任务结束时释放 URL，下一次渲染重取。

图片键是呈现选择，变量照原来的变量接口读写和恢复。用下面的示例选择晴雨场景：变量的 `travel` 根有 `weather` 字段；卡内图片分别叫 `street-clear` 和 `street-rain`。把例中的任务 ID 换成 CardAssets 返回的 `runtime.taskId`；`render` 在面板打开和原有的[变量刷新](<../references/xiaobaix-capabilities.md#state-panel-refresh>)时调用。若加载任务尚未启动，宿主页可在返回的 `runtime.readyEvent` 上重绘一次（`event.detail.taskId` 指出哪个任务已就绪）；楼层 iframe 可在本身的定时重读中重绘。

```js
function render(host, image) {
    const raw = host.SillyTavern.getContext().variables.local.get('travel');
    const travel = typeof raw === 'string' && raw ? JSON.parse(raw) : raw;
    const key = { clear: 'street-clear', rain: 'street-rain' }[travel?.weather];
    const url = key && host.LittleWhiteBoxCardAssets?.['street-scenes']?.url(key);
    if (url) image.setAttribute('src', url);
    else image.removeAttribute('src');
    image.hidden = !url;
}
```

检查进入、条件切换、变量恢复、离开再回到聊天。没有图或加载不到时，正文和玩家操作仍然可用。固定素材随卡发布；游玩中即时生成的图按它自己的聊天或存档机制处理。
