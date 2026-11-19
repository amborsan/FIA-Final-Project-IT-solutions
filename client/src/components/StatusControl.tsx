import { useRef, useState } from "react";
import { NativeSelect } from "@/components/ui/native-select";
import { useI18n } from "../i18n/I18nContext";
import type { TranslationKey } from "../i18n/translations";
import { errorMessage } from "../lib/api";
import { ActionFeedback } from "./ActionFeedback";

type StatusFeedback = {
  state: "saving" | "saved" | "error";
  reference: string;
  error?: string;
};

/** Keep feedback in the page so archiving a row cannot remove its result. */
export function useStatusUpdate(action: (id: string, status: string) => Promise<void>) {
  const { t } = useI18n();
  const [pendingId, setPendingId] = useState("");
  const [feedback, setFeedback] = useState<StatusFeedback | null>(null);
  const inFlight = useRef(false);

  async function update(id: string, reference: string, status: string) {
    if (inFlight.current) return;
    inFlight.current = true;
    setPendingId(id);
    setFeedback({ state: "saving", reference });
    try {
      await action(id, status);
      setFeedback({ state: "saved", reference });
    } catch (error) {
      setFeedback({ state: "error", reference, error: errorMessage(error, t("common.error")) });
    } finally {
      inFlight.current = false;
      setPendingId("");
    }
  }

  return { update, pendingId, feedback };
}

export function StatusSelect({
  value, options, reference, onChange, disabled = false, pending = false,
}: {
  value: string;
  options: readonly string[];
  reference: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  pending?: boolean;
}) {
  const { t } = useI18n();
  return (
    <NativeSelect
      aria-label={t("statusUpdate.label", { reference })}
      aria-busy={pending}
      value={value}
      disabled={disabled || pending}
      onChange={event => {
        if (event.target.value !== value) onChange(event.target.value);
      }}
      className="max-w-full px-3 text-sm"
    >
      {options.map(status => <option key={status} value={status}>{t(`status.${status}` as TranslationKey)}</option>)}
    </NativeSelect>
  );
}

export function StatusUpdateFeedback({ feedback }: { feedback: StatusFeedback | null }) {
  const { t } = useI18n();
  if (!feedback) return null;
  const key = feedback.state === "error" ? "statusUpdate.failed"
    : feedback.state === "saving" ? "statusUpdate.saving" : "statusUpdate.saved";
  return (
    <ActionFeedback status={feedback.state === "saving" ? "loading" : feedback.state === "error" ? "error" : "success"}
      message={`${t(key, { reference: feedback.reference })}${feedback.error ? ` ${feedback.error}` : ""}`} />
  );
}
