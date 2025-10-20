import { Badge } from "@chakra-ui/react";
import { TaskStatus } from "../../types/Task";

interface TaskStatusBadgeProps {
  status: TaskStatus;
}

export const TaskStatusBadge = ({ status }: TaskStatusBadgeProps) => {
  const getStatusConfig = () => {
    switch (status) {
      case TaskStatus.WAITING:
        return {
          colorScheme: "yellow",
          bg: "yellow.500",
          text: "Waiting",
        };
      case TaskStatus.PROCESSING:
        return {
          colorScheme: "blue",
          bg: "blue.500",
          text: "In Progress",
        };
      case TaskStatus.COMPLETED:
        return {
          colorScheme: "green",
          bg: "green.500",
          text: "Completed",
        };
      default:
        return {
          colorScheme: "gray",
          bg: "gray.500",
          text: status,
        };
    }
  };

  const { colorScheme, bg, text } = getStatusConfig();

  return (
    <Badge
      colorScheme={colorScheme}
      bg={bg}
      color="white"
      px={2}
      py={1}
      borderRadius="md"
    >
      {text}
    </Badge>
  );
};
