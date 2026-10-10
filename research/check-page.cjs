const {chromium} = require('playwright');
const fs = require('node:fs');
const path = require('node:path');
(async()=>{
 const browser=await chromium.launch({executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true});
 const page=await browser.newPage({viewport:{width:1440,height:1050},deviceScaleFactor:1});
 const errors=[];page.on('pageerror',e=>errors.push(e.message));page.on('response',r=>{if(r.status()>=400)errors.push(`${r.status()} ${r.url()}`)});
 await page.goto('http://127.0.0.1:4173/',{waitUntil:'networkidle'});
 await page.evaluate(()=>document.fonts.ready);
 await page.evaluate(async()=>{await Promise.all([...document.images].map(async image=>{image.loading='eager';await image.decode()}))});
 await page.screenshot({path:path.join(__dirname,'desktop-top.png')});
 await page.screenshot({path:path.join(__dirname,'desktop-full.png'),fullPage:true});
 const checks={errors,headingCount:await page.locator('h1').count(),layout:[],images:await page.evaluate(()=>[...document.images].map(i=>({src:i.getAttribute('src'),loaded:i.complete&&i.naturalWidth>0}))),structuredData:await page.evaluate(()=>JSON.parse(document.querySelector('script[type="application/ld+json"]').textContent)['@graph'].map(o=>o['@type']))};
 for(const width of [320,375,390,600,768,820,1024,1440]){
  await page.setViewportSize({width,height:900});
  checks.layout.push(await page.evaluate(()=>({width:innerWidth,documentWidth:document.documentElement.scrollWidth,noOverflow:document.documentElement.scrollWidth<=innerWidth})));
 }
 await page.setViewportSize({width:390,height:844});
 await page.goto('http://127.0.0.1:4173/',{waitUntil:'networkidle'});
 await page.screenshot({path:path.join(__dirname,'mobile-top.png')});
 await page.screenshot({path:path.join(__dirname,'mobile-full.png'),fullPage:true});
 const toggle=page.locator('.menu-toggle');
 await toggle.click();checks.mobileMenuOpens=await toggle.getAttribute('aria-expanded')==='true';
 await page.keyboard.press('Escape');checks.mobileMenuCloses=await toggle.getAttribute('aria-expanded')==='false';
 await page.locator('a[data-interest="Festa e ocasiões especiais"]').last().click();checks.serviceSelection=await page.locator('#project-type').inputValue()==='Festa e ocasiões especiais';
 const faq=page.locator('summary').first();await faq.click();checks.faqOpens=await page.locator('details').first().getAttribute('open')!==null;
 await page.locator('#client-name').fill('Teste de prévia');await page.locator('#project-message').fill('Gostaria de conversar sobre uma peça para um evento.');
 const context=page.context();await context.route('https://wa.me/**',route=>route.fulfill({status:200,contentType:'text/html',body:'<html><body>WhatsApp verification</body></html>'}));
 const popupPromise=page.waitForEvent('popup');await page.getByRole('button',{name:'INICIAR CONVERSA NO WHATSAPP'}).click();const popup=await popupPromise;await popup.waitForLoadState('domcontentloaded');
 checks.whatsAppUrl=popup.url();checks.formOpensCorrectNumber=popup.url().startsWith('https://wa.me/5562981647663?text=');checks.formIncludesName=decodeURIComponent(popup.url()).includes('Teste de prévia');await popup.close();
 checks.fallbackVisible=await page.locator('#form-status a').isVisible();
 checks.internalLinks=await page.evaluate(()=>[...document.querySelectorAll('a[href^="#"]')].filter(a=>!document.getElementById(a.getAttribute('href').slice(1))).map(a=>a.getAttribute('href')));
 fs.writeFileSync(path.join(__dirname,'qa-results.json'),JSON.stringify(checks,null,2));console.log(JSON.stringify(checks,null,2));
 await browser.close();
 if(errors.length||checks.headingCount!==1||checks.layout.some(c=>!c.noOverflow)||checks.images.some(i=>!i.loaded)||!checks.mobileMenuOpens||!checks.mobileMenuCloses||!checks.serviceSelection||!checks.faqOpens||!checks.formOpensCorrectNumber||!checks.formIncludesName||checks.internalLinks.length) process.exit(1);
})().catch(e=>{console.error(e);process.exit(1)});
