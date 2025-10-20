import { Badge } from "@chakra-ui/react";
import { TaskStatus } from "../../types/Task";

interface TaskStatusBadgeProps {
  status: TaskStatus;
}

export const TaskStatusBadge = ({ status }: TaskStatusBadgeProps) => {
  switch (status) {
    case TaskStatus.WAITING:
      return <Badge colorScheme="blue">Waiting</Badge>;
    case TaskStatus.PROCESSING:
      return <Badge colorScheme="purple">In Progress</Badge>;
    case TaskStatus.COMPLETED:
      return <Badge colorScheme="green">Completed</Badge>;
    default:
      return <Badge>Unknown</Badge>;
  }
};
