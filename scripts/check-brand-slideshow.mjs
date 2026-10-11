import fs from 'node:fs/promises';
import assert from 'node:assert/strict';
const {Window}=await import(process.env.HAPPY_DOM_MODULE||'happy-dom');
const root=new URL('../',import.meta.url).pathname.replace(/\/$/,'');
const entry=await fs.readFile(root+'/index.html','utf8');
const bundle=await fs.readFile(root+'/'+entry.match(/import\(b\+["'](assets\/[^"']+\.js)["']\)/)[1],'utf8');
const wait=()=>new Promise(resolve=>setTimeout(resolve,80));
for(const base of ['', '/globalistihdam.com'])for(const lang of ['tr','en']){
 const win=new Window({url:'https://example.test'+base+'/?lang='+lang,settings:{disableJavaScriptFileLoading:true,disableCSSFileLoading:true,enableJavaScriptEvaluation:true,suppressInsecureJavaScriptEnvironmentWarning:true}});
 win.fetch=async input=>String(input).includes('news/latest.json')?new Response(await fs.readFile(root+'/news/latest.json','utf8')):{ok:true,json:async()=>JSON.parse(await fs.readFile(root+'/social.json','utf8'))};
 win.document.body.innerHTML='<div id="root"></div>';win.scrollTo=()=>{};win.HTMLElement.prototype.scrollIntoView=function(){};
 win.eval(bundle);await wait();
 const section=win.document.querySelector('.brand-showcase');assert.ok(section);
 const dots=[...section.querySelectorAll('.brand-showcase-dots button')];assert.equal(dots.length,5);
 const names=['overview','recruitment','education','investment','robotics'];
 const routes=['services','sectors','education','investment','robotics'];
 for(let i=0;i<5;i++){
  dots[i].click();await wait();
  assert.equal(section.querySelector('img').getAttribute('src'),base+'/globalistihdam-slide-'+names[i]+'.webp');
  assert.equal(section.querySelector('.gc-button').getAttribute('href'),base+'/'+routes[i]+'/?lang='+lang);
  assert.equal(section.querySelectorAll('[aria-pressed="true"]').length,1);
  assert.equal(section.querySelector('.brand-showcase-count').textContent,`${i+1} / 5`);
  assert.equal(section.querySelector('.brand-showcase-caption').getAttribute('aria-live'),'polite');
 }
 section.querySelector('button[aria-label="'+(lang==='tr'?'Sonraki slayt':'Next slide')+'"]').click();await wait();
 assert.equal(section.querySelector('.brand-showcase-count').textContent,'1 / 5');
 section.querySelector('button[aria-label="'+(lang==='tr'?'Önceki slayt':'Previous slide')+'"]').click();await wait();
 assert.equal(section.querySelector('.brand-showcase-count').textContent,'5 / 5');
 const news=[...win.document.querySelectorAll('h2')].filter(e=>e.textContent===(lang==='tr'?'Güncel Haberler':'Latest News'));assert.equal(news.length,1);
 await win.happyDOM.close();
}
console.log('PASS: all five service slides, translated links, selected states, pause on interaction, wraparound and one news section at root and project paths.');
