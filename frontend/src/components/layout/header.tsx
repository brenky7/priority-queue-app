import { Box } from "@chakra-ui/react/box";
import { Container } from "@chakra-ui/react/container";
import { Flex } from "@chakra-ui/react/flex";
import { HStack } from "@chakra-ui/react/stack";
import { Spacer, IconButton, Heading } from "@chakra-ui/react";
import { Sun, Moon } from "lucide-react";
import { useColorMode } from "../ui/color-mode";

export const Header = () => {
  const { colorMode, toggleColorMode } = useColorMode();
  const isLight = colorMode === "light";

  return (
    <Box as="header" bg="brand.500" color="white" py={4} boxShadow="md">
      <Container maxW="container.xl">
        <Flex align="center">
          <Heading size="md">Priority Queue App</Heading>
          <Spacer />
          <HStack>
            <IconButton
              aria-label={`Toggle ${isLight ? "dark" : "light"} mode`}
              variant="ghost"
              color="white"
              onClick={toggleColorMode}
              _hover={{ bg: "brand.600" }}
            >
              {isLight ? <Moon /> : <Sun />}
            </IconButton>
          </HStack>
        </Flex>
      </Container>
    </Box>
  );
};
