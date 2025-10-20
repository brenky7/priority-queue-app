import {
  Box,
  Text,
  Progress,
  Flex,
  HStack,
  VStack,
  Spacer,
} from "@chakra-ui/react";
import { TaskStatusBadge } from "./taskStatusBadge";
import { type Task, TaskStatus } from "../../types/Task";

interface TaskItemProps {
  task: Task;
  width?: string;
}

export const TaskItem = ({ task, width = "100%" }: TaskItemProps) => {
  const getTaskColor = () => {
    if (task.status === TaskStatus.COMPLETED) {
      return "priority.completed";
    }

    if (task.effectivePriority > 66) {
      return "priority.high";
    } else if (task.effectivePriority > 33) {
      return "priority.medium";
    } else {
      return "priority.low";
    }
  };

  const taskColor = getTaskColor();
  //const colorScheme = taskColor.split(".")[1];

  return (
    <Box
      mb={4}
      width={width}
      borderLeftStyle="solid"
      borderLeftWidth="4px"
      borderRightWidth="1px"
      borderTopWidth="1px"
      borderBottomWidth="1px"
      borderTopColor="cardBorder"
      borderRightColor="cardBorder"
      borderBottomColor="cardBorder"
      borderLeftColor={taskColor}
      bg="cardBg"
      borderRadius="lg"
      boxShadow="md"
      transition="all 0.2s"
      _hover={{ transform: "translateY(-2px)", boxShadow: "lg" }}
      overflow="hidden"
    >
      <Box p={4} pb={2}>
        <Flex alignItems="center">
          <Text fontWeight="bold" fontSize="lg">
            {task.name}
          </Text>
          <Spacer />
          <TaskStatusBadge status={task.status} />
        </Flex>
      </Box>

      <Box p={4} pt={0}>
        <VStack align="stretch" gap={2}>
          <HStack gap={4} fontSize="sm">
            <Text>Priority: {task.priority}</Text>
            <Text>
              Effective Priority: {Math.round(task.effectivePriority)}
            </Text>
            <Text>
              Created: {new Date(task.createdAt).toLocaleTimeString()}
            </Text>
          </HStack>

          <Box>
            <Flex justify="space-between">
              <Text fontSize="xs" fontWeight="medium">
                Progress
              </Text>
              <Text fontSize="xs">{task.progress}%</Text>
            </Flex>
            <Progress.Root
              value={task.progress}
              size="sm"
              variant={"subtle"}
              mt={1}
            >
              <Progress.Track borderRadius="full">
                <Progress.Range />
              </Progress.Track>
            </Progress.Root>
          </Box>
        </VStack>
      </Box>
    </Box>
  );
};
