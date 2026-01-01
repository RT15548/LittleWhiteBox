// core/wrapper-inline.js
// iframe 内部注入脚本，同步执行，避免外部加载的时序问题

/**
 * 基础脚本：高度测量 + STscript
 * 两个渲染器共用
 */
export function getIframeBaseScript() {
    return `
(function(){
  function measureVisibleHeight(){
    try{
      var doc=document,target=doc.body;
      if(!target)return 0;
      var minTop=Infinity,maxBottom=0;
      var addRect=function(el){
        try{
          var r=el.getBoundingClientRect();
          if(r&&r.height>0){
            if(minTop>r.top)minTop=r.top;
            if(maxBottom<r.bottom)maxBottom=r.bottom;
          }
        }catch(e){}
      };
      addRect(target);
      var children=target.children||[];
      for(var i=0;i<children.length;i++){
        var child=children[i];
        if(!child)continue;
        try{
          var s=window.getComputedStyle(child);
          if(s.display==='none'||s.visibility==='hidden')continue;
          if(!child.offsetParent&&s.position!=='fixed')continue;
        }catch(e){}
        addRect(child);
      }
      return maxBottom>0?Math.ceil(maxBottom-Math.min(minTop,0)):(target.scrollHeight||0);
    }catch(e){
      return(document.body&&document.body.scrollHeight)||0;
    }
  }

  function post(m){try{parent.postMessage(m,'*')}catch(e){}}
  var rafPending=false,lastH=0,HYSTERESIS=2;

  function send(force){
    if(rafPending&&!force)return;
    rafPending=true;
    requestAnimationFrame(function(){
      rafPending=false;
      var h=measureVisibleHeight();
      if(force||Math.abs(h-lastH)>=HYSTERESIS){
        lastH=h;
        post({height:h,force:!!force});
      }
    });
  }

  try{send(true)}catch(e){}
  document.addEventListener('DOMContentLoaded',function(){send(true)},{once:true});
  window.addEventListener('load',function(){send(true)},{once:true});

  try{
    if(document.fonts){
      document.fonts.ready.then(function(){send(true)}).catch(function(){});
      if(document.fonts.addEventListener){
        document.fonts.addEventListener('loadingdone',function(){send(true)});
        document.fonts.addEventListener('loadingerror',function(){send(true)});
      }
    }
  }catch(e){}

  ['transitionend','animationend'].forEach(function(evt){
    document.addEventListener(evt,function(){send(false)},{passive:true,capture:true});
  });

  try{
    var root=document.body||document.documentElement;
    var ro=new ResizeObserver(function(){send(false)});
    ro.observe(root);
  }catch(e){
    try{
      var rootMO=document.body||document.documentElement;
      new MutationObserver(function(){send(false)})
        .observe(rootMO,{childList:true,subtree:true,attributes:true,characterData:true});
    }catch(e){}
    window.addEventListener('resize',function(){send(false)},{passive:true});
  }

  window.addEventListener('message',function(e){
    var d=e&&e.data||{};
    if(d&&d.type==='probe')setTimeout(function(){send(true)},10);
  });

  window.STscript=function(command){
    return new Promise(function(resolve,reject){
      try{
        if(!command){reject(new Error('empty'));return}
        if(command[0]!=='/')command='/'+command;
        var id=Date.now().toString(36)+Math.random().toString(36).slice(2);
        function onMessage(e){
          var d=e&&e.data||{};
          if(d.source!=='xiaobaix-host')return;
          if((d.type==='commandResult'||d.type==='commandError')&&d.id===id){
            try{window.removeEventListener('message',onMessage)}catch(e){}
            if(d.type==='commandResult')resolve(d.result);
            else reject(new Error(d.error||'error'));
          }
        }
        try{window.addEventListener('message',onMessage)}catch(e){}
        post({type:'runCommand',id:id,command:command});
        setTimeout(function(){
          try{window.removeEventListener('message',onMessage)}catch(e){}
          reject(new Error('Command timeout'));
        },180000);
      }catch(e){reject(e)}
    });
  };
  try{if(typeof window['stscript']!=='function')window['stscript']=window.STscript}catch(e){}
})();`;
}

/**
 * CallGenerate + Avatar
 * 提供 callGenerate() 函数供角色卡调用
 */
export function getWrapperScript() {
    return `
(function(){
  function sanitizeOptions(options){
    try{
      return JSON.parse(JSON.stringify(options,function(k,v){return(typeof v==='function')?undefined:v}))
    }catch(_){
      try{
        var seen=new WeakSet();
        var clone=function(val){
          if(val===null||val===undefined)return val;
          var t=typeof val;
          if(t==='function')return undefined;
          if(t!=='object')return val;
          if(seen.has(val))return undefined;
          seen.add(val);
          if(Array.isArray(val)){
            var arr=[];for(var i=0;i<val.length;i++){var v=clone(val[i]);if(v!==undefined)arr.push(v)}return arr;
          }
          var proto=Object.getPrototypeOf(val);
          if(proto!==Object.prototype&&proto!==null)return undefined;
          var out={};
          for(var k in val){if(Object.prototype.hasOwnProperty.call(val,k)){var v=clone(val[k]);if(v!==undefined)out[k]=v}}
          return out;
        };
        return clone(options);
      }catch(__){return{}}
    }
  }
  function CallGenerateImpl(options){
    return new Promise(function(resolve,reject){
      try{
        function post(m){try{parent.postMessage(m,'*')}catch(e){}}
        if(!options||typeof options!=='object'){reject(new Error('Invalid options'));return}
        var id=Date.now().toString(36)+Math.random().toString(36).slice(2);
        function onMessage(e){
          var d=e&&e.data||{};
          if(d.source!=='xiaobaix-host'||d.id!==id)return;
          if(d.type==='generateStreamStart'&&options.streaming&&options.streaming.onStart){try{options.streaming.onStart(d.sessionId)}catch(_){}}
          else if(d.type==='generateStreamChunk'&&options.streaming&&options.streaming.onChunk){try{options.streaming.onChunk(d.chunk,d.accumulated)}catch(_){}}
          else if(d.type==='generateStreamComplete'){try{window.removeEventListener('message',onMessage)}catch(_){}resolve(d.result)}
          else if(d.type==='generateStreamError'){try{window.removeEventListener('message',onMessage)}catch(_){}reject(new Error(d.error||'Stream failed'))}
          else if(d.type==='generateResult'){try{window.removeEventListener('message',onMessage)}catch(_){}resolve(d.result)}
          else if(d.type==='generateError'){try{window.removeEventListener('message',onMessage)}catch(_){}reject(new Error(d.error||'Generation failed'))}
        }
        try{window.addEventListener('message',onMessage)}catch(_){}
        var sanitized=sanitizeOptions(options);
        post({type:'generateRequest',id:id,options:sanitized});
        setTimeout(function(){try{window.removeEventListener('message',onMessage)}catch(e){};reject(new Error('Generation timeout'))},300000);
      }catch(e){reject(e)}
    });
  }
  try{window.CallGenerate=CallGenerateImpl}catch(e){}
  try{window.callGenerate=CallGenerateImpl}catch(e){}
  try{window.__xb_callGenerate_loaded=true}catch(e){}
})();

(function(){
  function applyAvatarCss(urls){
    try{
      var root=document.documentElement;
      root.style.setProperty('--xb-user-avatar',urls&&urls.user?'url("'+urls.user+'")':'none');
      root.style.setProperty('--xb-char-avatar',urls&&urls.char?'url("'+urls.char+'")':'none');
      if(!document.getElementById('xb-avatar-style')){
        var css='.xb-avatar,.xb-user-avatar,.xb-char-avatar{width:36px;height:36px;border-radius:50%;background-size:cover;background-position:center;background-repeat:no-repeat;display:inline-block}.xb-user-avatar{background-image:var(--xb-user-avatar)}.xb-char-avatar{background-image:var(--xb-char-avatar)}';
        var style=document.createElement('style');
        style.id='xb-avatar-style';
        style.textContent=css;
        document.head.appendChild(style);
      }
    }catch(_){}
  }
  function requestAvatars(){try{parent.postMessage({type:'getAvatars'},'*')}catch(_){}}
  function onMessage(e){
    var d=e&&e.data||{};
    if(d&&d.source==='xiaobaix-host'&&d.type==='avatars'){
      applyAvatarCss(d.urls);
      try{window.removeEventListener('message',onMessage)}catch(_){}
    }
  }
  try{
    window.addEventListener('message',onMessage);
    if(document.readyState==='loading'){document.addEventListener('DOMContentLoaded',requestAvatars,{once:true});}
    else{requestAvatars();}
    window.addEventListener('load',requestAvatars,{once:true});
  }catch(_){}
})();`;
}

/**
 * 模板变量更新（template-editor 独有）
 */
export function getTemplateExtrasScript() {
    return `
(function(){
  if(typeof window.updateTemplateVariables!=='function'){
    window.updateTemplateVariables=function(variables){
      try{
        Object.entries(variables||{}).forEach(function(entry){
          var k=entry[0],v=entry[1];
          document.querySelectorAll('[data-xiaobaix-var="'+k+'"]').forEach(function(el){
            if(v==null)el.textContent='';
            else if(Array.isArray(v))el.textContent=v.join(', ');
            else if(typeof v==='object')el.textContent=JSON.stringify(v);
            else el.textContent=String(v);
            el.style.display='';
          });
        });
      }catch(e){}
      try{window.dispatchEvent(new Event('contentUpdated'))}catch(e){}
    };
  }
})();`;
}