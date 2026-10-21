import {test} from 'node:test'
import assert from 'node:assert/strict'
import {readFile,readdir,stat} from 'node:fs/promises'
import {join} from 'node:path'
const root=new URL('..',import.meta.url).pathname.replace(/^\/([A-Za-z]:)/,'$1')
async function scan(dir){const paths=[];for(const e of await readdir(dir,{withFileTypes:true})){const p=join(dir,e.name);paths.push(...e.isDirectory()?await scan(p):[p])}return paths}
test('源码与运行素材不依赖宿主，且本地字体声明指向已交付文件',async()=>{for(const p of await scan(join(root,'src'))){const text=await readFile(p,'utf8');assert.doesNotMatch(text,/\/logo\/weiyu|['"]\/fonts\/brand\/|D:[/\\]code|TemplateFiling/,'宿主资源泄漏: '+p)}const dir=join(root,'public/templates/nubo/fonts/brand/misans');for(const p of (await scan(dir)).filter(p=>p.endsWith('.css'))){const css=await readFile(p,'utf8');assert.ok(css.includes('Nubo MiSans'));for(const m of css.matchAll(/url\(['"]?(\.\/[^)'"\s]+)['"]?\)/g))assert.ok((await stat(join(dir,m[1]))).size>0)}})
test('页面不残留原宿主品牌',async()=>{for(const p of (await scan(join(root,'src'))).filter(p=>/\.(tsx?|css)$/.test(p))){const text=(await readFile(p,'utf8')).replaceAll('https://github.com/weelume/nubo-template','');assert.doesNotMatch(text,/weelume|微域生光/i,p)}})
