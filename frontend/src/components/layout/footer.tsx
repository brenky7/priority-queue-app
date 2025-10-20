import { Box, Container, Text, Center } from "@chakra-ui/react";

export const Footer = () => {
  return (
    <Box as="footer" bg="brand.700" color="white" py={4} mt="auto">
      <Container maxW="container.xl">
        <Center>
          <Text fontSize="sm">
            &copy; {new Date().getFullYear()} Priority Queue App
          </Text>
        </Center>
      </Container>
    </Box>
  );
};
