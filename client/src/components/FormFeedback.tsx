import { createContext, useContext, type ReactNode } from 'react';
import { AnimatedToastStack, useAnimatedToastStack } from './beui/animated-toast-stack';
import { StatefulButton, type ButtonState } from './beui/button/stateful';
import { useI18n } from '../i18n/I18nContext';
import { Send } from 'lucide-react';

type Notify = (status: 'success' | 'error', message: string) => void;
const FeedbackContext = createContext<Notify | null>(null);
export function FormFeedbackProvider({children}: {children: ReactNode}) {
 const {toasts, showToast, dismissToast} = useAnimatedToastStack({defaultDuration:0,limit:3});
 const {t}=useI18n();
 const notify: Notify=(status,message)=>{ showToast({title:message,status,duration:0}); };
 return <FeedbackContext.Provider value={notify}>{children}
  <AnimatedToastStack toasts={toasts} onDismiss={dismissToast} placement="fixed" position="top-right" closeLabel={t('common.close')} className="form-toast-stack" classNames={{surface:'bg-card text-card-foreground border-border rounded-box',close:'min-h-11 min-w-11',title:'text-sm leading-relaxed'}} />
 </FeedbackContext.Provider>;
}
export function useFormFeedback() {
 const value=useContext(FeedbackContext);
 if(!value) throw new Error('FormFeedbackProvider is required');
 return value;
}
export function SubmitButton({state,children,className}: {state:ButtonState;children:string;className?:string}) {
 const {t}=useI18n();
 return <StatefulButton type="submit" state={state} className={'ds-btn ds-btn-primary '+(className??'')} loadingText={t('common.loading')} successText={t('feedback.sent')} errorText={t('common.retry')} icon={<Send size={16} aria-hidden="true" />} aria-label={state==='loading'?t('common.loading'):state==='success'?t('feedback.sent'):state==='error'?t('common.retry'):children}>{children}</StatefulButton>;
}
