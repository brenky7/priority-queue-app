import { Field } from "@chakra-ui/react/field";
import { Input } from "@chakra-ui/react/input";
import { NumberInput } from "@chakra-ui/react/number-input";
import { VStack } from "@chakra-ui/react/stack";
import { Button } from "@chakra-ui/react/button";
import { Card } from "@chakra-ui/react/card";
import { Heading, Text, Box } from "@chakra-ui/react";
import { useState, useRef, useEffect } from "react";
import { useTaskStore } from "../../store/taskStore";
import { toaster } from "../../components/ui/toaster";
import { useTaskFormValidation } from "../../hooks/useTaskFormValidation";

export const TaskForm = () => {
  const [name, setName] = useState("A sample task");
  const [_priority, setPriority] = useState<number>(1);
  const [priorityInputValue, setPriorityInputValue] = useState<string>("1");
  const { addTask, isLoading } = useTaskStore();

  // Add ref for the priority input element
  const priorityInputRef = useRef<HTMLInputElement>(null);
  // Track cursor position
  const cursorPositionRef = useRef<number | null>(null);

  // Use our custom validation hook
  const { errors, validateForm, hasErrors } = useTaskFormValidation({
    name,
    priorityValue: priorityInputValue,
  });

  // Effect to restore cursor position after render
  useEffect(() => {
    if (cursorPositionRef.current !== null && priorityInputRef.current) {
      priorityInputRef.current.setSelectionRange(
        cursorPositionRef.current,
        cursorPositionRef.current
      );
    }
  });

  useEffect(() => {
    console.info("Current error state:", errors);
  }, [errors]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // Run validation
    if (!validateForm()) {
      return;
    }

    try {
      // Use the numeric value from the priorityInputValue string
      const priorityValue = Math.min(
        100,
        Math.max(1, Number(priorityInputValue))
      );
      await addTask(name, priorityValue);
      setName("A sample task");
      setPriority(1);
      setPriorityInputValue("1");
      toaster.create({
        title: "Success",
        description: "Task added successfully",
        type: "success",
        duration: 3000,
      });
    } catch (error) {
      toaster.create({
        title: "Error",
        description:
          error instanceof Error ? error.message : "Failed to add task",
        type: "error",
        duration: 3000,
      });
    }
  };

  // Handle priority input change with cursor position preservation
  const handleInputChange = (e: React.FormEvent<HTMLInputElement>) => {
    // Save cursor position before state update
    cursorPositionRef.current = e.currentTarget.selectionStart;

    const valueAsString = e.currentTarget.value;
    setPriorityInputValue(valueAsString);

    if (valueAsString.trim() !== "") {
      setPriority(Number(valueAsString));
    }
  };

  return (
    <Card.Root>
      <Card.Body>
        <Heading size="md" mb="4">
          Add New Task
        </Heading>

        <form onSubmit={handleSubmit}>
          <VStack gap="4" align="stretch">
            <Field.Root required invalid={!!errors.name}>
              <Field.Label>Task Name</Field.Label>
              <Input
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                }}
                placeholder="Enter task name"
              />
              {errors.name && (
                <Text color="red.500" fontSize="sm">
                  {errors.name}
                </Text>
              )}
            </Field.Root>

            <Field.Root required invalid={!!errors.priority}>
              <Field.Label>Priority (1-100)</Field.Label>

              <NumberInput.Root
                min={1}
                max={100}
                value={priorityInputValue}
                defaultValue="1"
                clampValueOnBlur
                w="full"
              >
                <NumberInput.Control
                  w="full"
                  position="relative"
                  borderColor={errors.priority ? "red.500" : undefined}
                  _hover={{
                    borderColor: errors.priority ? "red.500" : undefined,
                  }}
                >
                  <NumberInput.Input
                    w="full"
                    onChange={handleInputChange}
                    ref={priorityInputRef} // Add ref to input
                  />
                </NumberInput.Control>
              </NumberInput.Root>

              {/* Always display the error text area to prevent layout shift */}
              <Box height="1.5rem" mt={1}>
                {errors.priority ? (
                  <Text
                    key={errors.priority} // Force re-render when error changes
                    color="red.500"
                    fontSize="sm"
                  >
                    {errors.priority}
                  </Text>
                ) : null}
              </Box>
            </Field.Root>

            <Button
              type="submit"
              colorPalette="brand"
              loading={isLoading}
              disabled={hasErrors || !name || !priorityInputValue}
            >
              Add Task
            </Button>
          </VStack>
        </form>
      </Card.Body>
    </Card.Root>
  );
};
