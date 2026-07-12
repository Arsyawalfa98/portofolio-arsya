document.documentElement.className += ' js';

document.addEventListener('DOMContentLoaded', () => {
let lang='id';
function applyLang(){
  document.querySelectorAll('[data-id][data-en]').forEach(el=>{el.innerHTML=el.getAttribute('data-'+lang);});
  document.getElementById('langBtn').textContent = lang==='id'?'EN':'ID';
  document.documentElement.lang=lang;
}
function toggleLang(){lang=lang==='id'?'en':'id';applyLang();}
function toggleMenu(){document.getElementById('navLinks').classList.toggle('open');document.getElementById('burger').classList.toggle('open');}
document.getElementById('langBtn').addEventListener('click',toggleLang);
document.getElementById('burger').addEventListener('click',toggleMenu);
document.querySelectorAll('.nav-links a').forEach(a=>a.addEventListener('click',()=>{document.getElementById('navLinks').classList.remove('open');document.getElementById('burger').classList.remove('open');}));

/* typing */
const roles={id:['Software Engineer','Web Programming','Building Scalable Web Applications'],en:['Software Engineer','Web Programming','Building Scalable Web Applications']};
let ri=0,ci=0,del=false;
function type(){const list=roles[lang];const t=list[ri];const el=document.getElementById('typed');if(!el)return;
  el.textContent=del?t.slice(0,ci-1):t.slice(0,ci+1);ci+=del?-1:1;let s=del?45:85;
  if(!del&&ci===t.length){s=1800;del=true;}else if(del&&ci===0){del=false;ri=(ri+1)%list.length;s=350;}
  setTimeout(type,s);}
type();

/* scroll effects */
const navEl=document.getElementById('nav'),prog=document.getElementById('progress'),toTop=document.getElementById('toTop');
const secs=document.querySelectorAll('section[id],header[id]');
window.addEventListener('scroll',()=>{
  const st=document.documentElement.scrollTop;
  const h=document.documentElement.scrollHeight-document.documentElement.clientHeight;
  prog.style.width=(st/h*100)+'%';
  navEl.classList.toggle('scrolled',st>40);
  toTop.classList.toggle('show',st>560);
  let cur='';secs.forEach(s=>{if(st>=s.offsetTop-120)cur=s.id;});
  document.querySelectorAll('.nav-links a').forEach(a=>a.classList.toggle('active',a.getAttribute('href')==='#'+cur));
},{passive:true});

/* reveal */
const reveals=document.querySelectorAll('.reveal');
if('IntersectionObserver' in window){
  const io=new IntersectionObserver((es)=>{es.forEach(e=>{if(e.isIntersecting){e.target.classList.add('in');io.unobserve(e.target);}});},{threshold:.12,rootMargin:'0px 0px -50px 0px'});
  reveals.forEach(el=>io.observe(el));
}else{
  reveals.forEach(el=>el.classList.add('in'));
}

/* hero diagonal choice selector (mobile swipe) */
const heroSelectorEl=document.getElementById('heroSelector');
if(heroSelectorEl){
  const heroChoices=[...heroSelectorEl.querySelectorAll('.hero-choice')];
  const heroMobileQuery=window.matchMedia('(max-width:1024px)');
  const heroMotionQuery=window.matchMedia('(prefers-reduced-motion:reduce)');

  let heroMobilePage=1; /* default: text panel (index 1) shown first on mobile */
  let heroDragging=false;
  let heroAnimating=false;
  let heroDragSource=null;
  let heroPointerId=null;
  let heroDragStartX=0,heroDragStartY=0,heroDragDeltaX=0,heroDragStartedAt=0;
  let heroSuppressClick=false;
  let heroFinishTimer=null;

  const heroIsMobile=()=>heroMobileQuery.matches;

  function heroGeometry(){
    const width=Math.max(heroSelectorEl.clientWidth,1);
    const height=Math.max(heroSelectorEl.clientHeight,1);
    const corner=Math.max(46,Math.min(60,width*.13));
    return {width,height,corner};
  }
  function heroPolygon(points){
    return `polygon(${points.map(([x,y])=>`${x.toFixed(2)}px ${y.toFixed(2)}px`).join(', ')})`;
  }
  function heroFullClip(){
    const {width,height}=heroGeometry();
    return heroPolygon([[0,0],[width,0],[width,height],[0,height]]);
  }
  function heroMarkerClip(){
    const {width,height,corner}=heroGeometry();
    return heroPolygon([[width,height-corner],[width,height-corner],[width,height],[width-corner,height]]);
  }
  function heroRevealClip(progress){
    const p=Math.max(0,Math.min(1,progress));
    const {width,height,corner}=heroGeometry();
    const inverse=1-p;
    return heroPolygon([[width*inverse,(height-corner)*inverse],[width,(height-corner)*inverse],[width,height],[(width-corner)*inverse,height]]);
  }
  function heroClearInline(choice){
    const content=choice.querySelector('.hero-choice-content');
    const marker=choice.querySelector('.hero-corner-label');
    choice.style.removeProperty('filter');
    content.style.removeProperty('opacity');
    content.style.removeProperty('transform');
    marker.style.removeProperty('opacity');
  }
  function heroSetMobileStable(page,immediate=false){
    if(!heroIsMobile())return;
    clearTimeout(heroFinishTimer);
    heroMobilePage=page===1?1:0;
    heroDragging=false;
    heroAnimating=false;
    heroSelectorEl.classList.remove('is-dragging');
    if(immediate)heroSelectorEl.classList.add('hero-no-transition');
    heroChoices.forEach((choice,index)=>{
      const active=index===heroMobilePage;
      heroClearInline(choice);
      choice.classList.toggle('hero-mobile-active',active);
      choice.classList.toggle('hero-mobile-marker',!active);
      choice.style.zIndex=active?'2':'3';
      choice.style.clipPath=active?heroFullClip():heroMarkerClip();
    });
    if(immediate){
      requestAnimationFrame(()=>{
        requestAnimationFrame(()=>heroSelectorEl.classList.remove('hero-no-transition'));
      });
    }
  }
  function heroRenderTransition(progress){
    const p=Math.max(0,Math.min(1,progress));
    const rp=Math.min(1,p/.55); /* accelerated reveal: wipe finishes well before drag is fully complete */
    const leaving=heroChoices[heroMobilePage];
    const entering=heroChoices[1-heroMobilePage];
    const leavingContent=leaving.querySelector('.hero-choice-content');
    const enteringContent=entering.querySelector('.hero-choice-content');
    const leavingMarker=leaving.querySelector('.hero-corner-label');
    const enteringMarker=entering.querySelector('.hero-corner-label');

    leaving.style.zIndex='2';
    leaving.style.clipPath=heroFullClip();
    leaving.style.filter=`brightness(${(1-.28*rp).toFixed(3)})`;
    leavingContent.style.opacity=Math.max(0,1-p/.35).toFixed(3);
    leavingContent.style.transform=`translateX(${-18*p}px) scale(${(1-.025*p).toFixed(3)})`;
    leavingMarker.style.opacity='0';

    entering.style.zIndex='4';
    entering.style.clipPath=heroRevealClip(rp);
    entering.style.filter=`brightness(${(.66+.34*rp).toFixed(3)})`;
    enteringContent.style.opacity=Math.min(1,p/.45).toFixed(3);
    enteringContent.style.transform=`translateX(${26*(1-p)}px) scale(${(.96+.04*p).toFixed(3)})`;
    enteringMarker.style.opacity=Math.max(0,1-p*3).toFixed(3);
  }
  function heroFinishTransition(commit){
    if(!heroIsMobile())return;
    heroSelectorEl.classList.remove('is-dragging');
    heroDragging=false;
    heroAnimating=true;
    heroRenderTransition(commit?1:0);
    const duration=heroMotionQuery.matches?10:640;
    heroFinishTimer=setTimeout(()=>{
      heroSetMobileStable(commit?1-heroMobilePage:heroMobilePage,true);
    },duration);
  }
  function heroAnimateToOther(){
    if(!heroIsMobile()||heroDragging||heroAnimating)return;
    heroAnimating=true;
    heroRenderTransition(0);
    requestAnimationFrame(()=>{
      requestAnimationFrame(()=>heroFinishTransition(true));
    });
  }
  function heroBeginDrag(clientX,clientY,source,pointerId=null){
    if(!heroIsMobile()||heroAnimating||heroDragging)return;
    heroDragging=true;
    heroDragSource=source;
    heroPointerId=pointerId;
    heroDragStartX=clientX;
    heroDragStartY=clientY;
    heroDragDeltaX=0;
    heroDragStartedAt=performance.now();
    heroSuppressClick=false;
    heroSelectorEl.classList.add('is-dragging');
    heroRenderTransition(0);
  }
  function heroMoveDrag(clientX,clientY){
    if(!heroIsMobile()||!heroDragging)return;
    const deltaX=clientX-heroDragStartX;
    const deltaY=clientY-heroDragStartY;
    if(Math.abs(deltaY)>Math.abs(deltaX)*1.25&&Math.abs(deltaY)>14)return;
    heroDragDeltaX=deltaX;
    if(Math.abs(deltaX)>7)heroSuppressClick=true;
    const width=Math.max(heroSelectorEl.clientWidth,1);
    const progress=Math.min(1,Math.abs(deltaX)/(width*.72));
    heroRenderTransition(progress);
  }
  function heroEndDrag(){
    if(!heroIsMobile()||!heroDragging)return;
    const elapsed=Math.max(performance.now()-heroDragStartedAt,1);
    const velocity=Math.abs(heroDragDeltaX)/elapsed;
    const distance=Math.abs(heroDragDeltaX);
    const threshold=Math.min(72,heroSelectorEl.clientWidth*.15);
    const isTap=distance<4;
    heroDragSource=null;
    heroPointerId=null;
    heroDragDeltaX=0;
    if(isTap){
      /* near-zero movement: let the click handler decide instead of forcing a revert */
      heroDragging=false;
      heroSelectorEl.classList.remove('is-dragging');
      heroChoices.forEach(heroClearInline);
      return;
    }
    const commit=distance>=threshold||velocity>.38;
    heroFinishTransition(commit);
  }

  function heroSelectChoice(choice){
    if(heroIsMobile())return;
    const alreadyActive=choice.classList.contains('active');
    heroChoices.forEach(item=>item.classList.remove('active'));
    if(alreadyActive){
      heroSelectorEl.classList.remove('has-selection');
      return;
    }
    choice.classList.add('active');
    heroSelectorEl.classList.add('has-selection');
  }

  heroChoices.forEach((choice,index)=>{
    choice.addEventListener('click',(event)=>{
      if(heroSuppressClick){
        event.preventDefault();
        event.stopPropagation();
        heroSuppressClick=false;
        return;
      }
      if(heroIsMobile()){
        if(index!==heroMobilePage)heroAnimateToOther();
        return;
      }
      heroSelectChoice(choice);
    });
    choice.addEventListener('keydown',(event)=>{
      if(event.key!=='Enter'&&event.key!==' ')return;
      if(heroIsMobile()){
        if(index!==heroMobilePage){
          event.preventDefault();
          heroAnimateToOther();
        }
        return;
      }
      event.preventDefault();
      heroSelectChoice(choice);
    });
  });

  heroSelectorEl.addEventListener('pointerdown',(event)=>{
    if(!heroIsMobile())return;
    if(event.pointerType==='mouse'&&event.button!==0)return;
    heroBeginDrag(event.clientX,event.clientY,'pointer',event.pointerId);
  });
  window.addEventListener('pointermove',(event)=>{
    if(!heroDragging||heroDragSource!=='pointer'||heroPointerId!==event.pointerId)return;
    event.preventDefault();
    heroMoveDrag(event.clientX,event.clientY);
  },{passive:false});
  window.addEventListener('pointerup',(event)=>{
    if(!heroDragging||heroDragSource!=='pointer'||heroPointerId!==event.pointerId)return;
    heroEndDrag();
  });
  window.addEventListener('pointercancel',(event)=>{
    if(!heroDragging||heroDragSource!=='pointer'||heroPointerId!==event.pointerId)return;
    heroEndDrag();
  });
  heroSelectorEl.addEventListener('touchstart',(event)=>{
    if(!heroIsMobile()||heroDragging||heroAnimating)return;
    const touch=event.touches[0];
    if(!touch)return;
    heroBeginDrag(touch.clientX,touch.clientY,'touch');
  },{passive:true});
  window.addEventListener('touchmove',(event)=>{
    if(!heroDragging||heroDragSource!=='touch')return;
    const touch=event.touches[0];
    if(!touch)return;
    const deltaX=touch.clientX-heroDragStartX;
    const deltaY=touch.clientY-heroDragStartY;
    if(Math.abs(deltaY)>Math.abs(deltaX)*1.25&&Math.abs(deltaY)>14){
      /* vertical scroll intent: abandon the swipe, let the page scroll natively */
      heroDragging=false;
      heroDragSource=null;
      heroPointerId=null;
      heroSelectorEl.classList.remove('is-dragging');
      heroChoices.forEach(heroClearInline);
      return;
    }
    event.preventDefault();
    heroMoveDrag(touch.clientX,touch.clientY);
  },{passive:false});
  window.addEventListener('touchend',()=>{
    if(heroDragging&&heroDragSource==='touch')heroEndDrag();
  },{passive:true});
  window.addEventListener('touchcancel',()=>{
    if(heroDragging&&heroDragSource==='touch')heroEndDrag();
  },{passive:true});

  heroSelectorEl.addEventListener('keydown',(event)=>{
    if(!heroIsMobile()||heroAnimating)return;
    if(event.key==='ArrowLeft'||event.key==='ArrowRight'){
      event.preventDefault();
      heroAnimateToOther();
    }
  });

  function heroResetViewport(){
    clearTimeout(heroFinishTimer);
    heroDragging=false;
    heroAnimating=false;
    heroSelectorEl.classList.remove('is-dragging','hero-no-transition','has-selection');
    heroChoices.forEach(choice=>{
      choice.classList.remove('hero-mobile-active','hero-mobile-marker','active');
      choice.style.removeProperty('z-index');
      choice.style.removeProperty('clip-path');
      heroClearInline(choice);
    });
    if(heroIsMobile())heroSetMobileStable(1,true);
  }

  heroMobileQuery.addEventListener('change',heroResetViewport);
  window.addEventListener('resize',()=>{
    if(heroIsMobile()&&!heroDragging&&!heroAnimating)heroSetMobileStable(heroMobilePage,true);
  });

  heroResetViewport();
}

applyLang();
});
