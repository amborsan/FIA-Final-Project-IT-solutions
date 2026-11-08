import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { it, expect } from 'vitest';
import { ErrorState, PageLoader } from './ui';
import { I18nProvider } from '../i18n/I18nContext';
it('announces loading in German',()=>{
 localStorage.setItem('orbit_language','de');
 render(<I18nProvider><PageLoader /></I18nProvider>);
 expect(screen.getByRole('status')).toHaveTextContent(/laden/i);
});
it('offers keyboard-operable recovery after an error',async()=>{
 let attempts=0;
 render(<I18nProvider><ErrorState onRetry={()=>attempts++} /></I18nProvider>);
 expect(screen.getByRole('alert')).toBeVisible();
 const user=userEvent.setup(); await user.tab(); await user.keyboard('{Enter}');
 expect(attempts).toBe(1);
});
