import { test, expect } from '@playwright/test';
test('language choice persists after reload',async({page})=>{
 await page.goto('/'); await page.getByRole('button',{name:'DE',exact:true}).click();
 await expect(page.locator('html')).toHaveAttribute('lang','de');
 await expect(page.getByRole('heading',{level:1})).toContainText('Gute IT.');
 await page.reload(); await expect(page.locator('html')).toHaveAttribute('lang','de');
});
test('360px mobile navigation reaches services without page overflow',async({page})=>{
 await page.setViewportSize({width:360,height:800}); await page.goto('/');
 await page.getByRole('button',{name:'Menu',exact:true}).click();
 await page.locator('header').getByRole('link',{name:'Services',exact:true}).click();
 await expect(page).toHaveURL(/services/);
 expect(await page.evaluate(()=>document.documentElement.scrollWidth-document.documentElement.clientWidth)).toBeLessThanOrEqual(2);
});
test('shop additions persist in cart',async({page})=>{
 await page.goto('/products');
 const card=page.locator('article').filter({has:page.getByRole('button',{name:'Add to cart',exact:true})}).first();
 const name=await card.getByRole('heading').innerText();
 await card.getByRole('button',{name:'Add to cart',exact:true}).click();
 await page.goto('/cart'); await expect(page.getByRole('link',{name,exact:true})).toBeVisible();
 await page.reload(); await expect(page.getByRole('link',{name,exact:true})).toBeVisible();
});
test('existing customer demo signs in to portal',async({page})=>{
 await page.goto('/login');
 await page.getByRole('button',{name:'Customer customer@orbit-it.de Customer12345!',exact:true}).click();
 await page.getByRole('button',{name:'Log in',exact:true}).click();
 await expect(page).toHaveURL(/portal/);
 await expect(page.getByRole('heading',{name:'Dashboard',exact:true})).toBeVisible();
});
