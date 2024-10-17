import { Card, CardBody, Text } from "@chakra-ui/react"
import { ThemeProvider } from "../providers/ThemeProvider";

export const SubscriptionCard = () => {

    return (
        <ThemeProvider>
            <Card>
                <CardBody>
                    <Text>Test</Text>
                </CardBody>
            </Card>
        </ThemeProvider>
    );
}
