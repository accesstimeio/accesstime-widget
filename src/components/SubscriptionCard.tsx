import {
    AbsoluteCenter,
    Badge,
    Box,
    Button,
    Card,
    CardBody,
    CardFooter,
    Divider,
    GridItem,
    Icon,
    Select,
    SimpleGrid,
} from "@chakra-ui/react"
import { ThemeProvider } from "../providers/ThemeProvider";
import { MdRocketLaunch } from 'react-icons/md'

export const SubscriptionCard = () => {

    return (
        <ThemeProvider>
            <Card borderRadius="lg" w={270} m={10}>
                <CardBody>
                    <Badge colorScheme="green" borderRadius="lg" textTransform="unset" position="absolute" top="3" left="3">
                        Package: 1 Week
                    </Badge>
                    <Box minH={180} w="full" alignContent="center" textAlign="center">
                        <Icon as={MdRocketLaunch} boxSize={24} />
                    </Box>
                </CardBody>
                <CardFooter>
                    <SimpleGrid columns={5} columnGap="2" w="full">
                        <GridItem colSpan={2}>
                            <Select fontSize="sm" variant="filled" borderRadius="lg">
                                <option value='ETH'>ETH</option>
                                <option value='USDT'>USDT</option>
                                <option value='USCD'>USDC</option>
                            </Select>
                        </GridItem>
                        <GridItem colSpan={3}>
                            <Button w="full" colorScheme="blue">Subscribe</Button>
                        </GridItem>
                        <GridItem colSpan={5}>
                            <Box position="relative" fontSize="xs" color="blackAlpha.700">
                                <Divider mt={4} mb={2} />
                                <AbsoluteCenter bg='white' px='4' whiteSpace="nowrap">
                                    Total Payment: 4 ETH
                                </AbsoluteCenter>
                            </Box>
                        </GridItem>
                    </SimpleGrid>
                </CardFooter>
            </Card>
        </ThemeProvider>
    );
}
