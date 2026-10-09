import { chromium } from '@playwright/test';
import { utimes } from 'node:fs/promises';
const browser = await chromium.launch({channel:'chrome'});
try {
  const page = await browser.newPage({viewport:{width:1440,height:1050}});
  await page.goto('http://127.0.0.1:5174/#c1=00000000');
  await page.locator('.card-slot.chosen').first().waitFor();
  await page.screenshot({path:'preview-desktop.png',fullPage:true});
  await page.setViewportSize({width:390,height:844});
  await page.screenshot({path:'preview-mobile.png',fullPage:true});
  const reload = page.waitForEvent('load',{timeout:10000});
  await utimes(new URL('../src/styles.css',import.meta.url),new Date(),new Date());
  await reload;
  if(!page.url().endsWith('#c1=00000000')) throw Error('Selection lost after reload');
  console.log('Live reload verified; selection preserved.');
} finally { await browser.close(); }
