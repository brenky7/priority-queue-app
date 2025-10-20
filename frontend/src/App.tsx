import { Grid, GridItem } from "@chakra-ui/react";
import { TaskForm } from "./components/tasks/taskForm";
import { TaskList } from "./components/tasks/taskList";
import { Layout } from "./components/layout/layout";
import { useSocket } from "./hooks/useSocket";

function App() {
  // Initialize socket connection for real-time updates
  useSocket();

  return (
    <Layout>
      <Grid templateColumns={{ base: "1fr", lg: "300px 1fr" }} gap={8}>
        <GridItem>
          <TaskForm />
        </GridItem>

        <GridItem>
          <TaskList />
        </GridItem>
      </Grid>
    </Layout>
  );
}

export default App;
