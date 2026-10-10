const {Window}=await import(process.env.HAPPY_DOM_MODULE || 'happy-dom');
import fs from 'node:fs/promises';
import assert from 'node:assert/strict';
const root=process.argv[2] || new URL('../',import.meta.url).pathname.replace(/\/$/,'');
const bundleName=(await fs.readdir(root+'/assets')).find(f=>f.endsWith('.js'));
const bundle=await fs.readFile(root+'/assets/'+bundleName,'utf8');
const social=JSON.parse(await fs.readFile(root+'/social.json','utf8'));
const pause=()=>new Promise(resolve=>setTimeout(resolve,40));
let checks=0;
const manifest=JSON.parse(await fs.readFile(root+'/deployment-manifest.json','utf8'));
for(const file of manifest.files.filter(file=>file.path.endsWith('/index.html')||file.path==='index.html')) {
 const html=await fs.readFile(root+'/'+file.path,'utf8');
 assert.ok(html.includes('id="root"'),file.path);checks++;
 assert.ok(html.includes(bundleName),file.path);checks++;
}

for(const base of ['','/globalistihdam.com']) for(const lang of ['tr','en']) {
 let expectedNav;
 for(const route of ['/','/about/','/contact/','/services/','/contact/index.html','/education/','/education/germany/','/universities/manitoba/','/investment/','/sectors/healthcare/','/robotics/']) {
  const win=new Window({url:'https://example.test'+base+route+'?lang='+lang+'&campaign=test',settings:{disableJavaScriptFileLoading:true,disableCSSFileLoading:true,enableJavaScriptEvaluation:true,suppressInsecureJavaScriptEnvironmentWarning:true}});
  const errors=[],requests=[];
  win.console.error=(...parts)=>errors.push(parts.join(' '));
  win.fetch=async input=>{requests.push(String(input));assert.equal(String(input),base+'/social.json');return {ok:true,json:async()=>social}};
  win.document.head.innerHTML='<meta name="description" content=""><link rel="canonical" href=""><meta name="robots" content="">';
  win.document.body.innerHTML='<div id="root"></div>';
  win.HTMLElement.prototype.scrollIntoView=function(){};win.scrollTo=()=>{};win.HTMLElement.prototype.scrollBy=function(){};
  win.eval(bundle);await pause();await pause();
  assert.ok(win.document.querySelector('main h1'),`${base+route}: missing h1; ${errors}`);checks++;
  assert.doesNotMatch(win.document.body.textContent,/Page not found|Sayfa bulunamadı|could not be loaded|Sayfa yüklenemedi/);checks++;
  assert.equal(win.document.documentElement.lang,lang);checks++;
  const nav=[...win.document.querySelectorAll('#public-navigation a')].map(a=>[a.textContent,a.getAttribute('href')]);
  if(!expectedNav) expectedNav=nav;
  assert.deepEqual(nav,expectedNav,route+' navigation differs');checks++;
  for(const element of win.document.querySelectorAll('a[href],form[action],img[src]')) {
   const ref=element.getAttribute('href')||element.getAttribute('action')||element.getAttribute('src');
   if(ref.startsWith('/')&&!ref.startsWith('//')) {assert.ok(ref.startsWith(base+'/'),`${route} has unprefixed reference: ${ref}`);checks++;}
  }
  const contact=[...win.document.querySelectorAll('#public-navigation a')].find(a=>new URL(a.href).pathname.endsWith('/contact/'));
  assert.ok(contact);checks++;
  const language=win.document.querySelector('.pro-language a[lang="'+(lang==='tr'?'en':'tr')+'"]');
  language.addEventListener('click',event=>event.preventDefault());language.click();await pause();
  assert.ok(language.getAttribute('href').startsWith(base+'/'));checks++;
  assert.equal(new URL(language.href).searchParams.get('campaign'),'test');checks++;
  const form=win.document.querySelector('form[action]');
  if(form) {assert.ok(form.action.startsWith('https://global-istihdam.mtoman.chatgpt.site/portal'));checks++;}
  assert.deepEqual(errors,[],route);checks++;
  assert.ok(requests.includes(base+'/social.json'));checks++;
  await win.happyDOM.close();
 }
}
console.log(`PASS: ${checks} assertions; ${manifest.routeCount} route shells; 44 bilingual root/project-path renders; identical public navigation, direct contact/about, assets, language queries and portal form handoff.`);
