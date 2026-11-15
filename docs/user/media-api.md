# 画图与语音接口

在你自己写的卡片里，把提示词或要朗读的文字交给小白X，就能用上玩家已经配置好的画图、语音服务。提示词、参数和文字可以来自 AI、脚本或玩家输入；生成后怎么显示、怎么播放，由你的卡片决定。想让图片刷新后还在，见[保存生成结果](#保存生成结果)。

这一页写给卡作者和脚本作者。只想在聊天里配图、配音，请看 [AI 画图](draw.md) 和 [语音](tts.md)。

## 开始前

1. 在酒馆里打开小白X总开关，并开启要用的画图或语音功能。
2. 画图先在对应面板配置服务和参数；语音可以用试用音色，也可以配置自己的火山引擎账号。
3. 把下面的 HTML 示例放进由小白X渲染的卡片前端（见[代码块渲染](render.md)）。`window.parent` 就是卡片外的酒馆页面。

小白X的 srcdoc、Blob 两种 HTML 渲染方式都支持这样调用。卡片需要与酒馆同源，也就是协议、域名和端口相同；嵌入的外站网页不能直接调用。如果代码就在酒馆页面里运行（例如[循环任务](tasks.md)脚本），把 `window.parent` 换成 `window`。

## 在自己的聊天 UI 中显示图片卡

调用 `xiaobaixDraw.mountMessageImages({ element, messageId })`，小白X会在正文里的 `[image:…]` 位置显示现有图片卡。翻版本、重画、保存、放大、菜单均由小白X处理；原生聊天楼层可以隐藏，也可以尚未加载。

```js
const draw = window.parent.xiaobaixDraw;
// 在 draw.getStatus().ready 为 true、正文容器已插入页面后调用。
const images = draw.mountMessageImages({
  element: messageBody,
  messageId: 12, // 当前酒馆聊天中的消息数组下标，从 0 开始
});
await images.refresh();

// 你的 UI 替换正文后，可以主动等待图片卡重新显示。
await images.refresh();

// 移除或复用这个楼层容器前调用。
images.destroy();
```

- `element` 是当前页面或同源 iframe 中已连接的正文元素。正文须保留该楼层的图片标记；只有原文中属于该楼层的图位会被处理。小白X只替换标记及自己的图片卡，不改写其他正文节点。
- 数据更新和正文节点变化会自动刷新；多个容器显示同一楼层时，共享图片记录和所选版本。远离可视区域的楼层延后读取；`refresh()` 完成表示本次可见区域的图片记录已处理，图片文件仍由浏览器加载。
- Vue、React 等界面应把图片区域的 DOM 交给小白X管理。框架重建正文后调用 `refresh()`；复用容器展示另一楼层前销毁旧挂载，再重新挂载。
- `destroy()` 释放显示绑定，并把图片卡恢复为标记，不删除图片、不取消已经提交的画图任务。切换聊天后需要重新挂载；iframe 页面卸载时会自动释放。
- 挂载与刷新只读取现有结果，不发起绘图请求。旧图读取、缺图和生成失败沿用聊天图片卡的状态和操作。容器或楼层编号无效时抛出 `MediaApiError`，`code` 为 `invalid_request`，`field` 指明字段。

## 画图

调用 `window.parent.xiaobaixDraw.generate(request)`，得到 `{ images: Blob[] }`。`images` 是图片文件数组，一张图、多张图都用同一种方式处理。

### 可直接复制的画图示例

整段复制到卡片前端，输入提示词后点“生成”。示例使用玩家当前选择的画图服务和参数，支持取消，并显示本次返回的全部图片。

```html draw-example
<form id="draw-form">
  <label>画面描述 <textarea name="prompt" required></textarea></label>
  <button type="submit">生成</button>
  <button id="draw-cancel" type="button" disabled>取消</button>
</form>
<p id="draw-status" role="status"></p>
<div id="draw-images"></div>
<script>
(() => {
  const form = document.querySelector('#draw-form');
  const status = document.querySelector('#draw-status');
  const container = document.querySelector('#draw-images');
  const cancel = document.querySelector('#draw-cancel');
  const submit = form.querySelector('[type="submit"]');
  let controller = null;
  let pageActive = true;
  const urls = [];

  function clearImages() {
    container.replaceChildren();
    urls.splice(0).forEach(url => URL.revokeObjectURL(url));
  }

  function showImages(images) {
    clearImages();
    images.forEach((blob, index) => {
      const url = URL.createObjectURL(blob);
      urls.push(url);
      const img = document.createElement('img');
      img.src = url;
      img.alt = '生成图片 ' + (index + 1);
      img.style.maxWidth = '100%';
      container.append(img);
    });
  }

  form.onsubmit = async event => {
    event.preventDefault();
    if (!pageActive || controller) return;
    const current = new AbortController();
    controller = current;
    const isCurrent = () => pageActive && controller === current;
    submit.disabled = true;
    cancel.disabled = false;
    status.textContent = '生成中…';
    try {
      const request = {
        prompt: form.elements.prompt.value,
        signal: current.signal,
        onProgress: ({ state }) => {
          if (!isCurrent()) return;
          status.textContent = state === 'queued' ? '排队中…' : '生成中…';
        },
      };
      const { images } = await window.parent.xiaobaixDraw.generate(request);
      if (!isCurrent()) return;
      showImages(images);
      status.textContent = '完成，共 ' + images.length + ' 张图片';
    } catch (error) {
      if (!isCurrent()) return;
      if (error.partialResult?.images?.length) {
        showImages(error.partialResult.images);
      }
      status.textContent = error.code === 'aborted'
        ? '已取消' : error.message;
    } finally {
      if (isCurrent()) {
        controller = null;
        submit.disabled = false;
        cancel.disabled = true;
      }
    }
  };
  cancel.onclick = () => controller?.abort();
  window.addEventListener('pageshow', () => { pageActive = true; });
  window.addEventListener('pagehide', () => {
    pageActive = false;
    controller?.abort();
    controller = null;
    clearImages();
    submit.disabled = false;
    cancel.disabled = true;
    status.textContent = '';
  });
})();
</script>
```

示例从输入框读取 `prompt`，它不是固定的。你的脚本也可以把 AI 返回的请求对象直接传给 `generate`；如果 AI 返回的是 JSON 文本，先用 `JSON.parse` 转成对象。只想改某些参数时，把它们放进 `request.params`，不用重新填写全部配置。

### 选择服务和预设

`provider` 可填 `'novelai'`、`'sdwebui'` 或 `'comfyui'`。不填就用当前选择的服务；指定其他已配置的服务，只影响本次调用，不会替玩家切换画图面板。

用 `getPresets({ provider })` 获取该服务保存的预设；不传参数则查询当前服务。下面这段代码可以放在卡片的 `<script>` 里，查看 SD WebUI 的可选预设：

```js
(async () => {
  try {
    const presets = await window.parent.xiaobaixDraw.getPresets({
      provider: 'sdwebui',
    });
    console.table(presets.api);       // API 预设
    console.table(presets.params);    // 参数预设
    console.table(presets.workflows); // 工作流预设，只有 ComfyUI 使用
  } catch (error) {
    console.error(error.code, error.message);
  }
})();
```

每一项都有 `id`、`name` 和 `selected`（是否当前选中），不包含密钥。把选中项的 `id` 填进请求的 `apiPresetId`、`paramsPresetId` 或 `workflowPresetId` 即可；不填就沿用该服务当前的选择。

要决定显示不显示画图按钮，用 `window.parent.xiaobaixDraw.getStatus()`。它立即返回 `{ provider, enabled, ready }`：

- `provider`：当前选择的服务，没选时为 `'disabled'`。
- `enabled`：小白X总开关打开且选了服务。
- `ready`：该服务的画图模块也已加载。

`ready` 不检查 API 地址、密钥或模型有没有填好，这些缺了仍要等 `generate` 报 `not_configured`。所以“先花钱、后画图”的流程（例如先让 AI 写画面再画）不能只靠 `ready` 拦截，要准备好在画图这一步失败。

参数按这个顺序取值：**本次传入的值 → 选定预设的值 → 小白X默认值**。`0`、`false` 和空字符串不会被当成“没填”。调用不会修改保存的配置；提交后再改设置或请求对象，也不会改变正在排队的这一单。

### 画图请求字段

除 `prompt` 外都可以省略。不要把供应商文档里的其他字段直接塞进请求，下面列出的才是这个接口支持的字段。

| 字段 | 怎么填 |
| --- | --- |
| `provider` | 字符串：`'novelai' \| 'sdwebui' \| 'comfyui'`。 |
| `apiPresetId / paramsPresetId` | 字符串，从 `getPresets()` 查到的 API／参数预设 ID。 |
| `prompt` | 必填字符串，描述你要画的内容。 |
| `positivePrefix` | 字符串，放在 prompt 前面的固定提示词。不填时使用预设里的正面前缀；填 `''` 表示本次不加前缀。 |
| `negativePrompt` | 字符串，描述不希望出现的内容。不填时继承预设；填 `''` 表示本次清空负面提示词。 |
| `characterPrompts` | 数组，每个角色一项：`{ prompt?: string, uc?: string, center?: { x: number, y: number } }`。prompt 是角色描述，uc 是该角色的负面词；x、y 为 0～1 的位置坐标。NovelAI 按模型能力处理角色和位置；SD／ComfyUI 把角色文字合并进整张图的提示词，不使用位置坐标。 |
| `params` | 对象，只填要改的生成参数。各服务支持的字段见下面三张表。 |
| `overrideSize` | 字符串，使用面板里的尺寸选项，如 `'1024x1024'`。`'default'` 表示使用参数里的尺寸；在这个接口里 `'auto'` 也使用参数尺寸，不会分析提示词判断横竖图。直接填 `params.width / height` 更明确，且优先于这个选项。 |
| `signal` | `AbortSignal`，用于取消，见上面的完整示例。 |
| `onProgress` | 函数，接收 `{ state, ahead?, position? }`。state 表示当前阶段，例如 queued（排队）、generating（生成）；能收到哪些阶段取决于连接方式。它不是百分比，完成以 `await generate(...)` 返回为准。 |

### NovelAI：params

| 字段 | 类型与含义 |
| --- | --- |
| `model` | 字符串，模型 ID，填画图参数面板使用的名称。 |
| `sampler / scheduler` | 字符串，采样器／噪声调度器名称。 |
| `width / height` | 正整数，图片宽／高，单位像素。 |
| `steps / scale` | 采样步数（正整数）／提示词引导强度（数字，面板里的 CFG）。 |
| `seed` | 整数，随机种子；`-1` 表示随机。 |
| `ucPreset` | 数字，非 V5 模型的负面预设：0 Heavy、1 Light、2 Human Focus、3 None。 |
| `qualityToggle / autoSmea` | 布尔值，V4 系列的质量词开关／自动 SMEA。 |
| `cfg_rescale` | 数字，CFG 重缩放；V4 系列和 V5 可用。 |
| `variety_boost` | 布尔值，V4.5 多样性增强。 |
| `sm / sm_dyn / decrisper` | 布尔值，V3 的 SMEA／动态 SMEA／Decrisper 开关。 |
| `v5QualityPresetId` | V5 质量预设：`'standard' \| 'light' \| 'none'`。 |
| `v5UcPresetId` | V5 负面预设：`'heavy' \| 'light' \| 'furryFocus' \| 'humanFocus' \| 'none'`。 |
| `transparentBackground` | 布尔值，V5 透明背景开关。 |

选好模型后，只传该模型支持的选项；拿不准就不传，使用已保存的参数。目前 NovelAI 一次生成一张图，不支持通过这个接口传参考图或做图生图。

### SD WebUI：params

| 字段 | 类型与含义 |
| --- | --- |
| `model / sampler_name` | 字符串，模型／采样器名称。 |
| `width / height` | 正整数，图片宽／高，单位像素。 |
| `steps / cfg_scale` | 采样步数（正整数）／提示词引导强度（数字）。 |
| `seed` | 整数，随机种子；`-1` 表示随机。 |
| `batch_size / n_iter` | 正整数，每批张数／批次数。例如 batch_size 为 2、n_iter 为 1 时，一次请求生成两张图。 |
| `restore_faces / tiling` | 布尔值，面部修复／平铺纹理开关。 |
| `enable_hr` | 布尔值，开启高分辨率修复。 |
| `hr_scale / hr_upscaler` | 放大倍率（数字）／放大算法名称（字符串），配合 enable_hr 使用。 |
| `denoising_strength` | 数字，高分辨率修复时的重绘幅度。 |
| `clip_skip` | 正整数，CLIP 跳层。 |
| `positivePrefix / negativePrefix` | 字符串，预设的正面／负面前缀。本次请求另填了顶层 positivePrefix 或 negativePrompt 时，以顶层为准。 |

### ComfyUI：params 与工作流

| params 字段 | 类型与含义 |
| --- | --- |
| `model` | 字符串，模型名称，简单模式使用。 |
| `sampler / scheduler` | 字符串，采样器／调度器，简单模式使用。 |
| `steps / cfg` | 采样步数（正整数）／提示词引导强度（数字），简单模式使用。 |
| `width / height` | 正整数，图片宽／高，单位像素。自定义模式需要配置对应的尺寸节点。 |
| `positivePrefix / negativePrefix` | 字符串，正面／负面前缀；顶层 positivePrefix 或 negativePrompt 优先。自定义模式需要配置对应的提示词节点。 |

下面这些字段与 `prompt` 同级，**不放进 params**：

| 字段 | 怎么填 |
| --- | --- |
| `seed` | 0～4294967295 的整数，省略时随机。自定义模式需要配置种子节点。 |
| `workflowPresetId` | 字符串，已保存的工作流 ID。选定后使用该自定义工作流。 |
| `workflowMode` | `'simple'`（简单模式）或 `'custom'`（自定义工作流）。不填则跟随所选工作流或当前设置。 |
| `customWorkflow` | 对象，只填要覆盖的工作流内容，字段见下表。 |

| customWorkflow 字段 | 怎么填（均为字符串） |
| --- | --- |
| `json` | ComfyUI 导出的 API Format 工作流 JSON 文本；手上是对象的话，用 `JSON.stringify` 转成文本。 |
| `nodePositive / nodeNegative` | 正面／负面提示词节点 ID，例如 `'6'`、`'7'`。 |
| `nodeWidth / nodeHeight` | 宽／高节点 ID；同一节点同时有 width 和 height 时，两项填同一个 ID。 |
| `nodeSeed` | 包含 seed 或 noise_seed 输入的节点 ID。 |
| `nodeSaveImage` | 用来取结果的 SaveImage 节点 ID，返回这个节点的全部图片。 |

自定义模式下，模型、采样器、步数、参考图、批量大小等直接写在工作流 JSON 里，不放进 params。传入自己的 customWorkflow 时，同时设置 `workflowMode: 'custom'`。节点 ID 必须与这份 JSON 对应。

通过接口调用 ComfyUI 时，请在画图面板选择“浏览器直连”（ComfyUI 需要允许浏览器跨域访问），或开启“使用小白X后台任务”。接口不走酒馆的普通代理；只配置了普通代理时会返回 `not_configured`，`field` 为 `connectionMode`。调用不会替你改这些设置。

## 保存生成结果

`generate` 拿到的图片会自动收进小白X图库，归到调用开始时的角色或群聊；中途切换聊天不会改变归属。批量结果和 `error.partialResult.images` 里已取得的图片也会收录，卡片不需要再调保存接口。这些图库记录保存在当前浏览器，不随缓存到期清除，可以在图库里删除。

图库的「自动保存新生成的图片」开关同样适用于卡片：开启之后发起的生成请求，图片收进图库后会在后台保存到酒馆服务器。上传不会阻塞卡片接收图片；上传失败时会提示，图片仍留在图库，可以手动保存。开启开关不会补存旧图或已经开始的请求。

如果图库保存失败，小白X会提示，但仍把已生成的 Blob 返回给卡片，不会重新生成或扣费。

图库收录不等于恢复卡片里的显示：`generate` 返回的 Blob 引用只在当前页面有效。要让图片刷新后仍留在卡片的原位置，卡片仍需按下面的方式保存、编号和取回。下面的代码以酒馆页面为准；在卡片 iframe 里，把 `SillyTavern` 写成 `window.parent.SillyTavern`。

### 编号

用楼层当前这一页的 `send_date` 加 `swipe_id` 作编号。重新生成或换到新的 swipe 时，这一页会得到新的 `send_date`，所以旧图不会出现在新的一页上；开场白的几个备选页共用同一个 `send_date`，靠 `swipe_id` 区分。不要用楼层序号：删掉前面的楼层后，序号会变。

```js
const { chat, getCurrentChatId } = SillyTavern.getContext();
const message = chat[messageId];
const key = message.send_date + '#' + message.swipe_id;  // 同一聊天内的编号
const chatId = getCurrentChatId();                       // 跨聊天区分时加上它
```

### 只在这台设备上看：存进 IndexedDB

把 Blob 直接存进卡片自己的 IndexedDB 库，键为 `chatId` + 编号，不写聊天记录，也不上传服务器。显示时取出 Blob，用 `URL.createObjectURL` 展示，替换或离开页面时释放。换设备、换浏览器或清除浏览器数据后，图片就看不到了。

### 跨设备：存到酒馆服务器

把图片上传到酒馆的用户图片目录，再把地址按编号记进聊天元数据。图片和聊天一起保存在服务器上，登录同一账号的任何设备都能看到。

```js
const context = SillyTavern.getContext();
const base64 = await new Promise((resolve, reject) => {
  const reader = new FileReader();
  reader.onload = () => resolve(String(reader.result).split(',')[1]);
  reader.onerror = () => reject(reader.error);
  reader.readAsDataURL(blob);
});
const response = await fetch('/api/images/upload', {
  method: 'POST',
  headers: context.getRequestHeaders(),
  body: JSON.stringify({ image: base64, format: 'png', ch_name: '我的卡', filename: 'scene-' + Date.now() }),
});
if (!response.ok) throw new Error('图片保存失败');
const { path } = await response.json();  // 例如 user/images/我的卡/scene-1730000000000.png
context.chatMetadata.myCardImages ??= {};
context.chatMetadata.myCardImages[key] = path;
context.saveMetadataDebounced();
```

`format` 按 `blob.type` 填 `png`、`jpg` 或 `webp`。显示时从 `SillyTavern.getContext().chatMetadata` 按编号读出 `path`，直接作为 `img.src`。每次都重新调用 `getContext()`：切换聊天后，聊天元数据换成了另一个对象。删除时向 `/api/images/delete` 发送 `{ path }`（同样带 `getRequestHeaders()`），再删掉元数据里的这一项。

不要写进消息的 `extra.media`：那是酒馆自己的附图位，图片会显示在正文下方，开启识图时还会随聊天记录发给模型。

## 语音

调用 `window.parent.xiaobaixTts.synthesize(text, options)`，得到一个音频 `Blob`。text 是要朗读的文字，options 是可选的音色、语速等参数；不填 options 就使用当前配置。

### 可直接复制的语音示例

整段复制到卡片前端。选好音色、输入文字后点“合成”，完成后用播放器播放。示例不会自动朗读，也不会把声音插入聊天。

```html tts-example
<form id="tts-form">
  <label>音色 <select name="speaker"></select></label>
  <label>文字 <textarea name="text" required></textarea></label>
  <button type="submit">合成</button>
  <button id="tts-cancel" type="button" disabled>取消</button>
</form>
<p id="tts-status" role="status"></p>
<audio id="tts-player" controls></audio>
<script>
(() => {
  const form = document.querySelector('#tts-form');
  const status = document.querySelector('#tts-status');
  const player = document.querySelector('#tts-player');
  const cancel = document.querySelector('#tts-cancel');
  const submit = form.querySelector('[type="submit"]');
  const tts = window.parent.xiaobaixTts;
  const { voices, defaultVoice } = tts.getVoices();
  for (const voice of voices) {
    if (!voice.available) continue;
    form.elements.speaker.add(new Option(
      voice.name, voice.id, false, voice.id === defaultVoice,
    ));
  }
  let controller = null;
  let pageActive = true;
  let audioUrl = null;

  function clearAudio() {
    player.pause();
    player.removeAttribute('src');
    player.load();
    if (audioUrl) URL.revokeObjectURL(audioUrl);
    audioUrl = null;
  }

  form.onsubmit = async event => {
    event.preventDefault();
    if (!pageActive || controller) return;
    const current = new AbortController();
    controller = current;
    const isCurrent = () => pageActive && controller === current;
    submit.disabled = true;
    cancel.disabled = false;
    status.textContent = '合成中…';
    try {
      const text = form.elements.text.value;
      const options = {
        speaker: form.elements.speaker.value,
        speed: 1,
        signal: current.signal,
        onProgress: ({ receivedBytes }) => {
          if (!isCurrent()) return;
          if (receivedBytes !== undefined) {
            status.textContent = '已接收 ' + receivedBytes + ' 字节';
          }
        },
      };
      const audio = await tts.synthesize(text, options);
      if (!isCurrent()) return;
      clearAudio();
      audioUrl = URL.createObjectURL(audio);
      player.src = audioUrl;
      status.textContent = '合成完成，点击播放器播放';
    } catch (error) {
      if (!isCurrent()) return;
      status.textContent = error.code === 'aborted'
        ? '已取消' : error.message;
    } finally {
      if (isCurrent()) {
        controller = null;
        submit.disabled = false;
        cancel.disabled = true;
      }
    }
  };
  cancel.onclick = () => controller?.abort();
  window.addEventListener('pageshow', () => { pageActive = true; });
  window.addEventListener('pagehide', () => {
    pageActive = false;
    controller?.abort();
    controller = null;
    clearAudio();
    submit.disabled = false;
    cancel.disabled = true;
    status.textContent = '';
  });
})();
</script>
```

`getVoices()` 返回 `{ voices, defaultVoice }`。每个音色有 `id`、`name`、`source`（`free` 试用音色／`auth` 鉴权音色）和 `available`（当前是否可用）。把音色 id 填进 `options.speaker` 即可。

两份示例都用 `URL.createObjectURL(blob)` 生成可供 img／audio 使用的临时地址，在替换结果或离开页面时用 `URL.revokeObjectURL(url)` 释放。离开页面后，晚到的结果不会再显示。不要刚显示就释放，否则图片或音频可能还没加载完。

### 语音参数

试用音色只支持 `speaker`、`emotion`、`speed`、`signal`、`onProgress`。鉴权音色支持下面全部选项；能不能用某个情绪、语言或格式，还取决于选用的音色和模型。

| options 字段 | 类型与含义 |
| --- | --- |
| `speaker` | 字符串，音色 ID 或保存的音色名称；省略时使用当前默认音色。 |
| `resourceId` | 字符串，火山引擎资源 ID。通常不用填，会按音色选择。 |
| `model` | 字符串，语音模型名称；不填时按当前音色和“使用 TTS 1.1”设置选择。 |
| `uid` | 字符串，发给语音服务的用户标识；默认 `'st_user'`，不是 API 密钥。 |
| `format` | `'mp3' \| 'wav' \| 'pcm' \| 'ogg_opus' \| 'opus'`，默认 mp3。想用 audio 播放器直接播放，优先用 mp3 或 wav；pcm 是原始音频数据，需要自己解码。 |
| `sampleRate` | 数字，采样率（Hz），默认 24000。 |
| `speed / speechRate` | 语速，两者选一个：speed 为 0.5～2 倍速；speechRate 使用鉴权服务的语速值，0 为正常语速。不填时使用面板语速。 |
| `loudnessRate` | 数字，音量调整，默认 0。 |
| `emotion / emotionScale` | 情绪名称（字符串）／情绪强度（数字）。emotionScale 配合 emotion 使用。 |
| `contextTexts` | 字符串数组，为本次朗读提供上下文。 |
| `language / explicitLanguage` | 字符串，指定朗读语言。两者含义相同，只传一个。 |
| `disableMarkdownFilter` | 布尔值，是否关闭 Markdown 过滤。 |
| `disableEmojiFilter` | 布尔值，是否关闭表情符号过滤。 |
| `enableLanguageDetector` | 布尔值，是否开启语言检测。 |
| `maxLengthToFilterParenthesis` | 数字，过滤括号内文字的长度阈值。 |
| `postProcessPitch` | 数字，音高调整。 |
| `cacheConfig` | 对象，语音服务的缓存选项：`{ text_type?: number, use_cache?: boolean }`。不填时跟随面板里的服务端缓存设置。 |
| `signal` | `AbortSignal`，用于取消，见上面的完整示例。 |
| `onProgress` | 函数，接收 `{ state, receivedBytes? }`。state：generating 合成中、receiving 接收音频、cached 使用已缓存音频、complete 完成。receivedBytes 是已收到的音频字节数。 |

情绪强度、语言、文本过滤和音高选项不填时，沿用语音面板的配置。传入 `false` 或 `0` 时会用你传的值，不会被已保存的设置替换。

## 错误处理

调用失败会进入 `catch`。`error.message` 可以直接显示给玩家；要按错误类型分别处理，用 `error.code`。出问题的字段可能放在 `error.field` 里。

| error.code | 含义与处理 |
| --- | --- |
| `disabled` | 功能没开。检查小白X总开关和对应的画图／语音开关。 |
| `not_configured` | 缺少服务配置。到对应面板补齐 API、模型或工作流等设置。 |
| `invalid_request` | 参数值或类型不对。按字段表检查，数字不要写成字符串。 |
| `unsupported_field` | 当前服务、模型或工作流不支持这个字段。去掉该字段，或换一个支持它的服务。 |
| `preset_not_found` | 预设 ID 不存在。重新调用 getPresets，或省略 ID 使用当前选择。 |
| `invalid_result / provider_error` | 没拿到可用结果，或服务／网络出错。先检查服务端有没有出结果，避免重复生成、重复计费。 |
| `partial_result` | 只拿到了部分图片。已取得的图片在 `error.partialResult.images` 里，可以继续展示，不必整批重画。 |
| `aborted` | 调用已取消。如果带有 partialResult，也可以保留其中的图片。 |

取消方法是 `controller.abort()`，两份完整示例都已接好取消按钮。取消不一定能阻止服务端继续生成，也不代表退费。接口不会因为网络错误自动重新提交生成请求。

需要编辑器补全时，可以使用插件目录里的类型声明：画图 `modules/draw/shared/public-api.d.ts`，语音 `modules/tts/tts-external.d.ts`。
