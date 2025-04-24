import { useEffect } from "react";
import axios from "axios";

interface FormActivityProps {
  formId: string;
  userId: string;
  url: string;
}

export function useFormActivity({ formId, userId, url }: FormActivityProps) {
  useEffect(() => {
    // Register activity when component mounts
    const registerActivity = async () => {
      try {
        await axios.post(url, {
          form_id: formId,
          user_id: userId,
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
