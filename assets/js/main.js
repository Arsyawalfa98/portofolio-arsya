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

applyLang();
});
