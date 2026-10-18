var _="xb-os-messages",m=["image/png","image/jpeg","image/webp","image/gif"],g=4194304;function d(e){if(!e||typeof e!="object"||Array.isArray(e))throw new Error("messages_invalid_image");const r=e;if(Object.keys(r).some(a=>a!=="path"&&a!=="name")||typeof r.path!="string"||!/^\/user\/images\/xb-os-messages\/[a-f0-9]{64}\.(?:png|jpeg|webp|gif)$/u.test(r.path)||typeof r.name!="string"||!r.name.trim()||r.name.length>120||/[\u0000-\u001f\u007f]/u.test(r.name))throw new Error("messages_invalid_image");return{path:r.path,name:r.name}}function l(e){return String(e??"").replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;").replace(/'/g,"&apos;").replace(/{/g,"&#123;").replace(/}/g,"&#125;")}function u(e){return String(e??"").replace(/<(?=\/?[A-Za-z_])/g,"＜")}function f(e,r){return["  <character>",`    <name>${r(e.displayName)}</name>`,e.description?`    <description>${r(e.description)}</description>`:"",e.personality?`    <personality>${r(e.personality)}</personality>`:"",e.scenario?`    <scenario>${r(e.scenario)}</scenario>`:"","  </character>"].filter(Boolean).join(`
`)}function h(e,{economyScale:r="",escape:a=l,exampleNote:n=""}={}){return["<setting>","以下是人物与世界背景资料。",(e.exampleDialogue||e.worldInfo.extras?.exampleBefore.length||e.worldInfo.extras?.exampleAfter.length)&&n?n:"",r?`<economy_scale>
${a(r)}
</economy_scale>`:"","<player>",`  <name>${a(e.player.displayName)}</name>`,e.player.persona?`  <persona>${a(e.player.persona)}</persona>`:"","</player>",...e.characters.length?["<characters>",...e.characters.map(o=>f(o,a)),"</characters>"]:[],e.characterNote?`<character_note>${a(e.characterNote)}</character_note>`:"",e.exampleDialogue?`<example_dialogue>${a(e.exampleDialogue)}</example_dialogue>`:"",e.worldInfo.before?`<world_info_before>
${a(e.worldInfo.before)}
</world_info_before>`:"",e.worldInfo.after?`<world_info_after>
${a(e.worldInfo.after)}
</world_info_after>`:"",e.worldInfo.depth.length?`<world_info_at_depth>
${e.worldInfo.depth.map(a).join(`

`)}
</world_info_at_depth>`:"",e.worldInfo.extras?.exampleBefore.length?`<world_info_example_before>
${e.worldInfo.extras.exampleBefore.map(a).join(`

`)}
</world_info_example_before>`:"",e.worldInfo.extras?.exampleAfter.length?`<world_info_example_after>
${e.worldInfo.extras.exampleAfter.map(a).join(`

`)}
</world_info_example_after>`:"",e.worldInfo.extras?.authorNoteBefore.length?`<world_info_author_note_before>
${e.worldInfo.extras.authorNoteBefore.map(a).join(`

`)}
</world_info_author_note_before>`:"",e.worldInfo.extras?.authorNoteAfter.length?`<world_info_author_note_after>
${e.worldInfo.extras.authorNoteAfter.map(a).join(`

`)}
</world_info_author_note_after>`:"","</setting>"].filter(Boolean).join(`
`)}function p(e){return e.length?["<recent_messages>",...e.map(r=>[`  <message role="${r.role}" speaker="${l(r.speakerName)}">`,l(r.text),"  </message>"].join(`
`)),"</recent_messages>"].join(`
`):""}function w(e,{additionalSections:r=[]}={}){return["<current_state>","以下是截至捕获边界的剧情背景，只用于理解当前处境，不是本次需要续写的剧情正文。",...[e.storyEvents?`<story_events>
${l(e.storyEvents)}
</story_events>`:"",...r,p(e.recentMessages)].filter(a=>typeof a=="string"&&a.length>0),"</current_state>"].join(`
`)}var y=158e3,I=128e3,E=6e3;function c(e){const r=[],a=[];let n=-1,o=!1;for(let i=0;i<e.length;i++)e[i].sender==="user"?(n>=0&&o&&a.push(n),r.push(i),n=i,o=!1):n>=0&&(o=!0);n>=0&&o&&a.push(n);let t=Math.max(0,e.length-10);a.length&&(t=Math.min(t,a[Math.max(0,a.length-5)])),n>=0&&!o&&(t=Math.min(t,n));const s=r.filter(i=>i<=t).at(-1);return s!==void 0&&(t=s),e.slice(0,t)}var $={pending:e=>`${e} 条消息已保留，尚未确认写入主聊天。`,title:"主聊天同步",view:"查看",dismiss:"不再提示",setting:"未写入主聊天时提醒",retry:"补到主聊天",description:"重试不会再次发送消息或生成回复。「不再提示」不会删除消息；仍可从信息设置继续同步。",failed:"这次写入未完成，可以稍后重试。",operationTimeout:"暂时没收到操作结果，请先检查保存再重试。",settingsFailed:"设置未保存，请重试。",saveFailed:"还不能确认这次保存，请检查网络后重试。",saveOutdated:"原操作已经失效，不能安全重试。可以使用已保存版本；已保存的消息不会重新生成。",closed:"原记录已被修改、删除，或故事已继续。可以展开下方说明，在当前位置补记。"};function A(){return Array.from(globalThis.crypto.getRandomValues(new Uint8Array(16)),e=>e.toString(16).padStart(2,"0")).join("")}export{I as a,h as c,g as d,_ as f,E as i,l,d as m,$ as n,c as o,m as p,y as r,w as s,A as t,u};
