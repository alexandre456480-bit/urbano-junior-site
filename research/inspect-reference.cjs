const {chromium} = require('playwright');
const fs = require('node:fs');
const path = require('node:path');
(async()=>{
 const browser=await chromium.launch({executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true});
 const page=await browser.newPage({viewport:{width:1440,height:1000},deviceScaleFactor:1});
 await page.goto('https://www.magnolianoivas.com.br/',{waitUntil:'domcontentloaded',timeout:60000});
 await page.waitForTimeout(4500);
 await page.screenshot({path:path.join(__dirname,'reference-desktop.png'),fullPage:true});
 fs.writeFileSync(path.join(__dirname,'reference.html'),await page.content());
 const styles=await page.evaluate(()=>({title:document.title,body:getComputedStyle(document.body).backgroundColor,headings:[...document.querySelectorAll('h1,h2,h3,h4')].map(e=>({text:e.textContent.trim(),font:getComputedStyle(e).fontFamily,size:getComputedStyle(e).fontSize,color:getComputedStyle(e).color})),sections:[...document.querySelectorAll('.elementor-top-section')].map(e=>({background:getComputedStyle(e).backgroundColor,image:getComputedStyle(e).backgroundImage})),images:[...document.images].map(e=>({src:e.currentSrc,alt:e.alt}))}));
 fs.writeFileSync(path.join(__dirname,'reference-analysis.json'),JSON.stringify(styles,null,2));
 console.log(JSON.stringify(styles,null,2));
 await browser.close();
})().catch(e=>{console.error(e.message);process.exit(1)});
