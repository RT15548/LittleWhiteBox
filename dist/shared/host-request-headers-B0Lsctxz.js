var e=null;function r(t){e=typeof t=="function"?t:null}async function n(){if(!e)throw new Error("宿主请求头未注册，无法调用酒馆后端。");return await e()}export{r as n,n as t};
