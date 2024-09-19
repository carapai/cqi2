import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ChakraProvider } from "@chakra-ui/react";

import {
    RouterProvider,
    createHashHistory,
    createRouter,
} from "@tanstack/react-router";
import { ConfigProvider } from "antd";

import ReactDOM from "react-dom/client";
import "./index.css";
import { routeTree } from "./routeTree.gen";

const queryClient = new QueryClient({
    defaultOptions: { queries: { refetchOnWindowFocus: false, retry: 0 } },
});
const history = createHashHistory();
// Set up a Router instance
const router = createRouter({
    routeTree,
    context: {
        queryClient,
    },
    defaultPreload: false,
    history,
});

declare module "@tanstack/react-router" {
    interface Register {
        router: typeof router;
    }
}

const rootElement = document.getElementById("root");

if (rootElement && !rootElement.innerHTML) {
    const root = ReactDOM.createRoot(rootElement);
    root.render(
        <ConfigProvider
            theme={{
                token: { borderRadius: 0, boxShadow: "none" },
                components: {
                    Table: {
                        borderRadius: 0,
                    },
                },
            }}
        >
            <QueryClientProvider client={queryClient}>
                <ChakraProvider>
                    <RouterProvider router={router} />
                </ChakraProvider>
            </QueryClientProvider>
        </ConfigProvider>,
    );
}
