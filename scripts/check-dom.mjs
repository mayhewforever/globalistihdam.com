import { Window } from 'happy-dom';
import fs from 'node:fs/promises';
import assert from 'node:assert/strict';
const root=new URL('../',import.meta.url).pathname.replace(/\/$/,'');
const runtime=await fs.readFile(root+'/assets/hosting-runtime.js','utf8');
const bundle=await fs.readFile(root+'/assets/index-DQWQZiam.js','utf8');
const legacy=await fs.readFile(root+'/site.js','utf8');
const professionalHome=await fs.readFile(root+'/assets/professional-home.js','utf8');
const searchUI=await fs.readFile(root+'/assets/site-search.js','utf8');
let checks=0;
const pause=()=>new Promise(r=>setTimeout(r,60));
async function open(path,{storage,search='',searchIndex,socialData}={}) {
 const win=new Window({url:'https://example.test'+path+search,settings:{disableJavaScriptFileLoading:true,disableCSSFileLoading:true,enableJavaScriptEvaluation:true,suppressInsecureJavaScriptEnvironmentWarning:true}});
 const errors=[]; const requests=[];
 // Happy DOM incorrectly emits hashchange for replaceState; native browsers do not.
 // Suppress only that synthetic event to model browser History API semantics.
 const replaceState=win.history.replaceState.bind(win.history);let silentURL;
 win.history.replaceState=(...args)=>{silentURL=new URL(args[2],win.location.href).href;return replaceState(...args)};
 win.addEventListener('hashchange',event=>{if(event.newURL===silentURL){silentURL=undefined;event.stopImmediatePropagation()}},true);
 win.console.error=(...parts)=>errors.push(parts.join(' '));
 win.fetch=async input=>{requests.push(String(input));const file=String(input).endsWith('/social.json')?'social.json':String(input).endsWith('/search-index.json')?'search-index.json':null;assert.ok(file,'Unexpected fetch: '+input);return {ok:true,json:async()=>(file==='social.json'?socialData:searchIndex)??JSON.parse(await fs.readFile(root+'/'+file,'utf8'))}};
 win.document.body.innerHTML='<div id="root"></div>';
 const append=win.document.body.appendChild.bind(win.document.body);win.document.body.appendChild=node=>node.tagName==='SCRIPT'&&node.src.endsWith('/site.js')?node:append(node);
 win.document.head.innerHTML='<meta name="description" content="">';
 win.scrollTo=()=>{}; win.HTMLElement.prototype.scrollIntoView=function(){};
 win.HTMLElement.prototype.scrollBy=function(){}; win.HTMLElement.prototype.scrollTo=function(){};
 if(storage!==undefined)win.localStorage.setItem('global-language',storage);
 win.eval(runtime);win.eval(professionalHome);win.eval(bundle);
 await pause();
 if(win.GlobalistihdamRuntime.path()==='/') win.eval(legacy);
 win.eval(searchUI);
 await pause();
 return {win,errors,requests};
}
const {win:w,errors,requests}=await open('/globalistihdam.com/',{storage:'not-a-language',search:'?lang=en'});
assert.equal(w.document.documentElement.lang,'en');checks++;
assert.ok(w.document.querySelector('#main h1')); checks++;
assert.ok(requests.includes('/globalistihdam.com/social.json'));checks++;
// Brand campaign sections and working carousel controls must survive the refresh.
for(const selector of ['.pro-home-hero','.pro-service-strip','.home-journeys','.pro-editorial','.pro-investment-band','.home-insight-band','.pro-contact-band']) {
 assert.ok(w.document.querySelector(selector),selector);checks++;
}
assert.equal(w.document.querySelectorAll('#main h1').length,1);checks++;
assert.equal(w.document.querySelectorAll('.pro-slide').length,4);checks++;
assert.equal(w.document.querySelectorAll('.pro-sector-card').length,6);checks++;
assert.equal(w.document.querySelectorAll('#services').length,1);checks++;
const heroTrack=w.document.querySelector('.pro-hero-track');
const scrollCalls=[];heroTrack.scrollBy=options=>scrollCalls.push(options.left);
Object.defineProperty(heroTrack.children[0],'offsetLeft',{value:0});
Object.defineProperty(heroTrack.children[1],'offsetLeft',{value:1000});
heroTrack.dispatchEvent(new w.KeyboardEvent('keydown',{key:'ArrowRight',bubbles:true}));
heroTrack.dispatchEvent(new w.KeyboardEvent('keydown',{key:'ArrowLeft',bubbles:true}));
assert.deepEqual(scrollCalls,[1000,-1000]);checks++;
const showAll=w.document.querySelector('.pro-sector-section .slider-view');
showAll.click();assert.equal(showAll.getAttribute('aria-pressed'),'true');checks++;
assert.ok([...w.document.querySelectorAll('.pro-sector-card')].every(slide=>!slide.inert));checks++;
showAll.click();assert.equal(showAll.getAttribute('aria-pressed'),'false');checks++;
w.document.querySelector('[data-lang="tr"]').click();await pause();
assert.equal(w.document.querySelectorAll('.pro-slide').length,4);checks++;
assert.equal(w.document.querySelectorAll('.pro-sector-card').length,6);checks++;
w.document.querySelector('[data-lang="en"]').click();await pause();

w.location.hash='#en/education';await pause();
const forms=w.document.querySelectorAll('[data-preference-form]');
assert.ok(forms.length>=1);checks++;
const candidate=[...forms].find(x=>x.dataset.preferenceForm==='student');

candidate.elements.namedItem('field').value='Mechanical engineer';
w.document.querySelector('[data-lang="tr"]').click();await pause();
assert.equal(w.document.documentElement.lang,'tr');checks++;
assert.match(w.document.querySelector('.brand-social').textContent,/Dünyaya/);checks++;

assert.equal(w.document.querySelector('[data-preference-form="student"]').elements.namedItem('field').value,'Mechanical engineer');checks++;
assert.equal(w.document.querySelector('[data-preference-form="student"]').elements.namedItem('lang').value,'tr');checks++;
w.document.querySelector('[data-lang="en"]').click();await pause();
assert.equal(w.document.documentElement.lang,'en');checks++;
assert.match(w.document.querySelector('.brand-social').textContent,/connect with the world/);checks++;
for(const page of ['corporate','contact','training','media','home']) {
 w.location.hash='#en/'+page;await pause();
 assert.ok(w.document.querySelector('#main h1'));checks++;
 const title=w.document.querySelector('#main h1').textContent;
 w.document.querySelector('a[href="#main"]').click();await pause();
 assert.equal(w.document.querySelector('#main h1').textContent,title);checks++;
 assert.equal(w.document.activeElement.id,'main');checks++;
}
const menu=w.document.querySelector('.menu-toggle');menu.click();assert.equal(menu.getAttribute('aria-expanded'),'true');checks++;
w.document.dispatchEvent(new w.KeyboardEvent('keydown',{key:'Escape',bubbles:true}));assert.equal(menu.getAttribute('aria-expanded'),'false');checks++;
assert.equal(w.document.activeElement,menu);checks++;
for(const img of w.document.querySelectorAll('img')) {assert.ok(!img.src.includes('chatgpt.site'),img.src);checks++}
// Search is local, returns existing routes, and restores keyboard focus.
const toggle=w.document.querySelector('.gi-search-toggle');toggle.click();await pause();
const dialog=w.document.querySelector('.gi-search-dialog');assert.ok(dialog.open);checks++;
const searchInput=dialog.querySelector('input');searchInput.value='Canada';searchInput.dispatchEvent(new w.Event('input',{bubbles:true}));await pause();
assert.ok(dialog.querySelectorAll('.gi-search-result').length>0);checks++;
assert.ok([...dialog.querySelectorAll('.gi-search-result')].every(link=>link.href.startsWith('https://example.test/globalistihdam.com/')));checks++;
searchInput.value='zzznomatchzz';searchInput.dispatchEvent(new w.Event('input',{bubbles:true}));await pause();
assert.equal(dialog.querySelectorAll('.gi-search-result').length,0);checks++;
assert.match(dialog.querySelector('[role="status"]').textContent,/No results/);checks++;
dialog.dispatchEvent(new w.KeyboardEvent('keydown',{key:'Escape',bubbles:true}));await pause();
assert.ok(!dialog.open);checks++;assert.equal(w.document.activeElement,toggle);checks++;
assert.deepEqual(errors,[]);checks++;
await w.happyDOM.close();
for(const path of ['/education/','/education/germany/index.html','/universities/final-international-university/','/investment/canada/','/sectors/healthcare/','/privacy/']) {
 for(const base of ['','/globalistihdam.com']) {
  const {win,errors}=await open(base+path,{search:'?lang=en'});
  assert.ok(win.document.querySelector('h1'),path);checks++;
  assert.doesNotMatch(win.document.body.textContent,/Page not found|could not load/);checks++;
  const button=win.document.querySelector('.pro-menu');
  if(button){button.click();await pause();assert.equal(button.getAttribute('aria-expanded'),'true');checks++;
    win.document.dispatchEvent(new win.KeyboardEvent('keydown',{key:'Escape',bubbles:true}));await pause();assert.equal(button.getAttribute('aria-expanded'),'false');checks++}
  assert.deepEqual(errors,[],path);checks++;
  for(const node of win.document.querySelectorAll('[href],[src]')) {
   const ref=node.getAttribute('href')||node.getAttribute('src');
   if(ref.startsWith('/')&&!ref.startsWith('//')) {assert.ok(ref.startsWith(base+'/'),ref);checks++}
  }
  await win.happyDOM.close();
 }
}
// Untrusted text stays text; malformed configuration cannot create an executable
// search link, leave the deployment prefix or impersonate a social platform.
for (const base of ['/', '/globalistihdam.com/']) {
 const unsafePaths=['javascript:alert(1)','data:text/html,unsafe','//evil.test/','/\\evil.test/','/%2f%2fevil.test/','/%5cevil.test/','/\nevil.test/','/%0aevil.test/','/../outside/','/%2e%2e/outside/','https://evil.test/','relative/path','/portal?type=student'];
 const title='<img id="gi-injected" src=x onerror=alert(1)>';
 const entries=[...unsafePaths.map(path=>({path,title:'Unsafe',description:'Configuration test'})),null,{path:'/education/',title:{},description:'Invalid shape'},{path:'/education/?lang=en',title,description:'<svg onload=alert(1)>'}];
 const {win,errors}=await open(base,{search:'?lang=en',searchIndex:{tr:entries,en:entries},socialData:{links:{instagram:'javascript:alert(1)',youtube:'https://www.youtube.com/channel/UCDsoaujCJYj1Be6rkjM_94Q',tiktok:'https://www.tiktok.com.evil.test/profile'}}});
 win.document.querySelector('.gi-search-toggle').click();await pause();
 const links=[...win.document.querySelectorAll('.gi-search-result')];
 assert.equal(links.length,1);checks++;
 assert.equal(links[0].href,'https://example.test'+base+'education/?lang=en');checks++;
 assert.equal(links[0].querySelector('strong').textContent,title);checks++;
 assert.equal(win.document.querySelector('#gi-injected'),null);checks++;
 assert.equal(links[0].querySelector('svg'),null);checks++;
 const socialLinks=[...win.document.querySelectorAll('.brand-social-links a')];
 assert.equal(socialLinks.length,1);checks++;
 assert.equal(new URL(socialLinks[0].href).hostname,'www.youtube.com');checks++;
 assert.deepEqual(errors,[]);checks++;
 await win.happyDOM.close();
}
console.log('PASS',checks,'DOM interaction and route checks (no visual browser or external form submission).');
