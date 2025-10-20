import { Field } from "@chakra-ui/react/field";
import { Input } from "@chakra-ui/react/input";
import { NumberInput } from "@chakra-ui/react/number-input";
import { VStack } from "@chakra-ui/react/stack";
import { Button } from "@chakra-ui/react/button";
import { Card } from "@chakra-ui/react/card";
import { Heading } from "@chakra-ui/react";
import { useState } from "react";
import { useTaskStore } from "../../store/taskStore";
import { toaster } from "../../components/ui/toaster";

export const TaskForm = () => {
  const [name, setName] = useState("");
  const [priority, setPriority] = useState<number>(1);
  const { addTask, isLoading } = useTaskStore();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!name.trim()) {
      toaster.create({
        title: "Error",
        description: "Task name is required",
        type: "error",
        duration: 3000,
      });
      return;
    }

    try {
      await addTask(name, priority);
      setName("");
      setPriority(1);
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

  return (
    <Card.Root>
      <Card.Body>
        <Heading size="md" mb="4">
          Add New Task
        </Heading>

        <form onSubmit={handleSubmit}>
          <VStack gap="4" align="stretch">
            <Field.Root required>
              <Field.Label>Task Name</Field.Label>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter task name"
              />
            </Field.Root>

            <Field.Root required>
              <Field.Label>Priority</Field.Label>
              <NumberInput.Root
                min={0}
                max={100}
                value={String(priority)}
                onValueChange={(d) =>
                  setPriority(
                    Number.isNaN(d.valueAsNumber) ? 0 : d.valueAsNumber
                  )
                }
              >
                <NumberInput.Control>
                  <NumberInput.Input />
                  <NumberInput.IncrementTrigger />
                  <NumberInput.DecrementTrigger />
                </NumberInput.Control>
              </NumberInput.Root>
            </Field.Root>

            <Button type="submit" colorPalette="brand" loading={isLoading}>
              Add Task
            </Button>
          </VStack>
        </form>
      </Card.Body>
    </Card.Root>
  );
};
