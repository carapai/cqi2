import { createLink, LinkComponent } from "@tanstack/react-router";
import * as React from "react";

import { Button, ButtonProps } from "antd";

const ChakraLinkComponent = React.forwardRef<
    HTMLAnchorElement,
    Omit<ButtonProps, "href">
>((props, ref) => {
    return <Button ref={ref} {...props} />;
});

const CreatedLinkComponent = createLink(ChakraLinkComponent);

export const LinkButton: LinkComponent<typeof ChakraLinkComponent> = (
    props,
) => {
    return (
        <CreatedLinkComponent
            _hover={{ textDecoration: "none" }}
            _focus={{ textDecoration: "none" }}
            preload={"intent"}
			type="primary"
            {...props}
        />
    );
};
