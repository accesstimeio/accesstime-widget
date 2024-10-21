import {
    AbsoluteCenter,
    Badge,
    Box,
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
import { IconType } from "react-icons";
import { SubscriptionButton } from "./SubscriptionButton";

export interface SubscriptionCardProps {
    chainId: number;
    cardBodyType: "backgroundImage" | "react-icons" | "child-component";
    subscriptionText?: string;
    packageId?: string;
    children?: React.ReactNode;
    backgroundImage?: string;
    icon?: IconType;
    style?: React.CSSProperties;
    className?: string;
    onSubscription?: () => void;
    isSuccess?: boolean;
    isLoading?: boolean;
    isError?: boolean;
}
export const SubscriptionCard = ({
    chainId,
    cardBodyType,
    subscriptionText,
    packageId,
    children,
    backgroundImage,
    icon,
    style,
    className
}: SubscriptionCardProps) => {
    const multiplePaymentMethod = false;

    return (
        <ThemeProvider>
            <Card borderRadius="lg" w={270} m={10}>
                <CardBody borderTopRadius="lg" backgroundPosition="center" backgroundImage={cardBodyType == "backgroundImage" ? backgroundImage : undefined}>
                    <Box display="flex" flexDirection="column" position="absolute" top="3" left="3">
                        {
                            packageId && (
                                <Badge colorScheme="green" width="fit-content" borderRadius="lg" textTransform="unset" mb="1">
                                    Package: 1 Week
                                </Badge>
                            )
                        }
                        <Badge display="flex" alignItems="center" colorScheme="gray" width="fit-content" fontSize="10" borderRadius="lg" textTransform="unset">
                            Base Sepolia
                        </Badge>
                    </Box>
                    <Box position="relative" minH={180} w="full">
                        <AbsoluteCenter className={className} style={style}>
                            {
                                cardBodyType == "child-component" ? 
                                children : 
                                cardBodyType == "react-icons" && <Icon as={icon} boxSize={24} />
                            }
                        </AbsoluteCenter>
                    </Box>
                </CardBody>
                <CardFooter>
                    <SimpleGrid columns={5} columnGap="2" w="full">
                        {
                            multiplePaymentMethod && (
                                <GridItem colSpan={2}>
                                    <Select fontSize="sm" variant="filled" borderRadius="lg">
                                        <option value='ETH'>ETH</option>
                                        <option value='USDT'>USDT</option>
                                        <option value='USCD'>USDC</option>
                                    </Select>
                                </GridItem>
                            )
                        }
                        <GridItem colSpan={multiplePaymentMethod ? 3 : 5}>
                            <SubscriptionButton
                                chainId={chainId}
                                subscriptionText={subscriptionText}
                            />
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
