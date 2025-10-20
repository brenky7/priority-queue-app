import { Heading, Text, Box } from "@chakra-ui/react";
import { useTaskStore } from "../../store/taskStore";
import { TaskItem } from "./taskItem";

export const CurrentlyProcessingTask = () => {
  const task = useTaskStore((s) => s.currentlyProcessingTask);

  return (
    <Box width="100%">
      <Heading size="md" mb="4">
        Currently Processing
      </Heading>

      {task ? (
        <Box
          width="100%"
          minHeight="260px"
          bg="blackAlpha.100"
          borderRadius="md"
          p={4}
          display="flex"
          flexDirection="column"
        >
          <TaskItem task={task} key={task.id} />
          {/* This will push everything up and fill remaining space */}
          <Box flexGrow={1} />
        </Box>
      ) : (
        <Box
          width="100%"
          minHeight="260px"
          display="flex"
          alignItems="center"
          justifyContent="center"
          bg="blackAlpha.100"
          borderRadius="md"
          p={4}
        >
          <Text color="gray.500">No task currently being processed</Text>
        </Box>
      )}
    </Box>
  );
};
