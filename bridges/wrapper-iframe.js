(function(){
  function defineCallGenerate(){
    function sanitizeOptions(options){
      try{
        return JSON.parse(JSON.stringify(options,function(k,v){return(typeof v==='function')?undefined:v}))
      }catch(_){
        try{
          const seen=new WeakSet();
          const clone=(val)=>{
            if(val===null||val===undefined)return val;
            const t=typeof val;
            if(t==='function')return undefined;
            if(t!=='object')return val;
            if(seen.has(val))return undefined;
            seen.add(val);
            if(Array.isArray(val)){
              const arr=[];for(let i=0;i<val.length;i++){const v=clone(val[i]);if(v!==undefined)arr.push(v)}return arr;
            }
            const proto=Object.getPrototypeOf(val);
            if(proto!==Object.prototype&&proto!==null)return undefined;
            const out={};
            for(const k in val){if(Object.prototype.hasOwnProperty.call(val,k)){const v=clone(val[k]);if(v!==undefined)out[k]=v}}
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
            else if(d.type==='generateStreamComplete'){try{window.removeEventListener('message',onMessage)}catch(_){}
              resolve(d.result)}
            else if(d.type==='generateStreamError'){try{window.removeEventListener('message',onMessage)}catch(_){}
              reject(new Error(d.error||'Stream failed'))}
            else if(d.type==='generateResult'){try{window.removeEventListener('message',onMessage)}catch(_){}
              resolve(d.result)}
            else if(d.type==='generateError'){try{window.removeEventListener('message',onMessage)}catch(_){}
              reject(new Error(d.error||'Generation failed'))}
          }
          try{window.addEventListener('message',onMessage)}catch(_){}
          var sanitized=sanitizeOptions(options);
          post({type:'generateRequest',id:id,options:sanitized});
          setTimeout(function(){try{window.removeEventListener('message',onMessage)}catch(e){};reject(new Error('Generation timeout'))},300000);
        }catch(e){reject(e)}
      })
    }
    try{window.CallGenerate=CallGenerateImpl}catch(e){}
    try{window.callGenerate=CallGenerateImpl}catch(e){}
    try{window.__xb_callGenerate_loaded=true}catch(e){}
  }
  try{defineCallGenerate()}catch(e){}
})();

(function(){
  function applyAvatarCss(urls){
    try{
      const root=document.documentElement;
      root.style.setProperty('--xb-user-avatar',urls&&urls.user?`url("${urls.user}")`:'none');
      root.style.setProperty('--xb-char-avatar',urls&&urls.char?`url("${urls.char}")`:'none');
      if(!document.getElementById('xb-avatar-style')){
        const css=`
          .xb-avatar,.xb-user-avatar,.xb-char-avatar{
            width:36px;height:36px;border-radius:50%;
            background-size:cover;background-position:center;background-repeat:no-repeat;
            display:inline-block
          }
          .xb-user-avatar{background-image:var(--xb-user-avatar)}
          .xb-char-avatar{background-image:var(--xb-char-avatar)}
        `;
        const style=document.createElement('style');
        style.id='xb-avatar-style';
        style.textContent=css;
        document.head.appendChild(style);
      }
    }catch(_){}
  }
  function requestAvatars(){
    try{parent.postMessage({type:'getAvatars'},'*')}catch(_){}
  }
  function onMessage(e){
    const d=e&&e.data||{};
    if(d&&d.source==='xiaobaix-host'&&d.type==='avatars'){
      applyAvatarCss(d.urls);
      try{window.removeEventListener('message',onMessage)}catch(_){}
    }
  }
  try{
    window.addEventListener('message',onMessage);
    if(document.readyState==='loading'){
      document.addEventListener('DOMContentLoaded',requestAvatars,{once:true});
    }else{
      requestAvatars();
    }
    window.addEventListener('load',requestAvatars,{once:true});
  }catch(_){}
})();