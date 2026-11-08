import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { expect, it } from 'vitest';
import { FormFeedbackProvider, SubmitButton, useFormFeedback } from './FormFeedback';
import { I18nProvider } from '../i18n/I18nContext';

it('disables submission while loading and exposes recovery text after failure',()=>{
 const view=render(<I18nProvider><SubmitButton state="loading">Send</SubmitButton></I18nProvider>);
 expect(screen.getByRole('button',{name:'Loading…'})).toBeDisabled();
 view.rerender(<I18nProvider><SubmitButton state="error">Send</SubmitButton></I18nProvider>);
 expect(screen.getByRole('button',{name:'Try again'})).toBeEnabled();
});
function NotificationTrigger(){
 const notify=useFormFeedback();
 return <button onClick={()=>notify('success','Request received')}>Notify</button>;
}
it('shows a translated dismiss control and removes a result notification',async()=>{
 localStorage.setItem('orbit_language','de');
 render(<I18nProvider><FormFeedbackProvider><NotificationTrigger /></FormFeedbackProvider></I18nProvider>);
 const user=userEvent.setup();
 await user.click(screen.getByRole('button',{name:'Notify'}));
 expect(await screen.findByText('Request received')).toBeVisible();
 await user.click(screen.getByRole('button',{name:'Schließen'}));
 // The exit animation may keep a node mounted briefly; it must leave the live list.
 await waitFor(()=>expect(screen.queryByRole('button',{name:'Schließen'})).not.toBeInTheDocument());
});
