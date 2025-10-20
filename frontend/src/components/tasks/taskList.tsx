import {
  Separator,
  Box,
  VStack,
  Heading,
  Text,
  Button,
  SimpleGrid,
  Flex,
} from "@chakra-ui/react";
import { TaskItem } from "./taskItem";
import { useTaskStore } from "../../store/taskStore";

export const TaskList = () => {
  const { activeTasks, completedTasks, clearCompletedTasks, isLoading } =
    useTaskStore();

  return (
    <Box pt={2}>
      <SimpleGrid columns={{ base: 1, md: 2 }} gap={6}>
        {/* Active Tasks Section */}
        <Box bg="blackAlpha.200" borderRadius="md" p={4}>
          <Heading size="md" mb={4}>
            Active Tasks
          </Heading>
          <Separator mb={4} />

          {activeTasks.length === 0 ? (
            <Text color="gray.500">No active tasks</Text>
          ) : (
            <VStack align="stretch" gap={4}>
              {activeTasks.map((task) => (
                <TaskItem key={task.id} task={task} />
              ))}
            </VStack>
          )}
        </Box>

        {/* Completed Tasks Section */}
        <Box bg="blackAlpha.200" borderRadius="md" p={4}>
          <Flex align="center" justify="space-between" mb={4}>
            <Heading size="md">Completed Tasks</Heading>
            <Button
              size="sm"
              onClick={() => clearCompletedTasks()}
              loading={isLoading}
              disabled={completedTasks.length === 0}
            >
              Clear All
            </Button>
          </Flex>
          <Separator mb={4} />

          {completedTasks.length === 0 ? (
            <Text color="gray.500">No completed tasks</Text>
          ) : (
            <VStack align="stretch" gap={4}>
              {completedTasks.map((task) => (
                <TaskItem key={task.id} task={task} />
              ))}
            </VStack>
          )}
        </Box>
      </SimpleGrid>
    </Box>
  );
};
