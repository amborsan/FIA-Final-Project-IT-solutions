import { renderHook, act } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { CartProvider, useCart } from './CartContext';
import type { Product } from '../lib/types';
const product: Product = { id:'one', slug:'router', sku:'R1', categoryId:'network', nameEn:'Router', nameDe:'Router', descriptionEn:'', descriptionDe:'', price:'19.50', stock:3, imageUrl:null, active:true, featured:false };
describe('customer cart', () => {
 it('merges repeat additions, caps stock and recalculates totals', () => {
  const {result}=renderHook(useCart,{wrapper:CartProvider});
  act(()=>result.current.add(product,2));
  act(()=>result.current.add(product,2));
  expect(result.current.items).toHaveLength(1);
  expect(result.current.count).toBe(3);
  expect(result.current.subtotal).toBe(58.5);
  act(()=>result.current.setQuantity('one',0));
  expect(result.current.count).toBe(1);
  expect(result.current.subtotal).toBe(19.5);
  act(()=>result.current.remove('one'));
  expect(result.current.count).toBe(0);
 });
 it('restores saved items on remount and recovers from invalid JSON',()=>{
  const first=renderHook(useCart,{wrapper:CartProvider});
  act(()=>first.result.current.add(product)); first.unmount();
  const second=renderHook(useCart,{wrapper:CartProvider});
  expect(second.result.current.count).toBe(1); second.unmount();
  localStorage.setItem('orbit_cart','invalid');
  expect(renderHook(useCart,{wrapper:CartProvider}).result.current.items).toEqual([]);
 });
});
