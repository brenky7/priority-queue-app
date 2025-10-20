import { useState, useEffect, useCallback } from "react";

interface TaskFormValues {
  name: string;
  priorityValue: string;
}

interface ValidationErrors {
  name: string | null;
  priority: string | null;
}

export const useTaskFormValidation = (values: TaskFormValues) => {
  const [errors, setErrors] = useState<ValidationErrors>({
    name: null,
    priority: null,
  });

  // Validate name
  const validateName = useCallback((name: string): boolean => {
    if (!name.trim()) {
      setErrors((prev) => ({ ...prev, name: "Task name is required" }));
      return false;
    } else {
      setErrors((prev) => ({ ...prev, name: null }));
      return true;
    }
  }, []);

  // Validate priority - simplified without timeout
  const validatePriority = useCallback((value: string): boolean => {
    let errorMessage = null;

    if (!value.trim()) {
      errorMessage = "Priority is required";
    } else {
      const numValue = Number(value);
      if (isNaN(numValue)) {
        errorMessage = "Must be a number";
      } else if (numValue < 1) {
        errorMessage = "Must be at least 1";
      } else if (numValue > 100) {
        errorMessage = "Must be at most 100";
      }
    }

    // Set the error state
    setErrors((prevErrors) => ({
      ...prevErrors,
      priority: errorMessage,
    }));

    // Return true if no error
    return errorMessage === null;
  }, []);

  // Validate form
  const validateForm = useCallback((): boolean => {
    const nameValid = validateName(values.name);
    const priorityValid = validatePriority(values.priorityValue);
    return nameValid && priorityValid;
  }, [validateName, validatePriority, values.name, values.priorityValue]);

  // Re-validate when values change
  useEffect(() => {
    validateName(values.name);
  }, [values.name, validateName]);

  useEffect(() => {
    validatePriority(values.priorityValue);
  }, [values.priorityValue, validatePriority]);

  return {
    errors,
    validateForm,
    hasErrors: !!errors.name || !!errors.priority,
  };
};
