'use client';

import {useEffect, useState} from 'react';
import {ArrowLeft, ArrowRight, Pause, Play} from 'lucide-react';
import './brand-slideshow.css';

const slides = [
  {id:'overview', path:'/services', title:{tr:'Globalistihdam',en:'Globalistihdam'}, detail:{tr:'İstihdam, uluslararası eğitim, yatırım ve robotik için rehberlik.',en:'Guidance for recruitment, international education, investment and robotics.'}},
  {id:'recruitment', path:'/sectors', title:{tr:'İstihdam ve Kariyer',en:'Recruitment & Careers'}, detail:{tr:'İşverenler ve adaylar için rehberlik.',en:'Guidance for employers and candidates.'}},
  {id:'education', path:'/education', title:{tr:'Uluslararası Eğitim',en:'International Education'}, detail:{tr:'Ülkeleri, üniversiteleri ve eğitim yollarını keşfedin.',en:'Explore countries, universities and study pathways.'}},
  {id:'investment', path:'/investment', title:{tr:'Yatırım ve Pazara Giriş',en:'Investment & Market Entry'}, detail:{tr:'Yeni pazarlar için araştırma ve hazırlık.',en:'Research and preparation for new markets.'}},
  {id:'robotics', path:'/robotics', title:{tr:'İnsansı Robotik',en:'Humanoid Robotics'}, detail:{tr:'Endüstriyel ihtiyaçlar ve proje değerlendirmesi.',en:'Industrial needs and project assessment.'}},
] as const;

export default function BrandSlideshow({lang}:{lang:'tr'|'en'}) {
  const [index,setIndex]=useState(0);
  const [playing,setPlaying]=useState(false);
  const [hovered,setHovered]=useState(false);
  const tr=lang==='tr', slide=slides[index];
  useEffect(()=>{
    const preference=window.matchMedia('(prefers-reduced-motion: reduce)');
    setPlaying(!preference.matches);
    const change=()=>setPlaying(!preference.matches);
    preference.addEventListener('change',change);
    return ()=>preference.removeEventListener('change',change);
  },[]);
  useEffect(()=>{
    if(!playing||hovered)return;
    const timer=window.setInterval(()=>{if(!document.hidden)setIndex(value=>(value+1)%slides.length)},8000);
    return ()=>window.clearInterval(timer);
  },[playing,hovered]);
  const select=(next:number)=>{setPlaying(false);setIndex((next+slides.length)%slides.length)};
  return <section className="brand-showcase" aria-label={tr?'Globalistihdam hizmet tanıtımı':'Globalistihdam service showcase'} aria-roledescription={tr?'slayt gösterisi':'carousel'} onMouseEnter={()=>setHovered(true)} onMouseLeave={()=>setHovered(false)} onFocusCapture={event=>{if(!event.currentTarget.contains(event.relatedTarget as Node|null))setPlaying(false)}}>
    <div className="brand-showcase-inner">
      <div className="brand-showcase-image" role="group" aria-roledescription={tr?'slayt':'slide'} aria-label={`${index+1} / ${slides.length}: ${slide.title[lang]}`}>
        <img src={`/globalistihdam-slide-${slide.id}.webp`} alt={`${slide.title.tr} / ${slide.title.en}. ${slide.detail.tr} ${slide.detail.en} globalistihdam.com`} width={1672} height={941} fetchPriority={index===0?'high':'auto'} decoding="async"/>
      </div>
      <div className="brand-showcase-caption" aria-live={playing?'off':'polite'} aria-atomic="true">
        <div><p className="brand-showcase-kicker">{tr?'DÜNYAYA AÇILAN FIRSATLAR':'EXPLORE INTERNATIONAL OPPORTUNITIES'}</p><h1 id="home-title">{slide.title[lang]}</h1><p>{slide.detail[lang]}</p></div>
        <a className="gc-button" href={`${slide.path}?lang=${lang}`}>{tr?'Hizmeti keşfedin':'Explore the service'}<ArrowRight size={18} aria-hidden="true"/></a>
      </div>
      <div className="brand-showcase-controls">
        <div className="brand-showcase-dots" aria-label={tr?'Slayt seçimi':'Choose a slide'}>{slides.map((item,i)=><button key={item.id} type="button" onClick={()=>select(i)} aria-label={`${i+1}. ${item.title[lang]}`} aria-pressed={i===index}><span/></button>)}</div>
        <span className="brand-showcase-count">{index+1} / {slides.length}</span>
        <button type="button" onClick={()=>select(index-1)} aria-label={tr?'Önceki slayt':'Previous slide'}><ArrowLeft size={18}/></button>
        <button type="button" onClick={()=>setPlaying(value=>!value)} aria-label={playing?(tr?'Slayt gösterisini duraklat':'Pause slideshow'):(tr?'Slayt gösterisini oynat':'Play slideshow')}>{playing?<Pause size={18}/>:<Play size={18}/>}</button>
        <button type="button" onClick={()=>select(index+1)} aria-label={tr?'Sonraki slayt':'Next slide'}><ArrowRight size={18}/></button>
      </div>
      <p className="brand-showcase-note">{tr?'Görseller yapay zekâ ile oluşturulmuş temsili tasarımlardır.':'Images are illustrative designs created with AI.'}</p>
    </div>
  </section>;
}
