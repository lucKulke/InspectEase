import { useEffect } from "react";
import axios from "axios";

interface FormActivityProps {
  formId: string;
  userId: string;
  url: string;
  sessionId: string;
}

export function useFormActivity({
  formId,
  userId,
  url,
  sessionId,
}: FormActivityProps) {
  useEffect(() => {
    // Register activity when component mounts
    const registerActivity = async () => {
      try {
        // Get or create session ID
        await axios.post(url, {
          form_id: formId,
          user_id: userId,
          session_id: sessionId, // Send the session ID
        });
      } catch (error) {
        console.error("Failed to register form activity:", error);
      }
    };

    registerActivity();

    // Set up polling interval for heartbeat (every 4 seconds)
    const intervalId = setInterval(registerActivity, 4000);

    // Cleanup function
    return () => {
      clearInterval(intervalId);
    };
  }, [formId, userId]);
}
