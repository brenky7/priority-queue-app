import { Grid, GridItem, Box } from "@chakra-ui/react";
import { TaskForm } from "./components/tasks/taskForm";
import { TaskList } from "./components/tasks/taskList";
import { Layout } from "./components/layout/layout";
import { useSocket } from "./hooks/useSocket";
import { CurrentlyProcessingTask } from "./components/tasks/currentTask";

function App() {
  useSocket();

  return (
    <Layout>
      <Grid templateRows="auto auto" gap={6}>
        {/* Top row with equal height cells */}
        <Grid templateColumns={{ base: "1fr", lg: "300px 1fr" }} gap={8}>
          {/* Task Form cell - wrapped in Box with full width */}
          <GridItem>
            <Box width="100%" height="100%">
              <TaskForm />
            </Box>
          </GridItem>

          {/* Currently Processing cell - wrapped in Box with full width */}
          <GridItem>
            <Box width="100%" height="100%">
              <CurrentlyProcessingTask />
            </Box>
          </GridItem>
        </Grid>

        <GridItem>
          <TaskList />
        </GridItem>
      </Grid>
    </Layout>
  );
}

export default App;
