// Motion adapted from https://beui.dev/components/motion/drawer.
// Radix supplies modal focus management, scroll locking and trigger focus return.
import { Dialog } from "radix-ui";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import type { ReactNode } from "react";
import { X } from "lucide-react";
import { Button } from "../ui/button";
import { EASE_OUT, SPRING_PANEL } from "./ease";
import "./HeaderDrawer.css";

type HeaderDrawerProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  id: string;
  title: string;
  closeLabel: string;
  trigger: ReactNode;
  children: ReactNode;
};

export function HeaderDrawer({ open, onOpenChange, id, title, closeLabel, trigger, children }: HeaderDrawerProps) {
  const reduce = useReducedMotion();

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Trigger asChild aria-controls={id}>{trigger}</Dialog.Trigger>
      <Dialog.Portal forceMount>
        <AnimatePresence>
          {open && (
            <motion.div className="header-drawer-layer" key="header-drawer">
              <Dialog.Overlay asChild forceMount>
                <motion.div
                  className="header-drawer-backdrop"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2, ease: EASE_OUT }}
                />
              </Dialog.Overlay>
              <Dialog.Content asChild forceMount id={id} aria-describedby={undefined}>
                <motion.div
                  className="header-drawer-panel"
                  initial={reduce ? { opacity: 0 } : { x: "100%" }}
                  animate={reduce ? { opacity: 1 } : { x: 0 }}
                  exit={reduce ? { opacity: 0 } : { x: "100%" }}
                  transition={reduce ? { duration: 0.15, ease: EASE_OUT } : SPRING_PANEL}
                >
                  <div className="header-drawer-heading">
                    <Dialog.Title className="text-lg font-medium">{title}</Dialog.Title>
                    <Dialog.Close asChild>
                      <Button type="button" variant="ghost" size="icon" aria-label={closeLabel}>
                        <X aria-hidden="true" />
                      </Button>
                    </Dialog.Close>
                  </div>
                  <div className="header-drawer-scroll">{children}</div>
                </motion.div>
              </Dialog.Content>
            </motion.div>
          )}
        </AnimatePresence>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
