import { Box, Container, Flex } from "@chakra-ui/react";
import type { ReactNode } from "react";
import { Header } from "./header";
import { Footer } from "./footer";

interface LayoutProps {
  children: ReactNode;
}

export const Layout = ({ children }: LayoutProps) => {
  return (
    <Flex direction="column" minH="100vh">
      <Header />
      <Box flex="1">
        <Container maxW="container.xl" py={8}>
          {children}
        </Container>
      </Box>
      <Footer />
    </Flex>
  );
};
