function Ei(){return`
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
})();`}function Ci(){return`
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
})();`}function _i(){return`
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
})();`}function ne(){return window.location.origin}function xi(){return ne()}function Si(e,n,r,o=null){if(!e?.contentWindow)return!1;const i=r?{source:r,...n}:n,l=o||ne();return e.contentWindow.postMessage(i,l),!0}function pn(e,n){return!!n&&e.origin===ne()&&e.source===n.contentWindow}function Oi(e,n,r){return!(!pn(e,n)||r&&e?.data?.source!==r)}function Ce(e){return typeof e>"u"||e===null}function dn(e){return typeof e=="object"&&e!==null}function sn(e){return Array.isArray(e)?e:Ce(e)?[]:[e]}function hn(e,n){var r,o,i,l;if(n)for(l=Object.keys(n),r=0,o=l.length;r<o;r+=1)i=l[r],e[i]=n[i];return e}function mn(e,n){var r="",o;for(o=0;o<n;o+=1)r+=e;return r}function gn(e){return e===0&&Number.NEGATIVE_INFINITY===1/e}var A={isNothing:Ce,isObject:dn,toArray:sn,repeat:mn,isNegativeZero:gn,extend:hn};function _e(e,n){var r="",o=e.reason||"(unknown reason)";return e.mark?(e.mark.name&&(r+='in "'+e.mark.name+'" '),r+="("+(e.mark.line+1)+":"+(e.mark.column+1)+")",!n&&e.mark.snippet&&(r+=`

`+e.mark.snippet),o+" "+r):o}function F(e,n){Error.call(this),this.name="YAMLException",this.reason=e,this.mark=n,this.message=_e(this,!1),Error.captureStackTrace?Error.captureStackTrace(this,this.constructor):this.stack=new Error().stack||""}F.prototype=Object.create(Error.prototype);F.prototype.constructor=F;F.prototype.toString=function(n){return this.name+": "+_e(this,n)};var C=F;function $(e,n,r,o,i){var l="",t="",a=Math.floor(i/2)-1;return o-n>a&&(l=" ... ",n=o-a+l.length),r-o>a&&(t=" ...",r=o+a-t.length),{str:l+e.slice(n,r).replace(/\t/g,"→")+t,pos:o-n+l.length}}function V(e,n){return A.repeat(" ",n-e.length)+e}function vn(e,n){if(n=Object.create(n||null),!e.buffer)return null;n.maxLength||(n.maxLength=79),typeof n.indent!="number"&&(n.indent=1),typeof n.linesBefore!="number"&&(n.linesBefore=3),typeof n.linesAfter!="number"&&(n.linesAfter=2);for(var r=/\r?\n|\r|\0/g,o=[0],i=[],l,t=-1;l=r.exec(e.buffer);)i.push(l.index),o.push(l.index+l[0].length),e.position<=l.index&&t<0&&(t=o.length-2);t<0&&(t=o.length-1);var a="",u,c,p=Math.min(e.line+n.linesAfter,i.length).toString().length,f=n.maxLength-(n.indent+p+3);for(u=1;u<=n.linesBefore&&!(t-u<0);u++)c=$(e.buffer,o[t-u],i[t-u],e.position-(o[t]-o[t-u]),f),a=A.repeat(" ",n.indent)+V((e.line-u+1).toString(),p)+" | "+c.str+`
`+a;for(c=$(e.buffer,o[t],i[t],e.position,f),a+=A.repeat(" ",n.indent)+V((e.line+1).toString(),p)+" | "+c.str+`
`,a+=A.repeat("-",n.indent+p+3+c.pos)+`^
`,u=1;u<=n.linesAfter&&!(t+u>=i.length);u++)c=$(e.buffer,o[t+u],i[t+u],e.position-(o[t]-o[t+u]),f),a+=A.repeat(" ",n.indent)+V((e.line+u+1).toString(),p)+" | "+c.str+`
`;return a.replace(/\n$/,"")}var yn=vn,wn=["kind","multi","resolve","construct","instanceOf","predicate","represent","representName","defaultStyle","styleAliases"],An=["scalar","sequence","mapping"];function bn(e){var n={};return e!==null&&Object.keys(e).forEach(function(r){e[r].forEach(function(o){n[String(o)]=r})}),n}function En(e,n){if(n=n||{},Object.keys(n).forEach(function(r){if(wn.indexOf(r)===-1)throw new C('Unknown option "'+r+'" is met in definition of "'+e+'" YAML type.')}),this.options=n,this.tag=e,this.kind=n.kind||null,this.resolve=n.resolve||function(){return!0},this.construct=n.construct||function(r){return r},this.instanceOf=n.instanceOf||null,this.predicate=n.predicate||null,this.represent=n.represent||null,this.representName=n.representName||null,this.defaultStyle=n.defaultStyle||null,this.multi=n.multi||!1,this.styleAliases=bn(n.styleAliases||null),An.indexOf(this.kind)===-1)throw new C('Unknown kind "'+this.kind+'" is specified for "'+e+'" YAML type.')}var b=En;function ue(e,n){var r=[];return e[n].forEach(function(o){var i=r.length;r.forEach(function(l,t){l.tag===o.tag&&l.kind===o.kind&&l.multi===o.multi&&(i=t)}),r[i]=o}),r}function Cn(){var e={scalar:{},sequence:{},mapping:{},fallback:{},multi:{scalar:[],sequence:[],mapping:[],fallback:[]}},n,r;function o(i){i.multi?(e.multi[i.kind].push(i),e.multi.fallback.push(i)):e[i.kind][i.tag]=e.fallback[i.tag]=i}for(n=0,r=arguments.length;n<r;n+=1)arguments[n].forEach(o);return e}function z(e){return this.extend(e)}z.prototype.extend=function(n){var r=[],o=[];if(n instanceof b)o.push(n);else if(Array.isArray(n))o=o.concat(n);else if(n&&(Array.isArray(n.implicit)||Array.isArray(n.explicit)))n.implicit&&(r=r.concat(n.implicit)),n.explicit&&(o=o.concat(n.explicit));else throw new C("Schema.extend argument should be a Type, [ Type ], or a schema definition ({ implicit: [...], explicit: [...] })");r.forEach(function(l){if(!(l instanceof b))throw new C("Specified list of YAML types (or a single Type object) contains a non-Type object.");if(l.loadKind&&l.loadKind!=="scalar")throw new C("There is a non-scalar type in the implicit list of a schema. Implicit resolving of such types is not supported.");if(l.multi)throw new C("There is a multi type in the implicit list of a schema. Multi tags can only be listed as explicit.")}),o.forEach(function(l){if(!(l instanceof b))throw new C("Specified list of YAML types (or a single Type object) contains a non-Type object.")});var i=Object.create(z.prototype);return i.implicit=(this.implicit||[]).concat(r),i.explicit=(this.explicit||[]).concat(o),i.compiledImplicit=ue(i,"implicit"),i.compiledExplicit=ue(i,"explicit"),i.compiledTypeMap=Cn(i.compiledImplicit,i.compiledExplicit),i};var xe=z,Se=new b("tag:yaml.org,2002:str",{kind:"scalar",construct:function(e){return e!==null?e:""}}),Oe=new b("tag:yaml.org,2002:seq",{kind:"sequence",construct:function(e){return e!==null?e:[]}}),Te=new b("tag:yaml.org,2002:map",{kind:"mapping",construct:function(e){return e!==null?e:{}}}),Le=new xe({explicit:[Se,Oe,Te]});function _n(e){if(e===null)return!0;var n=e.length;return n===1&&e==="~"||n===4&&(e==="null"||e==="Null"||e==="NULL")}function xn(){return null}function Sn(e){return e===null}var ke=new b("tag:yaml.org,2002:null",{kind:"scalar",resolve:_n,construct:xn,predicate:Sn,represent:{canonical:function(){return"~"},lowercase:function(){return"null"},uppercase:function(){return"NULL"},camelcase:function(){return"Null"},empty:function(){return""}},defaultStyle:"lowercase"});function On(e){if(e===null)return!1;var n=e.length;return n===4&&(e==="true"||e==="True"||e==="TRUE")||n===5&&(e==="false"||e==="False"||e==="FALSE")}function Tn(e){return e==="true"||e==="True"||e==="TRUE"}function Ln(e){return Object.prototype.toString.call(e)==="[object Boolean]"}var Ie=new b("tag:yaml.org,2002:bool",{kind:"scalar",resolve:On,construct:Tn,predicate:Ln,represent:{lowercase:function(e){return e?"true":"false"},uppercase:function(e){return e?"TRUE":"FALSE"},camelcase:function(e){return e?"True":"False"}},defaultStyle:"lowercase"});function kn(e){return 48<=e&&e<=57||65<=e&&e<=70||97<=e&&e<=102}function In(e){return 48<=e&&e<=55}function Mn(e){return 48<=e&&e<=57}function Rn(e){if(e===null)return!1;var n=e.length,r=0,o=!1,i;if(!n)return!1;if(i=e[r],(i==="-"||i==="+")&&(i=e[++r]),i==="0"){if(r+1===n)return!0;if(i=e[++r],i==="b"){for(r++;r<n;r++)if(i=e[r],i!=="_"){if(i!=="0"&&i!=="1")return!1;o=!0}return o&&i!=="_"}if(i==="x"){for(r++;r<n;r++)if(i=e[r],i!=="_"){if(!kn(e.charCodeAt(r)))return!1;o=!0}return o&&i!=="_"}if(i==="o"){for(r++;r<n;r++)if(i=e[r],i!=="_"){if(!In(e.charCodeAt(r)))return!1;o=!0}return o&&i!=="_"}}if(i==="_")return!1;for(;r<n;r++)if(i=e[r],i!=="_"){if(!Mn(e.charCodeAt(r)))return!1;o=!0}return!(!o||i==="_")}function Nn(e){var n=e,r=1,o;if(n.indexOf("_")!==-1&&(n=n.replace(/_/g,"")),o=n[0],(o==="-"||o==="+")&&(o==="-"&&(r=-1),n=n.slice(1),o=n[0]),n==="0")return 0;if(o==="0"){if(n[1]==="b")return r*parseInt(n.slice(2),2);if(n[1]==="x")return r*parseInt(n.slice(2),16);if(n[1]==="o")return r*parseInt(n.slice(2),8)}return r*parseInt(n,10)}function jn(e){return Object.prototype.toString.call(e)==="[object Number]"&&e%1===0&&!A.isNegativeZero(e)}var Me=new b("tag:yaml.org,2002:int",{kind:"scalar",resolve:Rn,construct:Nn,predicate:jn,represent:{binary:function(e){return e>=0?"0b"+e.toString(2):"-0b"+e.toString(2).slice(1)},octal:function(e){return e>=0?"0o"+e.toString(8):"-0o"+e.toString(8).slice(1)},decimal:function(e){return e.toString(10)},hexadecimal:function(e){return e>=0?"0x"+e.toString(16).toUpperCase():"-0x"+e.toString(16).toUpperCase().slice(1)}},defaultStyle:"decimal",styleAliases:{binary:[2,"bin"],octal:[8,"oct"],decimal:[10,"dec"],hexadecimal:[16,"hex"]}}),Pn=new RegExp("^(?:[-+]?(?:[0-9][0-9_]*)(?:\\.[0-9_]*)?(?:[eE][-+]?[0-9]+)?|\\.[0-9_]+(?:[eE][-+]?[0-9]+)?|[-+]?\\.(?:inf|Inf|INF)|\\.(?:nan|NaN|NAN))$");function Fn(e){return!(e===null||!Pn.test(e)||e[e.length-1]==="_")}function Hn(e){var n=e.replace(/_/g,"").toLowerCase(),r=n[0]==="-"?-1:1;return"+-".indexOf(n[0])>=0&&(n=n.slice(1)),n===".inf"?r===1?Number.POSITIVE_INFINITY:Number.NEGATIVE_INFINITY:n===".nan"?NaN:r*parseFloat(n,10)}var Yn=/^[-+]?[0-9]+e/;function Dn(e,n){var r;if(isNaN(e))switch(n){case"lowercase":return".nan";case"uppercase":return".NAN";case"camelcase":return".NaN"}else if(Number.POSITIVE_INFINITY===e)switch(n){case"lowercase":return".inf";case"uppercase":return".INF";case"camelcase":return".Inf"}else if(Number.NEGATIVE_INFINITY===e)switch(n){case"lowercase":return"-.inf";case"uppercase":return"-.INF";case"camelcase":return"-.Inf"}else if(A.isNegativeZero(e))return"-0.0";return r=e.toString(10),Yn.test(r)?r.replace("e",".e"):r}function Bn(e){return Object.prototype.toString.call(e)==="[object Number]"&&(e%1!==0||A.isNegativeZero(e))}var Re=new b("tag:yaml.org,2002:float",{kind:"scalar",resolve:Fn,construct:Hn,predicate:Bn,represent:Dn,defaultStyle:"lowercase"}),Ne=Le.extend({implicit:[ke,Ie,Me,Re]}),je=Ne,Pe=new RegExp("^([0-9][0-9][0-9][0-9])-([0-9][0-9])-([0-9][0-9])$"),Fe=new RegExp("^([0-9][0-9][0-9][0-9])-([0-9][0-9]?)-([0-9][0-9]?)(?:[Tt]|[ \\t]+)([0-9][0-9]?):([0-9][0-9]):([0-9][0-9])(?:\\.([0-9]*))?(?:[ \\t]*(Z|([-+])([0-9][0-9]?)(?::([0-9][0-9]))?))?$");function Un(e){return e===null?!1:Pe.exec(e)!==null||Fe.exec(e)!==null}function qn(e){var n,r,o,i,l,t,a,u=0,c=null,p,f,s;if(n=Pe.exec(e),n===null&&(n=Fe.exec(e)),n===null)throw new Error("Date resolve error");if(r=+n[1],o=+n[2]-1,i=+n[3],!n[4])return new Date(Date.UTC(r,o,i));if(l=+n[4],t=+n[5],a=+n[6],n[7]){for(u=n[7].slice(0,3);u.length<3;)u+="0";u=+u}return n[9]&&(p=+n[10],f=+(n[11]||0),c=(p*60+f)*6e4,n[9]==="-"&&(c=-c)),s=new Date(Date.UTC(r,o,i,l,t,a,u)),c&&s.setTime(s.getTime()-c),s}function Gn(e){return e.toISOString()}var He=new b("tag:yaml.org,2002:timestamp",{kind:"scalar",resolve:Un,construct:qn,instanceOf:Date,represent:Gn});function Kn(e){return e==="<<"||e===null}var Ye=new b("tag:yaml.org,2002:merge",{kind:"scalar",resolve:Kn}),re=`ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=
\r`;function Wn(e){if(e===null)return!1;var n,r,o=0,i=e.length,l=re;for(r=0;r<i;r++)if(n=l.indexOf(e.charAt(r)),!(n>64)){if(n<0)return!1;o+=6}return o%8===0}function $n(e){var n,r,o=e.replace(/[\r\n=]/g,""),i=o.length,l=re,t=0,a=[];for(n=0;n<i;n++)n%4===0&&n&&(a.push(t>>16&255),a.push(t>>8&255),a.push(t&255)),t=t<<6|l.indexOf(o.charAt(n));return r=i%4*6,r===0?(a.push(t>>16&255),a.push(t>>8&255),a.push(t&255)):r===18?(a.push(t>>10&255),a.push(t>>2&255)):r===12&&a.push(t>>4&255),new Uint8Array(a)}function Vn(e){var n="",r=0,o,i,l=e.length,t=re;for(o=0;o<l;o++)o%3===0&&o&&(n+=t[r>>18&63],n+=t[r>>12&63],n+=t[r>>6&63],n+=t[r&63]),r=(r<<8)+e[o];return i=l%3,i===0?(n+=t[r>>18&63],n+=t[r>>12&63],n+=t[r>>6&63],n+=t[r&63]):i===2?(n+=t[r>>10&63],n+=t[r>>4&63],n+=t[r<<2&63],n+=t[64]):i===1&&(n+=t[r>>2&63],n+=t[r<<4&63],n+=t[64],n+=t[64]),n}function Qn(e){return Object.prototype.toString.call(e)==="[object Uint8Array]"}var De=new b("tag:yaml.org,2002:binary",{kind:"scalar",resolve:Wn,construct:$n,predicate:Qn,represent:Vn}),zn=Object.prototype.hasOwnProperty,Xn=Object.prototype.toString;function Jn(e){if(e===null)return!0;var n=[],r,o,i,l,t,a=e;for(r=0,o=a.length;r<o;r+=1){if(i=a[r],t=!1,Xn.call(i)!=="[object Object]")return!1;for(l in i)if(zn.call(i,l))if(!t)t=!0;else return!1;if(!t)return!1;if(n.indexOf(l)===-1)n.push(l);else return!1}return!0}function Zn(e){return e!==null?e:[]}var Be=new b("tag:yaml.org,2002:omap",{kind:"sequence",resolve:Jn,construct:Zn}),er=Object.prototype.toString;function nr(e){if(e===null)return!0;var n,r,o,i,l,t=e;for(l=new Array(t.length),n=0,r=t.length;n<r;n+=1){if(o=t[n],er.call(o)!=="[object Object]"||(i=Object.keys(o),i.length!==1))return!1;l[n]=[i[0],o[i[0]]]}return!0}function rr(e){if(e===null)return[];var n,r,o,i,l,t=e;for(l=new Array(t.length),n=0,r=t.length;n<r;n+=1)o=t[n],i=Object.keys(o),l[n]=[i[0],o[i[0]]];return l}var Ue=new b("tag:yaml.org,2002:pairs",{kind:"sequence",resolve:nr,construct:rr}),ir=Object.prototype.hasOwnProperty;function or(e){if(e===null)return!0;var n,r=e;for(n in r)if(ir.call(r,n)&&r[n]!==null)return!1;return!0}function tr(e){return e!==null?e:{}}var qe=new b("tag:yaml.org,2002:set",{kind:"mapping",resolve:or,construct:tr}),ie=je.extend({implicit:[He,Ye],explicit:[De,Be,Ue,qe]}),L=Object.prototype.hasOwnProperty,B=1,Ge=2,Ke=3,U=4,Q=1,lr=2,ce=3,ar=/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F-\x84\x86-\x9F\uFFFE\uFFFF]|[\uD800-\uDBFF](?![\uDC00-\uDFFF])|(?:[^\uD800-\uDBFF]|^)[\uDC00-\uDFFF]/,ur=/[\x85\u2028\u2029]/,cr=/[,\[\]\{\}]/,We=/^(?:!|!!|![a-z\-]+!)$/i,$e=/^(?:!|[^,\[\]\{\}])(?:%[0-9a-f]{2}|[0-9a-z\-#;\/\?:@&=\+\$,_\.!~\*'\(\)\[\]])*$/i;function fe(e){return Object.prototype.toString.call(e)}function S(e){return e===10||e===13}function k(e){return e===9||e===32}function _(e){return e===9||e===32||e===10||e===13}function R(e){return e===44||e===91||e===93||e===123||e===125}function fr(e){var n;return 48<=e&&e<=57?e-48:(n=e|32,97<=n&&n<=102?n-97+10:-1)}function pr(e){return e===120?2:e===117?4:e===85?8:0}function dr(e){return 48<=e&&e<=57?e-48:-1}function pe(e){return e===48?"\0":e===97?"\x07":e===98?"\b":e===116||e===9?"	":e===110?`
`:e===118?"\v":e===102?"\f":e===114?"\r":e===101?"\x1B":e===32?" ":e===34?'"':e===47?"/":e===92?"\\":e===78?"":e===95?" ":e===76?"\u2028":e===80?"\u2029":""}function sr(e){return e<=65535?String.fromCharCode(e):String.fromCharCode((e-65536>>10)+55296,(e-65536&1023)+56320)}var Ve=new Array(256),Qe=new Array(256);for(var I=0;I<256;I++)Ve[I]=pe(I)?1:0,Qe[I]=pe(I);function hr(e,n){this.input=e,this.filename=n.filename||null,this.schema=n.schema||ie,this.onWarning=n.onWarning||null,this.legacy=n.legacy||!1,this.json=n.json||!1,this.listener=n.listener||null,this.implicitTypes=this.schema.compiledImplicit,this.typeMap=this.schema.compiledTypeMap,this.length=e.length,this.position=0,this.line=0,this.lineStart=0,this.lineIndent=0,this.firstTabInLine=-1,this.documents=[]}function ze(e,n){var r={name:e.filename,buffer:e.input.slice(0,-1),position:e.position,line:e.line,column:e.position-e.lineStart};return r.snippet=yn(r),new C(n,r)}function d(e,n){throw ze(e,n)}function q(e,n){e.onWarning&&e.onWarning.call(null,ze(e,n))}var de={YAML:function(n,r,o){var i,l,t;n.version!==null&&d(n,"duplication of %YAML directive"),o.length!==1&&d(n,"YAML directive accepts exactly one argument"),i=/^([0-9]+)\.([0-9]+)$/.exec(o[0]),i===null&&d(n,"ill-formed argument of the YAML directive"),l=parseInt(i[1],10),t=parseInt(i[2],10),l!==1&&d(n,"unacceptable YAML version of the document"),n.version=o[0],n.checkLineBreaks=t<2,t!==1&&t!==2&&q(n,"unsupported YAML version of the document")},TAG:function(n,r,o){var i,l;o.length!==2&&d(n,"TAG directive accepts exactly two arguments"),i=o[0],l=o[1],We.test(i)||d(n,"ill-formed tag handle (first argument) of the TAG directive"),L.call(n.tagMap,i)&&d(n,'there is a previously declared suffix for "'+i+'" tag handle'),$e.test(l)||d(n,"ill-formed tag prefix (second argument) of the TAG directive");try{l=decodeURIComponent(l)}catch{d(n,"tag prefix is malformed: "+l)}n.tagMap[i]=l}};function T(e,n,r,o){var i,l,t,a;if(n<r){if(a=e.input.slice(n,r),o)for(i=0,l=a.length;i<l;i+=1)t=a.charCodeAt(i),t===9||32<=t&&t<=1114111||d(e,"expected valid JSON character");else ar.test(a)&&d(e,"the stream contains non-printable characters");e.result+=a}}function se(e,n,r,o){var i,l,t,a;for(A.isObject(r)||d(e,"cannot merge mappings; the provided source object is unacceptable"),i=Object.keys(r),t=0,a=i.length;t<a;t+=1)l=i[t],L.call(n,l)||(n[l]=r[l],o[l]=!0)}function N(e,n,r,o,i,l,t,a,u){var c,p;if(Array.isArray(i))for(i=Array.prototype.slice.call(i),c=0,p=i.length;c<p;c+=1)Array.isArray(i[c])&&d(e,"nested arrays are not supported inside keys"),typeof i=="object"&&fe(i[c])==="[object Object]"&&(i[c]="[object Object]");if(typeof i=="object"&&fe(i)==="[object Object]"&&(i="[object Object]"),i=String(i),n===null&&(n={}),o==="tag:yaml.org,2002:merge")if(Array.isArray(l))for(c=0,p=l.length;c<p;c+=1)se(e,n,l[c],r);else se(e,n,l,r);else!e.json&&!L.call(r,i)&&L.call(n,i)&&(e.line=t||e.line,e.lineStart=a||e.lineStart,e.position=u||e.position,d(e,"duplicated mapping key")),i==="__proto__"?Object.defineProperty(n,i,{configurable:!0,enumerable:!0,writable:!0,value:l}):n[i]=l,delete r[i];return n}function oe(e){var n=e.input.charCodeAt(e.position);n===10?e.position++:n===13?(e.position++,e.input.charCodeAt(e.position)===10&&e.position++):d(e,"a line break is expected"),e.line+=1,e.lineStart=e.position,e.firstTabInLine=-1}function w(e,n,r){for(var o=0,i=e.input.charCodeAt(e.position);i!==0;){for(;k(i);)i===9&&e.firstTabInLine===-1&&(e.firstTabInLine=e.position),i=e.input.charCodeAt(++e.position);if(n&&i===35)do i=e.input.charCodeAt(++e.position);while(i!==10&&i!==13&&i!==0);if(S(i))for(oe(e),i=e.input.charCodeAt(e.position),o++,e.lineIndent=0;i===32;)e.lineIndent++,i=e.input.charCodeAt(++e.position);else break}return r!==-1&&o!==0&&e.lineIndent<r&&q(e,"deficient indentation"),o}function W(e){var n=e.position,r=e.input.charCodeAt(n);return!!((r===45||r===46)&&r===e.input.charCodeAt(n+1)&&r===e.input.charCodeAt(n+2)&&(n+=3,r=e.input.charCodeAt(n),r===0||_(r)))}function te(e,n){n===1?e.result+=" ":n>1&&(e.result+=A.repeat(`
`,n-1))}function mr(e,n,r){var o,i,l,t,a,u,c,p,f=e.kind,s=e.result,h=e.input.charCodeAt(e.position);if(_(h)||R(h)||h===35||h===38||h===42||h===33||h===124||h===62||h===39||h===34||h===37||h===64||h===96||(h===63||h===45)&&(i=e.input.charCodeAt(e.position+1),_(i)||r&&R(i)))return!1;for(e.kind="scalar",e.result="",l=t=e.position,a=!1;h!==0;){if(h===58){if(i=e.input.charCodeAt(e.position+1),_(i)||r&&R(i))break}else if(h===35){if(o=e.input.charCodeAt(e.position-1),_(o))break}else{if(e.position===e.lineStart&&W(e)||r&&R(h))break;if(S(h))if(u=e.line,c=e.lineStart,p=e.lineIndent,w(e,!1,-1),e.lineIndent>=n){a=!0,h=e.input.charCodeAt(e.position);continue}else{e.position=t,e.line=u,e.lineStart=c,e.lineIndent=p;break}}a&&(T(e,l,t,!1),te(e,e.line-u),l=t=e.position,a=!1),k(h)||(t=e.position+1),h=e.input.charCodeAt(++e.position)}return T(e,l,t,!1),e.result?!0:(e.kind=f,e.result=s,!1)}function gr(e,n){var r=e.input.charCodeAt(e.position),o,i;if(r!==39)return!1;for(e.kind="scalar",e.result="",e.position++,o=i=e.position;(r=e.input.charCodeAt(e.position))!==0;)if(r===39)if(T(e,o,e.position,!0),r=e.input.charCodeAt(++e.position),r===39)o=e.position,e.position++,i=e.position;else return!0;else S(r)?(T(e,o,i,!0),te(e,w(e,!1,n)),o=i=e.position):e.position===e.lineStart&&W(e)?d(e,"unexpected end of the document within a single quoted scalar"):(e.position++,i=e.position);d(e,"unexpected end of the stream within a single quoted scalar")}function vr(e,n){var r,o,i,l,t,a=e.input.charCodeAt(e.position);if(a!==34)return!1;for(e.kind="scalar",e.result="",e.position++,r=o=e.position;(a=e.input.charCodeAt(e.position))!==0;){if(a===34)return T(e,r,e.position,!0),e.position++,!0;if(a===92){if(T(e,r,e.position,!0),a=e.input.charCodeAt(++e.position),S(a))w(e,!1,n);else if(a<256&&Ve[a])e.result+=Qe[a],e.position++;else if((t=pr(a))>0){for(i=t,l=0;i>0;i--)a=e.input.charCodeAt(++e.position),(t=fr(a))>=0?l=(l<<4)+t:d(e,"expected hexadecimal character");e.result+=sr(l),e.position++}else d(e,"unknown escape sequence");r=o=e.position}else S(a)?(T(e,r,o,!0),te(e,w(e,!1,n)),r=o=e.position):e.position===e.lineStart&&W(e)?d(e,"unexpected end of the document within a double quoted scalar"):(e.position++,o=e.position)}d(e,"unexpected end of the stream within a double quoted scalar")}function yr(e,n){var r=!0,o,i,l,t=e.tag,a,u=e.anchor,c,p,f,s,h,m=Object.create(null),v,y,x,g=e.input.charCodeAt(e.position);if(g===91)p=93,h=!1,a=[];else if(g===123)p=125,h=!0,a={};else return!1;for(e.anchor!==null&&(e.anchorMap[e.anchor]=a),g=e.input.charCodeAt(++e.position);g!==0;){if(w(e,!0,n),g=e.input.charCodeAt(e.position),g===p)return e.position++,e.tag=t,e.anchor=u,e.kind=h?"mapping":"sequence",e.result=a,!0;r?g===44&&d(e,"expected the node content, but found ','"):d(e,"missed comma between flow collection entries"),y=v=x=null,f=s=!1,g===63&&(c=e.input.charCodeAt(e.position+1),_(c)&&(f=s=!0,e.position++,w(e,!0,n))),o=e.line,i=e.lineStart,l=e.position,j(e,n,B,!1,!0),y=e.tag,v=e.result,w(e,!0,n),g=e.input.charCodeAt(e.position),(s||e.line===o)&&g===58&&(f=!0,g=e.input.charCodeAt(++e.position),w(e,!0,n),j(e,n,B,!1,!0),x=e.result),h?N(e,a,m,y,v,x,o,i,l):f?a.push(N(e,null,m,y,v,x,o,i,l)):a.push(v),w(e,!0,n),g=e.input.charCodeAt(e.position),g===44?(r=!0,g=e.input.charCodeAt(++e.position)):r=!1}d(e,"unexpected end of the stream within a flow collection")}function wr(e,n){var r,o,i=Q,l=!1,t=!1,a=n,u=0,c=!1,p,f=e.input.charCodeAt(e.position);if(f===124)o=!1;else if(f===62)o=!0;else return!1;for(e.kind="scalar",e.result="";f!==0;)if(f=e.input.charCodeAt(++e.position),f===43||f===45)Q===i?i=f===43?ce:lr:d(e,"repeat of a chomping mode identifier");else if((p=dr(f))>=0)p===0?d(e,"bad explicit indentation width of a block scalar; it cannot be less than one"):t?d(e,"repeat of an indentation width identifier"):(a=n+p-1,t=!0);else break;if(k(f)){do f=e.input.charCodeAt(++e.position);while(k(f));if(f===35)do f=e.input.charCodeAt(++e.position);while(!S(f)&&f!==0)}for(;f!==0;){for(oe(e),e.lineIndent=0,f=e.input.charCodeAt(e.position);(!t||e.lineIndent<a)&&f===32;)e.lineIndent++,f=e.input.charCodeAt(++e.position);if(!t&&e.lineIndent>a&&(a=e.lineIndent),S(f)){u++;continue}if(e.lineIndent<a){i===ce?e.result+=A.repeat(`
`,l?1+u:u):i===Q&&l&&(e.result+=`
`);break}for(o?k(f)?(c=!0,e.result+=A.repeat(`
`,l?1+u:u)):c?(c=!1,e.result+=A.repeat(`
`,u+1)):u===0?l&&(e.result+=" "):e.result+=A.repeat(`
`,u):e.result+=A.repeat(`
`,l?1+u:u),l=!0,t=!0,u=0,r=e.position;!S(f)&&f!==0;)f=e.input.charCodeAt(++e.position);T(e,r,e.position,!1)}return!0}function he(e,n){var r,o=e.tag,i=e.anchor,l=[],t,a=!1,u;if(e.firstTabInLine!==-1)return!1;for(e.anchor!==null&&(e.anchorMap[e.anchor]=l),u=e.input.charCodeAt(e.position);u!==0&&(e.firstTabInLine!==-1&&(e.position=e.firstTabInLine,d(e,"tab characters must not be used in indentation")),!(u!==45||(t=e.input.charCodeAt(e.position+1),!_(t))));){if(a=!0,e.position++,w(e,!0,-1)&&e.lineIndent<=n){l.push(null),u=e.input.charCodeAt(e.position);continue}if(r=e.line,j(e,n,Ke,!1,!0),l.push(e.result),w(e,!0,-1),u=e.input.charCodeAt(e.position),(e.line===r||e.lineIndent>n)&&u!==0)d(e,"bad indentation of a sequence entry");else if(e.lineIndent<n)break}return a?(e.tag=o,e.anchor=i,e.kind="sequence",e.result=l,!0):!1}function Ar(e,n,r){var o,i,l,t,a,u,c=e.tag,p=e.anchor,f={},s=Object.create(null),h=null,m=null,v=null,y=!1,x=!1,g;if(e.firstTabInLine!==-1)return!1;for(e.anchor!==null&&(e.anchorMap[e.anchor]=f),g=e.input.charCodeAt(e.position);g!==0;){if(!y&&e.firstTabInLine!==-1&&(e.position=e.firstTabInLine,d(e,"tab characters must not be used in indentation")),o=e.input.charCodeAt(e.position+1),l=e.line,(g===63||g===58)&&_(o))g===63?(y&&(N(e,f,s,h,m,null,t,a,u),h=m=v=null),x=!0,y=!0,i=!0):y?(y=!1,i=!0):d(e,"incomplete explicit mapping pair; a key node is missed; or followed by a non-tabulated empty line"),e.position+=1,g=o;else{if(t=e.line,a=e.lineStart,u=e.position,!j(e,r,Ge,!1,!0))break;if(e.line===l){for(g=e.input.charCodeAt(e.position);k(g);)g=e.input.charCodeAt(++e.position);if(g===58)g=e.input.charCodeAt(++e.position),_(g)||d(e,"a whitespace character is expected after the key-value separator within a block mapping"),y&&(N(e,f,s,h,m,null,t,a,u),h=m=v=null),x=!0,y=!1,i=!1,h=e.tag,m=e.result;else if(x)d(e,"can not read an implicit mapping pair; a colon is missed");else return e.tag=c,e.anchor=p,!0}else if(x)d(e,"can not read a block mapping entry; a multiline key may not be an implicit key");else return e.tag=c,e.anchor=p,!0}if((e.line===l||e.lineIndent>n)&&(y&&(t=e.line,a=e.lineStart,u=e.position),j(e,n,U,!0,i)&&(y?m=e.result:v=e.result),y||(N(e,f,s,h,m,v,t,a,u),h=m=v=null),w(e,!0,-1),g=e.input.charCodeAt(e.position)),(e.line===l||e.lineIndent>n)&&g!==0)d(e,"bad indentation of a mapping entry");else if(e.lineIndent<n)break}return y&&N(e,f,s,h,m,null,t,a,u),x&&(e.tag=c,e.anchor=p,e.kind="mapping",e.result=f),x}function br(e){var n,r=!1,o=!1,i,l,t=e.input.charCodeAt(e.position);if(t!==33)return!1;if(e.tag!==null&&d(e,"duplication of a tag property"),t=e.input.charCodeAt(++e.position),t===60?(r=!0,t=e.input.charCodeAt(++e.position)):t===33?(o=!0,i="!!",t=e.input.charCodeAt(++e.position)):i="!",n=e.position,r){do t=e.input.charCodeAt(++e.position);while(t!==0&&t!==62);e.position<e.length?(l=e.input.slice(n,e.position),t=e.input.charCodeAt(++e.position)):d(e,"unexpected end of the stream within a verbatim tag")}else{for(;t!==0&&!_(t);)t===33&&(o?d(e,"tag suffix cannot contain exclamation marks"):(i=e.input.slice(n-1,e.position+1),We.test(i)||d(e,"named tag handle cannot contain such characters"),o=!0,n=e.position+1)),t=e.input.charCodeAt(++e.position);l=e.input.slice(n,e.position),cr.test(l)&&d(e,"tag suffix cannot contain flow indicator characters")}l&&!$e.test(l)&&d(e,"tag name cannot contain such characters: "+l);try{l=decodeURIComponent(l)}catch{d(e,"tag name is malformed: "+l)}return r?e.tag=l:L.call(e.tagMap,i)?e.tag=e.tagMap[i]+l:i==="!"?e.tag="!"+l:i==="!!"?e.tag="tag:yaml.org,2002:"+l:d(e,'undeclared tag handle "'+i+'"'),!0}function Er(e){var n,r=e.input.charCodeAt(e.position);if(r!==38)return!1;for(e.anchor!==null&&d(e,"duplication of an anchor property"),r=e.input.charCodeAt(++e.position),n=e.position;r!==0&&!_(r)&&!R(r);)r=e.input.charCodeAt(++e.position);return e.position===n&&d(e,"name of an anchor node must contain at least one character"),e.anchor=e.input.slice(n,e.position),!0}function Cr(e){var n,r,o=e.input.charCodeAt(e.position);if(o!==42)return!1;for(o=e.input.charCodeAt(++e.position),n=e.position;o!==0&&!_(o)&&!R(o);)o=e.input.charCodeAt(++e.position);return e.position===n&&d(e,"name of an alias node must contain at least one character"),r=e.input.slice(n,e.position),L.call(e.anchorMap,r)||d(e,'unidentified alias "'+r+'"'),e.result=e.anchorMap[r],w(e,!0,-1),!0}function j(e,n,r,o,i){var l,t,a,u=1,c=!1,p=!1,f,s,h,m,v,y;if(e.listener!==null&&e.listener("open",e),e.tag=null,e.anchor=null,e.kind=null,e.result=null,l=t=a=U===r||Ke===r,o&&w(e,!0,-1)&&(c=!0,e.lineIndent>n?u=1:e.lineIndent===n?u=0:e.lineIndent<n&&(u=-1)),u===1)for(;br(e)||Er(e);)w(e,!0,-1)?(c=!0,a=l,e.lineIndent>n?u=1:e.lineIndent===n?u=0:e.lineIndent<n&&(u=-1)):a=!1;if(a&&(a=c||i),(u===1||U===r)&&(B===r||Ge===r?v=n:v=n+1,y=e.position-e.lineStart,u===1?a&&(he(e,y)||Ar(e,y,v))||yr(e,v)?p=!0:(t&&wr(e,v)||gr(e,v)||vr(e,v)?p=!0:Cr(e)?(p=!0,(e.tag!==null||e.anchor!==null)&&d(e,"alias node should not have any properties")):mr(e,v,B===r)&&(p=!0,e.tag===null&&(e.tag="?")),e.anchor!==null&&(e.anchorMap[e.anchor]=e.result)):u===0&&(p=a&&he(e,y))),e.tag===null)e.anchor!==null&&(e.anchorMap[e.anchor]=e.result);else if(e.tag==="?"){for(e.result!==null&&e.kind!=="scalar"&&d(e,'unacceptable node kind for !<?> tag; it should be "scalar", not "'+e.kind+'"'),f=0,s=e.implicitTypes.length;f<s;f+=1)if(m=e.implicitTypes[f],m.resolve(e.result)){e.result=m.construct(e.result),e.tag=m.tag,e.anchor!==null&&(e.anchorMap[e.anchor]=e.result);break}}else if(e.tag!=="!"){if(L.call(e.typeMap[e.kind||"fallback"],e.tag))m=e.typeMap[e.kind||"fallback"][e.tag];else for(m=null,h=e.typeMap.multi[e.kind||"fallback"],f=0,s=h.length;f<s;f+=1)if(e.tag.slice(0,h[f].tag.length)===h[f].tag){m=h[f];break}m||d(e,"unknown tag !<"+e.tag+">"),e.result!==null&&m.kind!==e.kind&&d(e,"unacceptable node kind for !<"+e.tag+'> tag; it should be "'+m.kind+'", not "'+e.kind+'"'),m.resolve(e.result,e.tag)?(e.result=m.construct(e.result,e.tag),e.anchor!==null&&(e.anchorMap[e.anchor]=e.result)):d(e,"cannot resolve a node with !<"+e.tag+"> explicit tag")}return e.listener!==null&&e.listener("close",e),e.tag!==null||e.anchor!==null||p}function _r(e){var n=e.position,r,o,i,l=!1,t;for(e.version=null,e.checkLineBreaks=e.legacy,e.tagMap=Object.create(null),e.anchorMap=Object.create(null);(t=e.input.charCodeAt(e.position))!==0&&(w(e,!0,-1),t=e.input.charCodeAt(e.position),!(e.lineIndent>0||t!==37));){for(l=!0,t=e.input.charCodeAt(++e.position),r=e.position;t!==0&&!_(t);)t=e.input.charCodeAt(++e.position);for(o=e.input.slice(r,e.position),i=[],o.length<1&&d(e,"directive name must not be less than one character in length");t!==0;){for(;k(t);)t=e.input.charCodeAt(++e.position);if(t===35){do t=e.input.charCodeAt(++e.position);while(t!==0&&!S(t));break}if(S(t))break;for(r=e.position;t!==0&&!_(t);)t=e.input.charCodeAt(++e.position);i.push(e.input.slice(r,e.position))}t!==0&&oe(e),L.call(de,o)?de[o](e,o,i):q(e,'unknown document directive "'+o+'"')}if(w(e,!0,-1),e.lineIndent===0&&e.input.charCodeAt(e.position)===45&&e.input.charCodeAt(e.position+1)===45&&e.input.charCodeAt(e.position+2)===45?(e.position+=3,w(e,!0,-1)):l&&d(e,"directives end mark is expected"),j(e,e.lineIndent-1,U,!1,!0),w(e,!0,-1),e.checkLineBreaks&&ur.test(e.input.slice(n,e.position))&&q(e,"non-ASCII line breaks are interpreted as content"),e.documents.push(e.result),e.position===e.lineStart&&W(e)){e.input.charCodeAt(e.position)===46&&(e.position+=3,w(e,!0,-1));return}if(e.position<e.length-1)d(e,"end of the stream or a document separator is expected");else return}function Xe(e,n){e=String(e),n=n||{},e.length!==0&&(e.charCodeAt(e.length-1)!==10&&e.charCodeAt(e.length-1)!==13&&(e+=`
`),e.charCodeAt(0)===65279&&(e=e.slice(1)));var r=new hr(e,n),o=e.indexOf("\0");for(o!==-1&&(r.position=o,d(r,"null byte is not allowed in input")),r.input+="\0";r.input.charCodeAt(r.position)===32;)r.lineIndent+=1,r.position+=1;for(;r.position<r.length-1;)_r(r);return r.documents}function xr(e,n,r){n!==null&&typeof n=="object"&&typeof r>"u"&&(r=n,n=null);var o=Xe(e,r);if(typeof n!="function")return o;for(var i=0,l=o.length;i<l;i+=1)n(o[i])}function Sr(e,n){var r=Xe(e,n);if(r.length!==0){if(r.length===1)return r[0];throw new C("expected a single document in the stream, but found more")}}var Je={loadAll:xr,load:Sr},Ze=Object.prototype.toString,en=Object.prototype.hasOwnProperty,le=65279,Or=9,H=10,Tr=13,Lr=32,kr=33,Ir=34,X=35,Mr=37,Rr=38,Nr=39,jr=42,nn=44,Pr=45,G=58,Fr=61,Hr=62,Yr=63,Dr=64,rn=91,on=93,Br=96,tn=123,Ur=124,ln=125,E={};E[0]="\\0";E[7]="\\a";E[8]="\\b";E[9]="\\t";E[10]="\\n";E[11]="\\v";E[12]="\\f";E[13]="\\r";E[27]="\\e";E[34]='\\"';E[92]="\\\\";E[133]="\\N";E[160]="\\_";E[8232]="\\L";E[8233]="\\P";var qr=["y","Y","yes","Yes","YES","on","On","ON","n","N","no","No","NO","off","Off","OFF"],Gr=/^[-+]?[0-9_]+(?::[0-9_]+)+(?:\.[0-9_]*)?$/;function Kr(e,n){var r,o,i,l,t,a,u;if(n===null)return{};for(r={},o=Object.keys(n),i=0,l=o.length;i<l;i+=1)t=o[i],a=String(n[t]),t.slice(0,2)==="!!"&&(t="tag:yaml.org,2002:"+t.slice(2)),u=e.compiledTypeMap.fallback[t],u&&en.call(u.styleAliases,a)&&(a=u.styleAliases[a]),r[t]=a;return r}function Wr(e){var n=e.toString(16).toUpperCase(),r,o;if(e<=255)r="x",o=2;else if(e<=65535)r="u",o=4;else if(e<=4294967295)r="U",o=8;else throw new C("code point within a string may not be greater than 0xFFFFFFFF");return"\\"+r+A.repeat("0",o-n.length)+n}var $r=1,Y=2;function Vr(e){this.schema=e.schema||ie,this.indent=Math.max(1,e.indent||2),this.noArrayIndent=e.noArrayIndent||!1,this.skipInvalid=e.skipInvalid||!1,this.flowLevel=A.isNothing(e.flowLevel)?-1:e.flowLevel,this.styleMap=Kr(this.schema,e.styles||null),this.sortKeys=e.sortKeys||!1,this.lineWidth=e.lineWidth||80,this.noRefs=e.noRefs||!1,this.noCompatMode=e.noCompatMode||!1,this.condenseFlow=e.condenseFlow||!1,this.quotingType=e.quotingType==='"'?Y:$r,this.forceQuotes=e.forceQuotes||!1,this.replacer=typeof e.replacer=="function"?e.replacer:null,this.implicitTypes=this.schema.compiledImplicit,this.explicitTypes=this.schema.compiledExplicit,this.tag=null,this.result="",this.duplicates=[],this.usedDuplicates=null}function me(e,n){for(var r=A.repeat(" ",n),o=0,i=-1,l="",t,a=e.length;o<a;)i=e.indexOf(`
`,o),i===-1?(t=e.slice(o),o=a):(t=e.slice(o,i+1),o=i+1),t.length&&t!==`
`&&(l+=r),l+=t;return l}function J(e,n){return`
`+A.repeat(" ",e.indent*n)}function Qr(e,n){var r,o,i;for(r=0,o=e.implicitTypes.length;r<o;r+=1)if(i=e.implicitTypes[r],i.resolve(n))return!0;return!1}function K(e){return e===Lr||e===Or}function D(e){return 32<=e&&e<=126||161<=e&&e<=55295&&e!==8232&&e!==8233||57344<=e&&e<=65533&&e!==le||65536<=e&&e<=1114111}function ge(e){return D(e)&&e!==le&&e!==Tr&&e!==H}function ve(e,n,r){var o=ge(e),i=o&&!K(e);return(r?o:o&&e!==nn&&e!==rn&&e!==on&&e!==tn&&e!==ln)&&e!==X&&!(n===G&&!i)||ge(n)&&!K(n)&&e===X||n===G&&i}function zr(e){return D(e)&&e!==le&&!K(e)&&e!==Pr&&e!==Yr&&e!==G&&e!==nn&&e!==rn&&e!==on&&e!==tn&&e!==ln&&e!==X&&e!==Rr&&e!==jr&&e!==kr&&e!==Ur&&e!==Fr&&e!==Hr&&e!==Nr&&e!==Ir&&e!==Mr&&e!==Dr&&e!==Br}function Xr(e){return!K(e)&&e!==G}function P(e,n){var r=e.charCodeAt(n),o;return r>=55296&&r<=56319&&n+1<e.length&&(o=e.charCodeAt(n+1),o>=56320&&o<=57343)?(r-55296)*1024+o-56320+65536:r}function an(e){return/^\n* /.test(e)}var un=1,Z=2,cn=3,fn=4,M=5;function Jr(e,n,r,o,i,l,t,a){var u,c=0,p=null,f=!1,s=!1,h=o!==-1,m=-1,v=zr(P(e,0))&&Xr(P(e,e.length-1));if(n||t)for(u=0;u<e.length;c>=65536?u+=2:u++){if(c=P(e,u),!D(c))return M;v=v&&ve(c,p,a),p=c}else{for(u=0;u<e.length;c>=65536?u+=2:u++){if(c=P(e,u),c===H)f=!0,h&&(s=s||u-m-1>o&&e[m+1]!==" ",m=u);else if(!D(c))return M;v=v&&ve(c,p,a),p=c}s=s||h&&u-m-1>o&&e[m+1]!==" "}return!f&&!s?v&&!t&&!i(e)?un:l===Y?M:Z:r>9&&an(e)?M:t?l===Y?M:Z:s?fn:cn}function Zr(e,n,r,o,i){e.dump=(function(){if(n.length===0)return e.quotingType===Y?'""':"''";if(!e.noCompatMode&&(qr.indexOf(n)!==-1||Gr.test(n)))return e.quotingType===Y?'"'+n+'"':"'"+n+"'";var l=e.indent*Math.max(1,r),t=e.lineWidth===-1?-1:Math.max(Math.min(e.lineWidth,40),e.lineWidth-l),a=o||e.flowLevel>-1&&r>=e.flowLevel;function u(c){return Qr(e,c)}switch(Jr(n,a,e.indent,t,u,e.quotingType,e.forceQuotes&&!o,i)){case un:return n;case Z:return"'"+n.replace(/'/g,"''")+"'";case cn:return"|"+ye(n,e.indent)+we(me(n,l));case fn:return">"+ye(n,e.indent)+we(me(ei(n,t),l));case M:return'"'+ni(n)+'"';default:throw new C("impossible error: invalid scalar style")}})()}function ye(e,n){var r=an(e)?String(n):"",o=e[e.length-1]===`
`;return r+(o&&(e[e.length-2]===`
`||e===`
`)?"+":o?"":"-")+`
`}function we(e){return e[e.length-1]===`
`?e.slice(0,-1):e}function ei(e,n){for(var r=/(\n+)([^\n]*)/g,o=(function(){var c=e.indexOf(`
`);return c=c!==-1?c:e.length,r.lastIndex=c,Ae(e.slice(0,c),n)})(),i=e[0]===`
`||e[0]===" ",l,t;t=r.exec(e);){var a=t[1],u=t[2];l=u[0]===" ",o+=a+(!i&&!l&&u!==""?`
`:"")+Ae(u,n),i=l}return o}function Ae(e,n){if(e===""||e[0]===" ")return e;for(var r=/ [^ ]/g,o,i=0,l,t=0,a=0,u="";o=r.exec(e);)a=o.index,a-i>n&&(l=t>i?t:a,u+=`
`+e.slice(i,l),i=l+1),t=a;return u+=`
`,e.length-i>n&&t>i?u+=e.slice(i,t)+`
`+e.slice(t+1):u+=e.slice(i),u.slice(1)}function ni(e){for(var n="",r=0,o,i=0;i<e.length;r>=65536?i+=2:i++)r=P(e,i),o=E[r],!o&&D(r)?(n+=e[i],r>=65536&&(n+=e[i+1])):n+=o||Wr(r);return n}function ri(e,n,r){var o="",i=e.tag,l,t,a;for(l=0,t=r.length;l<t;l+=1)a=r[l],e.replacer&&(a=e.replacer.call(r,String(l),a)),(O(e,n,a,!1,!1)||typeof a>"u"&&O(e,n,null,!1,!1))&&(o!==""&&(o+=","+(e.condenseFlow?"":" ")),o+=e.dump);e.tag=i,e.dump="["+o+"]"}function be(e,n,r,o){var i="",l=e.tag,t,a,u;for(t=0,a=r.length;t<a;t+=1)u=r[t],e.replacer&&(u=e.replacer.call(r,String(t),u)),(O(e,n+1,u,!0,!0,!1,!0)||typeof u>"u"&&O(e,n+1,null,!0,!0,!1,!0))&&((!o||i!=="")&&(i+=J(e,n)),e.dump&&H===e.dump.charCodeAt(0)?i+="-":i+="- ",i+=e.dump);e.tag=l,e.dump=i||"[]"}function ii(e,n,r){var o="",i=e.tag,l=Object.keys(r),t,a,u,c,p;for(t=0,a=l.length;t<a;t+=1)p="",o!==""&&(p+=", "),e.condenseFlow&&(p+='"'),u=l[t],c=r[u],e.replacer&&(c=e.replacer.call(r,u,c)),O(e,n,u,!1,!1)&&(e.dump.length>1024&&(p+="? "),p+=e.dump+(e.condenseFlow?'"':"")+":"+(e.condenseFlow?"":" "),O(e,n,c,!1,!1)&&(p+=e.dump,o+=p));e.tag=i,e.dump="{"+o+"}"}function oi(e,n,r,o){var i="",l=e.tag,t=Object.keys(r),a,u,c,p,f,s;if(e.sortKeys===!0)t.sort();else if(typeof e.sortKeys=="function")t.sort(e.sortKeys);else if(e.sortKeys)throw new C("sortKeys must be a boolean or a function");for(a=0,u=t.length;a<u;a+=1)s="",(!o||i!=="")&&(s+=J(e,n)),c=t[a],p=r[c],e.replacer&&(p=e.replacer.call(r,c,p)),O(e,n+1,c,!0,!0,!0)&&(f=e.tag!==null&&e.tag!=="?"||e.dump&&e.dump.length>1024,f&&(e.dump&&H===e.dump.charCodeAt(0)?s+="?":s+="? "),s+=e.dump,f&&(s+=J(e,n)),O(e,n+1,p,!0,f)&&(e.dump&&H===e.dump.charCodeAt(0)?s+=":":s+=": ",s+=e.dump,i+=s));e.tag=l,e.dump=i||"{}"}function Ee(e,n,r){var o,i=r?e.explicitTypes:e.implicitTypes,l,t,a,u;for(l=0,t=i.length;l<t;l+=1)if(a=i[l],(a.instanceOf||a.predicate)&&(!a.instanceOf||typeof n=="object"&&n instanceof a.instanceOf)&&(!a.predicate||a.predicate(n))){if(r?a.multi&&a.representName?e.tag=a.representName(n):e.tag=a.tag:e.tag="?",a.represent){if(u=e.styleMap[a.tag]||a.defaultStyle,Ze.call(a.represent)==="[object Function]")o=a.represent(n,u);else if(en.call(a.represent,u))o=a.represent[u](n,u);else throw new C("!<"+a.tag+'> tag resolver accepts not "'+u+'" style');e.dump=o}return!0}return!1}function O(e,n,r,o,i,l,t){e.tag=null,e.dump=r,Ee(e,r,!1)||Ee(e,r,!0);var a=Ze.call(e.dump),u=o,c;o&&(o=e.flowLevel<0||e.flowLevel>n);var p=a==="[object Object]"||a==="[object Array]",f,s;if(p&&(f=e.duplicates.indexOf(r),s=f!==-1),(e.tag!==null&&e.tag!=="?"||s||e.indent!==2&&n>0)&&(i=!1),s&&e.usedDuplicates[f])e.dump="*ref_"+f;else{if(p&&s&&!e.usedDuplicates[f]&&(e.usedDuplicates[f]=!0),a==="[object Object]")o&&Object.keys(e.dump).length!==0?(oi(e,n,e.dump,i),s&&(e.dump="&ref_"+f+e.dump)):(ii(e,n,e.dump),s&&(e.dump="&ref_"+f+" "+e.dump));else if(a==="[object Array]")o&&e.dump.length!==0?(e.noArrayIndent&&!t&&n>0?be(e,n-1,e.dump,i):be(e,n,e.dump,i),s&&(e.dump="&ref_"+f+e.dump)):(ri(e,n,e.dump),s&&(e.dump="&ref_"+f+" "+e.dump));else if(a==="[object String]")e.tag!=="?"&&Zr(e,e.dump,n,l,u);else{if(a==="[object Undefined]")return!1;if(e.skipInvalid)return!1;throw new C("unacceptable kind of an object to dump "+a)}e.tag!==null&&e.tag!=="?"&&(c=encodeURI(e.tag[0]==="!"?e.tag.slice(1):e.tag).replace(/!/g,"%21"),e.tag[0]==="!"?c="!"+c:c.slice(0,18)==="tag:yaml.org,2002:"?c="!!"+c.slice(18):c="!<"+c+">",e.dump=c+" "+e.dump)}return!0}function ti(e,n){var r=[],o=[],i,l;for(ee(e,r,o),i=0,l=o.length;i<l;i+=1)n.duplicates.push(r[o[i]]);n.usedDuplicates=new Array(l)}function ee(e,n,r){var o,i,l;if(e!==null&&typeof e=="object")if(i=n.indexOf(e),i!==-1)r.indexOf(i)===-1&&r.push(i);else if(n.push(e),Array.isArray(e))for(i=0,l=e.length;i<l;i+=1)ee(e[i],n,r);else for(o=Object.keys(e),i=0,l=o.length;i<l;i+=1)ee(e[o[i]],n,r)}function li(e,n){n=n||{};var r=new Vr(n);r.noRefs||ti(e,r);var o=e;return r.replacer&&(o=r.replacer.call({"":o},"",o)),O(r,0,o,!0,!0)?r.dump+`
`:""}var ai={dump:li};function ae(e,n){return function(){throw new Error("Function yaml."+e+" is removed in js-yaml 4. Use yaml."+n+" instead, which is now safe by default.")}}var ui=b,ci=xe,fi=Le,pi=Ne,di=je,si=ie,hi=Je.load,mi=Je.loadAll,gi=ai.dump,vi=C,yi={binary:De,float:Re,map:Te,null:ke,pairs:Ue,set:qe,timestamp:He,bool:Ie,int:Me,merge:Ye,omap:Be,seq:Oe,str:Se},wi=ae("safeLoad","load"),Ai=ae("safeLoadAll","loadAll"),bi=ae("safeDump","dump"),Ti={Type:ui,Schema:ci,FAILSAFE_SCHEMA:fi,JSON_SCHEMA:pi,CORE_SCHEMA:di,DEFAULT_SCHEMA:si,load:hi,loadAll:mi,dump:gi,YAMLException:vi,types:yi,safeLoad:wi,safeLoadAll:Ai,safeDump:bi};export{Oi as a,_i as c,pn as i,Ci as l,xi as n,Si as o,ne as r,Ei as s,Ti as t};
