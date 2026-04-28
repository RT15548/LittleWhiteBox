// core/wrapper-inline.js
// iframe 内部注入脚本，同步执行，避免外部加载的时序问题

/**
 * 基础脚本：高度测量 + STscript
 * 两个渲染器共用
 */
export function getIframeBaseScript() {
    return `
(function(){
  // vh 修复：CSS注入（立即生效） + 延迟样式表遍历（不阻塞渲染）
  (function(){
    var s=document.createElement('style');
    s.textContent='html,body{height:auto!important;min-height:0!important;max-height:none!important}';
    (document.head||document.documentElement).appendChild(s);
    // 延迟遍历样式表，不阻塞初次渲染
    (window.requestIdleCallback||function(cb){setTimeout(cb,50)})(function(){
      try{
        for(var i=0,sheets=document.styleSheets;i<sheets.length;i++){
          try{
            var rules=sheets[i].cssRules;
            if(!rules)continue;
            for(var j=0;j<rules.length;j++){
              var st=rules[j].style;
              if(!st)continue;
              if((st.height||'').indexOf('vh')>-1)st.height='auto';
              if((st.minHeight||'').indexOf('vh')>-1)st.minHeight='0';
              if((st.maxHeight||'').indexOf('vh')>-1)st.maxHeight='none';
            }
          }catch(e){}
        }
      }catch(e){}
    });
  })();

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

  var parentOrigin;try{parentOrigin=new URL(document.referrer).origin}catch(_){parentOrigin='*'}
  function post(m){try{parent.postMessage(m,parentOrigin)}catch(e){}}
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
    if(parentOrigin!=='*'&&e&&e.origin!==parentOrigin)return;
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
          if(parentOrigin!=='*'&&e&&e.origin!==parentOrigin)return;
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
        var parentOrigin;try{parentOrigin=new URL(document.referrer).origin}catch(_){parentOrigin='*'}
        function post(m){try{parent.postMessage(m,parentOrigin)}catch(e){}}
        if(!options||typeof options!=='object'){reject(new Error('Invalid options'));return}
        var id=Date.now().toString(36)+Math.random().toString(36).slice(2);
        function onMessage(e){
          if(parentOrigin!=='*'&&e&&e.origin!==parentOrigin)return;
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
  var parentOrigin;try{parentOrigin=new URL(document.referrer).origin}catch(_){parentOrigin='*'}
  function requestAvatars(){try{parent.postMessage({type:'getAvatars'},parentOrigin)}catch(_){}}
  function onMessage(e){
    if(parentOrigin!=='*'&&e&&e.origin!==parentOrigin)return;
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
})();

(function(){
  var parentOrigin;
  try{parentOrigin=new URL(document.referrer).origin}catch(_){parentOrigin='*'}
  var relayMap=new Map();

  window.addEventListener('message',function(e){
    if(e.source===parent||e.source===window)return;
    var d=e.data;if(!d||typeof d!=='object')return;
    if((d.type==='runCommand'||d.type==='generateRequest')&&d.id){
      relayMap.set(d.id,e.source);
      try{parent.postMessage(d,parentOrigin)}catch(_){}
      return;
    }
    if(d.type==='getAvatars'){
      var k='_av_'+Date.now()+'_'+Math.random().toString(36).slice(2);
      relayMap.set(k,e.source);
      try{parent.postMessage(d,parentOrigin)}catch(_){}
      return;
    }
  });

  window.addEventListener('message',function(e){
    if(e.source!==parent)return;
    var d=e.data;if(!d||d.source!=='xiaobaix-host')return;
    if(d.id&&relayMap.has(d.id)){
      var child=relayMap.get(d.id);
      try{child.postMessage(d,'*')}catch(_){}
      var t=d.type;
      if(t==='commandResult'||t==='commandError'||t==='generateResult'||t==='generateError'||t==='generateStreamComplete'||t==='generateStreamError'){
        relayMap.delete(d.id);
      }
      return;
    }
    if(d.type==='avatars'){
      relayMap.forEach(function(src,key){
        if(key.indexOf('_av_')===0){try{src.postMessage(d,'*')}catch(_){}relayMap.delete(key);}
      });
    }
  });
})();

(function(){
  function isBlockedExternalPageUrl(raw){
    try{
      var target=new URL(String(raw||'').trim(),window.location.href);
      var protocol=String(target.protocol||'').toLowerCase();
      return protocol==='javascript:'||protocol==='vbscript:';
    }catch(_){
      return false;
    }
  }

  function buildInjection(){
    var code='('+function(){
      var po;try{po=new URL(document.referrer).origin}catch(_){po='*'}
      function post(m){try{parent.postMessage(m,po)}catch(_){}}
      window.STscript=window.stscript=function(cmd){
        return new Promise(function(resolve,reject){
          if(!cmd){reject(new Error('empty'));return}
          if(cmd[0]!=='/')cmd='/'+cmd;
          var id=Date.now().toString(36)+Math.random().toString(36).slice(2);
          function h(e){
            if(po!=='*'&&e.origin!==po)return;
            var d=e.data||{};if(d.source!=='xiaobaix-host')return;
            if((d.type==='commandResult'||d.type==='commandError')&&d.id===id){
              window.removeEventListener('message',h);
              d.type==='commandResult'?resolve(d.result):reject(new Error(d.error||'fail'));
            }
          }
          window.addEventListener('message',h);
          post({type:'runCommand',id:id,command:cmd});
          setTimeout(function(){window.removeEventListener('message',h);reject(new Error('timeout'))},180000);
        });
      };
      function applyAvatar(u){
        var r=document.documentElement;
        r.style.setProperty('--xb-user-avatar',u&&u.user?'url("'+u.user+'")':'none');
        r.style.setProperty('--xb-char-avatar',u&&u.char?'url("'+u.char+'")':'none');
        if(!document.getElementById('xb-avatar-style')){
          var s=document.createElement('style');s.id='xb-avatar-style';
          s.textContent='.xb-avatar,.xb-user-avatar,.xb-char-avatar{width:36px;height:36px;border-radius:50%;background-size:cover;background-position:center;background-repeat:no-repeat;display:inline-block}.xb-user-avatar{background-image:var(--xb-user-avatar)}.xb-char-avatar{background-image:var(--xb-char-avatar)}';
          document.head.appendChild(s);
        }
      }
      function reqAv(){post({type:'getAvatars'})}
      window.addEventListener('message',function f(e){
        if(po!=='*'&&e.origin!==po)return;
        var d=e.data||{};
        if(d.source==='xiaobaix-host'&&d.type==='avatars'){applyAvatar(d.urls);window.removeEventListener('message',f)}
      });
      if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',reqAv,{once:true});
      else reqAv();
    }+')()';
    return '<scr'+'ipt>'+code+'</'+'scr'+'ipt>';
  }

  window.loadExternalPage=function(url,mountId,options){
    var mount=typeof mountId==='string'?document.getElementById(mountId):mountId;
    if(!mount)return Promise.reject(new Error('mount not found'));
    var opts=options||{};
    var style='width:100%;border:none;overflow:hidden;';
    if(opts.minHeight)style+='min-height:'+opts.minHeight+';';
    else style+='min-height:800px;';

    return (async function(){
      var html=null;
      try{var r=await fetch(url);if(r.ok)html=await r.text()}catch(_){}
      if(!html){try{var r2=await fetch('/cors/'+url);if(r2.ok)html=await r2.text()}catch(_){}}
      if(!html){
        if(isBlockedExternalPageUrl(url))throw new Error('blocked url scheme');
        mount.innerHTML='<iframe src="'+String(url).replace(/"/g,'&quot;')+'" style="'+style+'"><\\/iframe>';
        return;
      }
      var inj=buildInjection();
      if(html.indexOf('<head>')>-1)html=html.replace('<head>','<head>'+inj);
      else if(html.indexOf('<HEAD>')>-1)html=html.replace('<HEAD>','<HEAD>'+inj);
      else if(/<body/i.test(html))html=html.replace(/<body/i,'<head>'+inj+'</head><body');
      else html=inj+html;
      var iframe=document.createElement('iframe');
      iframe.style.cssText=style;
      iframe.setAttribute('frameborder','0');
      iframe.setAttribute('scrolling','auto');
      mount.appendChild(iframe);
      iframe.srcdoc=html;
    })();
  };
})();`;
}
