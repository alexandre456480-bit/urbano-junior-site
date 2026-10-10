const {chromium}=require('playwright');
const fs=require('node:fs');
const path=require('node:path');
(async()=>{
 const browser=await chromium.launch({executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true});
 const page=await browser.newPage();await page.goto('http://127.0.0.1:4173/',{waitUntil:'networkidle'});
 const result=await page.evaluate(async()=>{
  const image=new Image();image.src='assets/logo-urbano-junior.png';await image.decode();
  const canvas=document.createElement('canvas');canvas.width=480;canvas.height=480;
  const ctx=canvas.getContext('2d');ctx.drawImage(image,0,0,480,480);
  return canvas.toDataURL('image/webp',.95).split(',')[1];
 });
 fs.writeFileSync(path.join(__dirname,'../dist/assets/logo-display.webp'),Buffer.from(result,'base64'));
 const htmlPath=path.join(__dirname,'../dist/index.html');let html=fs.readFileSync(htmlPath,'utf8');html=html.replaceAll('src="assets/logo-urbano-junior.png"','src="assets/logo-display.webp"');fs.writeFileSync(htmlPath,html);
 console.log('Logo responsiva: '+fs.statSync(path.join(__dirname,'../dist/assets/logo-display.webp')).size+' bytes. Original preservada.');
 await browser.close();
})();
