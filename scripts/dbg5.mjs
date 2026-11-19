import puppeteer from 'puppeteer-core'
const browser = await puppeteer.launch({ executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe', headless:'new', args:['--no-sandbox'], defaultViewport:{width:1600,height:1000}})
const page = await browser.newPage()
page.on('pageerror', e=>console.log('ERR:', e.message))
await page.goto('http://localhost:5199/#/editor', {waitUntil:'networkidle2'})
await new Promise(r=>setTimeout(r,2500))
const out = await page.evaluate(() => {
  const S = window.__sp
  const a = S.action.value
  S.editor.frame = 30
  S.setChannelValue('shoulder', 45)
  const after1 = { live: JSON.parse(JSON.stringify(S.editor.live)), keys: a.tracks.shoulder.map(k=>({f:k.frame,v:k.value})), disp: S.channelLiveDisplay('shoulder') }
  S.editor.frame = 60
  const after2 = { live: JSON.parse(JSON.stringify(S.editor.live)), disp: S.channelLiveDisplay('shoulder'), sampled: S.sampleTrack(a.tracks.shoulder, 60) }
  return { after1, after2 }
})
console.log(JSON.stringify(out, null, 1))
await browser.close()
