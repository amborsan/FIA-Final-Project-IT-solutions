// Center-unfold motion adapted from https://beui.dev/components/motion/center-morph-modal.
// Radix handles modal focus, background isolation, Escape and scroll locking.
import { useState, type ReactElement, type ReactNode } from "react";
import { Dialog } from "radix-ui";
import { AnimatePresence, motion } from "motion/react";
import { X } from "lucide-react";
import { useI18n } from "../../i18n/I18nContext";
import { useReducedMotionPreference } from "./useReducedMotionPreference";
import { EASE_OUT } from "./ease";
import { Button } from "../ui/button";

const folded = "inset(48% 48% 48% 48% round var(--radius-box))";
const unfolded = "inset(0% 0% 0% 0% round var(--radius-box))";
const unfoldTransition = { duration: 0.43, ease: [0.2, 0, 0.2, 1] as const };

type Props = {
  trigger: ReactElement;
  title: string;
  description: string;
  children: ReactNode;
};

export function CenterMorphModal({ trigger, title, description, children }: Props) {
  const { t } = useI18n();
  const [open, setOpen] = useState(false);
  const reduce = useReducedMotionPreference();
  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <Dialog.Trigger asChild>{trigger}</Dialog.Trigger>
      <Dialog.Portal forceMount>
        <AnimatePresence>
          {open && (
            <motion.div key="center-morph-modal" className="fixed inset-0 z-[var(--modal-z)]">
              <Dialog.Overlay asChild forceMount>
                <motion.div data-slot="center-morph-backdrop" className="fixed inset-0" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                  transition={{ duration: reduce ? 0.1 : 0.28, ease: EASE_OUT }}
                  style={{ background: "var(--header-drawer-backdrop)", backdropFilter: "blur(var(--header-drawer-blur))" }} />
              </Dialog.Overlay>
              <div className="pointer-events-none fixed inset-4 flex items-center justify-center">
                <Dialog.Content asChild forceMount>
                  <motion.div
                    className="pointer-events-auto relative max-h-[calc(100dvh-2rem)] w-full max-w-[var(--modal-max-width)] overflow-y-auto rounded-box border border-hairline bg-surface p-6 text-ink outline-none sm:p-8"
                    initial={reduce ? { opacity: 0, clipPath: unfolded } : { opacity: 1, clipPath: folded }}
                    animate={{ opacity: 1, clipPath: unfolded }}
                    exit={reduce ? { opacity: 0, clipPath: unfolded } : { opacity: 1, clipPath: folded }}
                    transition={reduce ? { duration: 0.14, ease: EASE_OUT } : unfoldTransition}
                  >
                    <Dialog.Title className="pr-10 text-xl font-medium leading-tight tracking-tight [hyphens:auto] [overflow-wrap:anywhere] sm:text-2xl">{title}</Dialog.Title>
                    <Dialog.Close asChild>
                      <Button type="button" variant="ghost" size="icon" aria-label={t("common.close")} className="absolute right-3 top-3 size-11">
                        <X aria-hidden="true" className="size-5" />
                      </Button>
                    </Dialog.Close>
                    <Dialog.Description className="mt-4 text-base leading-relaxed text-ink-soft">{description}</Dialog.Description>
                    {children}
                  </motion.div>
                </Dialog.Content>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
