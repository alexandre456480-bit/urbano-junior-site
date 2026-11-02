const {chromium}=require('playwright');
const {execFileSync}=require('node:child_process');
const fs=require('node:fs');
const assert=require('node:assert/strict');
const path=require('node:path');
const root=path.resolve(__dirname,'..');
const originals={};
for(const file of ['index.html','script.js']) originals['/'+file]=execFileSync('git',['show',`${process.env.MOBILE_BASELINE_REF || '977aebb'}:dist/${file}`],{cwd:root,encoding:'utf8'});
const url='http://127.0.0.1:4173';
(async()=>{
 const b=await chromium.launch({executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true});
 const results=[];
 for(const width of [320,390,600,768,820,821,1440]){
  const measurements=[];
  for(const mode of ['before','after']){
   const p=await b.newPage({viewport:{width,height:844},deviceScaleFactor:1});
   await p.addInitScript(() => { window.setInterval = () => 0; });
   const errors=[];p.on('pageerror',e=>errors.push(e.message));
   p.on('response',r=>{if(r.status()>=400)errors.push(`${r.status()} ${r.url()}`)});
   if(mode==='before') await p.route('**/*',route=>{const pathname=new URL(route.request().url()).pathname; const body=originals[pathname==='/'?'/index.html':pathname];return body?route.fulfill({body,contentType:pathname.endsWith('.js')?'text/javascript':'text/html'}):route.continue()});
   await p.goto(url,{waitUntil:'networkidle'});
   await p.evaluate(()=>document.fonts.ready);
   await p.waitForTimeout(1800);
   const data=await p.evaluate(()=>({
    overflow:document.documentElement.scrollWidth>innerWidth,
    geometry:[...document.querySelectorAll('.site-header,.header-inner,.brand,.brand img,#inicio,#inicio h1,.hero-description,.hero-copy .button,.hero-visual,.hero-photo-frame,.hero-photo,main>section')].map(el=>{const r=el.getBoundingClientRect(),s=getComputedStyle(el);return {class:el.className,x:r.x,y:r.y,w:r.width,h:r.height,font:s.font,fontSize:s.fontSize,filter:s.filter,objectPosition:s.objectPosition}}),
    images:[...document.querySelectorAll('.brand img,.hero-photo')].map(i=>({src:i.currentSrc,complete:i.complete,width:i.naturalWidth})),
    timings:[...document.querySelectorAll('#inicio .motion-line,.hero-photo-frame')].flatMap(el=>el.getAnimations().map(a=>a.effect.getTiming()))
   }));
   assert.equal(data.overflow,false,`${mode} overflow ${width}`); assert.deepEqual(errors,[]);
   assert.ok(data.images.every(i=>i.complete&&i.width>0));
   if([390,1440].includes(width)) await p.screenshot({path:path.join(__dirname,`mobile-perf-${mode}-${width}.png`)});
   measurements.push(data);
   if(mode==='after'&&width===390){
    await p.locator('.menu-toggle').click();assert.equal(await p.locator('.menu-toggle').getAttribute('aria-expanded'),'true');await p.keyboard.press('Escape');
    await p.locator('[data-filter="noivas"]').click();assert.equal(await p.locator('[data-filter="noivas"]').getAttribute('aria-pressed'),'true');
    await p.locator('.portfolio-item:visible .project-open').first().click();assert.equal(await p.locator('#project-dialog').evaluate(d=>d.open),true);await p.keyboard.press('Escape');
   }
   await p.close();
  }
  assert.deepEqual(measurements[1].geometry,measurements[0].geometry,`geometry changed at ${width}`);
  assert.deepEqual(measurements[1].timings,measurements[0].timings,`animation timings changed at ${width}`);
  if(width>820)assert.deepEqual(measurements[1].images,measurements[0].images,'Desktop images changed');
  results.push({width,geometryPreserved:true,animationTimingsPreserved:true,errors:[],images:measurements[1].images.map(i=>i.src.replace(url,''))});
 }
 // Autoplay still changes after the original five-second interval.
 const p=await b.newPage({viewport:{width:390,height:844}});await p.goto(url);await p.waitForTimeout(5300);assert.equal(await p.locator('.hero-slide.is-active').getAttribute('aria-label'),'2 de 5');
 await b.close();fs.writeFileSync(path.join(__dirname,'qa-mobile-preservation.json'),JSON.stringify({results,autoplayPreserved:true,mobileInteractions:true},null,2)); console.log('PASS: geometry, animations, resources at 7 widths; mobile menu, portfolio modal and 5s autoplay.');
})().catch(e=>{console.error(e);process.exit(1)});
