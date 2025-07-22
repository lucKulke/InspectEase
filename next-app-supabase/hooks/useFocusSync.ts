import { useEffect, useRef } from "react";

export function useFocusSync(
  formId: string,
  userId: string,
  sessionId: string,
  url: string
) {
  const wsRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    const ws = new WebSocket(url);
    wsRef.current = ws;
    return () => ws.close();
  }, [formId]);

  const sendFocusUpdate = (
    mainSectionId: string,
    subSectionId: string,
    fieldId: string
  ) => {
    wsRef.current?.send(
      JSON.stringify({
        user_id: userId,
        session_id: sessionId,
        main_section_id: mainSectionId,
        sub_section_id: subSectionId,
        field_id: fieldId,
      })
    );
  };

  useEffect(() => {
    const handleFocus = (e: FocusEvent) => {
      const target = e.target as HTMLElement;
      const fieldId = target.getAttribute("data-field-id");
      const subSectionId = target
        .closest("[data-sub-section-id]")
        ?.getAttribute("data-sub-section-id");
      const mainSectionId = target
        .closest("[data-main-section-id]")
        ?.getAttribute("data-main-section-id");

      if (fieldId && subSectionId && mainSectionId) {
        sendFocusUpdate(mainSectionId, subSectionId, fieldId);
      }
    };

    document.addEventListener("focusin", handleFocus);
    return () => document.removeEventListener("focusin", handleFocus);
  }, []);
}
