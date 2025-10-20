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
  const {
    activeTasks,
    completedTasks,
    currentlyProcessingTask,
    clearCompletedTasks,
    isLoading,
  } = useTaskStore();

  return (
    <Box>
      <SimpleGrid columns={{ base: 1, lg: 2 }} gap={8}>
        {/* Active Tasks Section */}
        <Box>
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
        <Box>
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

      {/* Currently Processing Task */}
      {currentlyProcessingTask && (
        <Box mt={8}>
          <Heading size="md" mb={4}>
            Currently Processing
          </Heading>
          <Separator mb={4} />
          <TaskItem task={currentlyProcessingTask} />
        </Box>
      )}
    </Box>
  );
};
