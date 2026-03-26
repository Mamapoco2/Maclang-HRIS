// src/hooks/useCompleteProfile.js
import { useState } from "react";
import profileService from "@/services/profileService";

export function useCompleteProfile(onSuccess) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});
  const [serverError, setServerError] = useState("");

  const submit = async (formData) => {
    setIsSubmitting(true);
    setFieldErrors({});
    setServerError("");

    const result = await profileService.complete(formData);

    if (result.success) {
      onSuccess?.();
    } else if (result.validationErrors) {
      const flat = {};
      for (const [key, messages] of Object.entries(result.validationErrors)) {
        flat[key] = Array.isArray(messages) ? messages[0] : messages;
      }
      setFieldErrors(flat);
    } else {
      setServerError(result.error ?? "Something went wrong. Please try again.");
    }

    setIsSubmitting(false);
  };

  return { submit, isSubmitting, fieldErrors, serverError };
}
