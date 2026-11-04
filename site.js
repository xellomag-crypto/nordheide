/* nordheide-stories.de · Menü, Kopfzeile, Karte, Rubrik-Filter, Formular */
/* Jede Seite beginnt oben. Nur Links mit #Anker (z. B. #orte) springen an ihre Stelle. */
(function(){
 try{ if("scrollRestoration" in history) history.scrollRestoration="manual"; }catch(e){}
 function top(){ if(!location.hash || location.hash==="#alle"){ window.scrollTo(0,0); document.documentElement.scrollTop=0; document.body.scrollTop=0; } }
 top();
 document.addEventListener("DOMContentLoaded",top);
 window.addEventListener("load",top);
 window.addEventListener("pageshow",top);
})();
(function(){
 /* Menü + Kopfzeile über dem Cover */
 var m=document.getElementById("menu"),b=document.querySelector("[data-open]"),bar=document.getElementById("bar"),cov=document.querySelector(".cover");
 function set(o){m.classList.toggle("open",o);b.setAttribute("aria-expanded",o);document.body.style.overflow=o?"hidden":""}
 if(b&&m){
  b.addEventListener("click",function(){set(true)});
  m.querySelectorAll("[data-close], a").forEach(function(e){e.addEventListener("click",function(){set(false)})});
  document.addEventListener("keydown",function(e){if(e.key==="Escape")set(false)});
 }
 if(cov&&bar){var upd=function(){bar.classList.toggle("over",cov.getBoundingClientRect().bottom>70)};window.addEventListener("scroll",upd,{passive:true});upd()}

 /* Karte: Pin wählen, Geschichte unten zeigen */
 var card=document.getElementById("mapCard");
 if(card){
  var pins=document.querySelectorAll(".pin");
  var pick=function(p){
   pins.forEach(function(x){x.classList.toggle("on",x===p)});
   card.innerHTML='<div><span class="lab">'+p.dataset.ort+' · '+p.dataset.lab+'</span><b>'+p.dataset.t+'</b></div><a class="more" href="'+p.dataset.href+'">Ansehen</a>';
  };
  pins.forEach(function(p){
   p.addEventListener("click",function(){pick(p)});
   p.addEventListener("mouseenter",function(){pick(p)});
   p.addEventListener("keydown",function(e){if(e.key==="Enter"||e.key===" "){e.preventDefault();pick(p)}});
  });
 }

 /* Geschichten: Filter über #rubrik */
 var list=document.getElementById("list");
 if(list){
  var tabs=document.querySelectorAll("[data-tab]"),empty=document.getElementById("empty");
  var show=function(){
   var k=(location.hash||"#alle").slice(1),n=0;
   if(!document.querySelector('[data-tab="'+k+'"]'))k="alle";
   tabs.forEach(function(t){if(t.dataset.tab===k)t.setAttribute("aria-current","true");else t.removeAttribute("aria-current")});
   list.querySelectorAll(".item").forEach(function(i){var on=k==="alle"||i.dataset.f===k;i.hidden=!on;if(on)n++});
   if(empty)empty.hidden=n>0;
  };
  window.addEventListener("hashchange",show);show();
 }

 /* Erzähl uns: geht an send-mail.php (liegt auf IONOS neben index.html) */
 var f=document.getElementById("satzForm");
 if(f){
  var done=document.getElementById("done"),err=document.getElementById("err"),btn=f.querySelector(".send");
  f.addEventListener("submit",function(e){
   e.preventDefault();err.style.display="none";
   if(!f.checkValidity()){err.textContent="Bitte Satz, Name und E-Mail ausfüllen.";err.style.display="block";return}
   btn.disabled=true;btn.textContent="Wird gesendet …";
   fetch("send-mail.php",{method:"POST",body:new FormData(f)})
    .then(function(r){return r.json()})
    .then(function(j){if(j.status!=="ok")throw 0;f.style.display="none";done.style.display="block"})
    .catch(function(){
     err.textContent="Das Absenden klappt erst auf nordheide-stories.de. In der Vorschau geht noch nichts raus.";
     err.style.display="block";btn.disabled=false;btn.textContent="Absenden";
    });
  });
 }
})();

/* Bildstrecke im Beitrag: wischen auf dem Handy, Pfeile am Desktop, Zähler und Striche */
(function(){
 document.querySelectorAll("[data-strecke]").forEach(function(s){
  var bahn=s.querySelector(".bahn"),fig=bahn.querySelectorAll("figure"),n=fig.length;
  var zahl=s.querySelector(".zahl"),punkte=s.querySelectorAll(".punkte i");
  var zur=s.querySelector("[data-zur]"),vor=s.querySelector("[data-vor]");
  function idx(){var l=bahn.getBoundingClientRect().left+parseFloat(getComputedStyle(bahn).paddingLeft),b=0,d=1e9;fig.forEach(function(f,i){var x=Math.abs(f.getBoundingClientRect().left-l);if(x<d){d=x;b=i}});return b}
  function upd(){var i=idx();if(zahl)zahl.textContent=(i+1)+" / "+n;punkte.forEach(function(p,k){p.classList.toggle("an",k===i)});if(zur)zur.disabled=i===0;if(vor)vor.disabled=i===n-1}
  function geh(i){i=Math.max(0,Math.min(n-1,i));bahn.scrollTo({left:fig[i].offsetLeft-fig[0].offsetLeft,behavior:"smooth"})}
  var t;bahn.addEventListener("scroll",function(){clearTimeout(t);t=setTimeout(upd,60)},{passive:true});
  if(zur)zur.addEventListener("click",function(){geh(idx()-1)});
  if(vor)vor.addEventListener("click",function(){geh(idx()+1)});
  bahn.addEventListener("keydown",function(e){if(e.key==="ArrowRight"){e.preventDefault();geh(idx()+1)}if(e.key==="ArrowLeft"){e.preventDefault();geh(idx()-1)}});
  window.addEventListener("resize",upd);upd();
 });
})();
/* Blöcke blenden beim Lesen leise ein */
(function(){
 if(!("IntersectionObserver" in window))return;
 if(window.matchMedia&&matchMedia("(prefers-reduced-motion: reduce)").matches)return;
 var el=document.querySelectorAll(".mag .mag-zitat,.mag .mag-zahl,.mag .satz h3,.mag .steckbrief,.mag:not(.ios) .bahn figure,.mag .strecke-titel,.mag .einzel,.mag .naechste .txt");
 if(!el.length)return;
 document.documentElement.classList.add("js");
 var io=new IntersectionObserver(function(es){es.forEach(function(e){if(e.isIntersecting){e.target.classList.add("da");io.unobserve(e.target)}})},{rootMargin:"0px 0px -8% 0px",threshold:.08});
 el.forEach(function(x){x.classList.add("leise");io.observe(x)});
})();

/* iPhone-Gefühl: Seitenwechsel rückwärts, Kopfzeile, Titelbild, Tiefe in der Wischreihe */
(function(){
 try{
  addEventListener("pageswap",function(e){if(e.viewTransition&&e.activation&&e.activation.navigationType==="traverse")e.viewTransition.types.add("zurueck")});
  addEventListener("pagereveal",function(e){if(e.viewTransition&&window.navigation&&navigation.activation&&navigation.activation.navigationType==="traverse")e.viewTransition.types.add("zurueck")});
 }catch(x){}
 var m=document.querySelector(".mag.ios");if(!m)return;
 var bar=document.getElementById("bar"),last=window.scrollY;
 if(bar)addEventListener("scroll",function(){var y=window.scrollY;if(y>last+6&&y>140)bar.classList.add("weg");else if(y<last-6||y<140)bar.classList.remove("weg");last=y},{passive:true});
 if(window.matchMedia&&matchMedia("(prefers-reduced-motion: reduce)").matches)return;
 var hero=m.querySelector(".mag-open"),img=hero&&hero.querySelector(".bg img"),bereit=false;
 if(img){
  var los=function(){bereit=true;img.style.animation="none";img.style.opacity="1";hero_upd()};
  img.addEventListener("animationend",los);setTimeout(los,2000);
 }
 var tick=false;
 function hero_upd(){if(!img||!bereit)return;var y=window.scrollY,h=hero.offsetHeight;
  if(y<0){img.style.transform="scale("+(1+(-y)/h*.9)+")";img.style.opacity="1";return}
  if(y>h)return;var t=y/h;img.style.transform="translate3d(0,"+(y*.38)+"px,0) scale("+(1+t*.07)+")";img.style.opacity=String(1-t*.45)}
 addEventListener("scroll",function(){if(!tick){tick=true;requestAnimationFrame(function(){tick=false;hero_upd()})}},{passive:true});
 m.querySelectorAll(".bahn").forEach(function(bahn){
  var fig=bahn.querySelectorAll("figure"),t2=false;
  function tiefe(){var l=bahn.getBoundingClientRect().left+parseFloat(getComputedStyle(bahn).paddingLeft);
   fig.forEach(function(f){var w=f.offsetWidth,d=Math.min(1,Math.abs(f.getBoundingClientRect().left-l)/w);
    f.style.transform="scale("+(1-d*.07)+")";f.style.opacity=String(1-d*.45)})}
  bahn.addEventListener("scroll",function(){if(!t2){t2=true;requestAnimationFrame(function(){t2=false;tiefe()})}},{passive:true});
  addEventListener("resize",tiefe);tiefe();
 });
})();
/* Startseite: jede Geschichte setzt sich beim Einrasten ruhig hin */
(function(){
 if(!document.body.classList.contains("start")||!("IntersectionObserver" in window))return;
 var el=document.querySelectorAll(".start .folge");
 var io=new IntersectionObserver(function(es){es.forEach(function(e){e.target.classList.toggle("sitzt",e.intersectionRatio>.55)})},{threshold:[0,.55,1]});
 el.forEach(function(x){x.classList.add("rast");io.observe(x)});
})();
