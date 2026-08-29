/* 月謝帳 ── 動きは3種類だけ。
   M-13 目盛りが右へ伸びる／M-14 段が開いて畳まれる／M-15 現在地の柱が移る
   スクロールイベントは1つも使わない（P-22）。 */
(function(){
  'use strict';
  var d=document, root=d.documentElement;

  /* 画面の高さを実測して固定する（P-14 / R-09）。
     幅が変わったときだけ測り直す＝スマホのアドレスバー伸縮でガタつかせない。 */
  var lastW=0;
  function lvh(){
    if(innerWidth===lastW) return;
    lastW=innerWidth;
    root.style.setProperty('--stable-lvh',(innerHeight/100)+'px');
  }
  lvh(); addEventListener('resize',lvh,{passive:true});
  addEventListener('orientationchange',function(){lastW=0;lvh();});

  /* ① M-13 目盛りが右へ伸びる ── 見えたら1回だけ */
  var rv=[].slice.call(d.querySelectorAll('.rv'));
  if(!('IntersectionObserver' in window)){
    rv.forEach(function(e){e.setAttribute('data-rv','in');});
  }else{
    var io=new IntersectionObserver(function(es){
      es.forEach(function(en){
        if(en.isIntersecting){ en.target.setAttribute('data-rv','in'); io.unobserve(en.target); }
      });
    },{threshold:0,rootMargin:'160px 0px 160px 0px'});
    rv.forEach(function(e){ io.observe(e); });
  }

  /* ② M-14 段が開いて畳まれる */
  [].slice.call(d.querySelectorAll('.fold')).forEach(function(f){
    var b=f.querySelector('.fold__btn'), body=f.querySelector('.fold__body');
    if(!b||!body) return;
    var id=body.id||('fold-'+Math.abs(f.offsetTop||0)+'-'+b.textContent.length);
    body.id=id; b.setAttribute('aria-controls',id); b.setAttribute('aria-expanded','false');
    b.addEventListener('click',function(){
      var open=f.getAttribute('data-open')==='1';
      f.setAttribute('data-open',open?'0':'1');
      b.setAttribute('aria-expanded',open?'false':'true');
      var m=f.querySelector('.fold__mark'); if(m) m.textContent=open?'＋':'−';
    });
  });

  /* ③ M-15 現在地の柱が移る */
  var rail=d.querySelector('.rail__list');
  if(rail && 'IntersectionObserver' in window){
    var mark=rail.querySelector('.rail__mark');
    var items=[].slice.call(rail.querySelectorAll('.rail__item'));
    var map={}; items.forEach(function(a){ map[a.getAttribute('href').slice(1)]=a; });
    var secs=[].slice.call(d.querySelectorAll('.band[id]')).filter(function(s){return map[s.id];});
    function move(a){
      items.forEach(function(x){ x.setAttribute('aria-current', x===a?'true':'false'); });
      if(mark){
        mark.style.setProperty('--mark-y',a.offsetTop+'px');
        mark.style.setProperty('--mark-h',a.offsetHeight+'px');
      }
    }
    if(secs.length){
      move(map[secs[0].id]);
      var seen={};
      var io2=new IntersectionObserver(function(es){
        es.forEach(function(en){ seen[en.target.id]=en.isIntersecting; });
        for(var i=0;i<secs.length;i++){
          if(seen[secs[i].id]){ move(map[secs[i].id]); break; }
        }
      },{threshold:0,rootMargin:'-25% 0px -60% 0px'});
      secs.forEach(function(s){ io2.observe(s); });
    }
  }

  /* 図が実際にはみ出しているときだけ、横に動かせることを書き添える */
  function markScroll(){
    [].slice.call(d.querySelectorAll('.fig__scroll')).forEach(function(e){
      var box=e.parentElement; if(!box) return;
      if(e.scrollWidth > e.clientWidth + 2) box.classList.add('is-scrollable');
      else box.classList.remove('is-scrollable');
    });
  }
  markScroll();
  addEventListener('resize', markScroll, {passive:true});

})();
