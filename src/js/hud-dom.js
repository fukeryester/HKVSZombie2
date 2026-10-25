/* Reconcile HUD content without replacing controls held by mouse/touch or focused selects. */
window.HudDOM=(()=>{
  const attrs=['id','data-key','data-spawn','data-build','data-slot','data-demolish','data-resume','data-skill','data-cancel-order','data-worker-id','data-training-lane','data-lane','data-plus','data-minus'];
  function key(n){if(n.nodeType!==1)return '';for(const a of attrs)if(n.hasAttribute(a))return n.nodeName+'/'+a+'/'+n.getAttribute(a);for(const a of ['data-worker','data-age','data-cancel-place'])if(n.hasAttribute(a))return n.nodeName+'/'+a;return '';}
  function compatible(a,b){return a.nodeType===b.nodeType&&a.nodeName===b.nodeName&&key(a)===key(b);}
  function patch(target,source){
    if(target.nodeType!==1){if(target.nodeValue!==source.nodeValue)target.nodeValue=source.nodeValue;return;}
    const focused=target===document.activeElement;
    for(const a of [...target.attributes])if(!source.hasAttribute(a.name))target.removeAttribute(a.name);
    for(const a of source.attributes)if(target.getAttribute(a.name)!==a.value)target.setAttribute(a.name,a.value);
    if(target.tagName==='CANVAS')return; // Keep rendered portraits and their drawing buffers.
    if(target.tagName==='SELECT'&&focused)return;
    children(target,source);
    if(target.tagName==='SELECT'&&!focused)target.value=source.value;
  }
  function children(target,source){
    const old=[...target.childNodes],used=new Set();let cursor=target.firstChild;
    for(const desired of [...source.childNodes]){
      let actual=old.find(n=>!used.has(n)&&compatible(n,desired));
      if(!actual)actual=desired.cloneNode(true);else used.add(actual);
      if(actual!==cursor)target.insertBefore(actual,cursor);
      patch(actual,desired);cursor=actual.nextSibling;
    }
    while(cursor){const next=cursor.nextSibling;target.removeChild(cursor);cursor=next;}
  }
  function render(root,html){const template=document.createElement('template');template.innerHTML=html;children(root,template.content);}
  return {render};
})();
