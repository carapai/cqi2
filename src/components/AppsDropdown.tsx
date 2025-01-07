import { Image } from "antd";
import { Text, Input,Box, Stack } from "@chakra-ui/react";
import { useEffect, useRef, useState } from "react";

export default function AppsDropdown({
    apps,
}: {
    apps: Array<{
        name: string;
        image: string;
        path: string;
    }>;
}) {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    const [search, setSearch] = useState<string>("");

    const [availableApps, setAvailableApps] = useState<
        Array<{
            name: string;
            image: string;
            path: string;
        }>
    >(apps);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (
                dropdownRef.current &&
                !dropdownRef.current.contains(event.target as Node)
            ) {
                setIsOpen(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () =>
            document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    return (
        <div className="relative" ref={dropdownRef}>
            <Stack position="relative" cursor={"pointer"}>
                <Image
                    src="appmenu.png"
                    width="20px"
                    alt="App Menu Icon"
                    preview={false}
                    onClick={() => setIsOpen(!isOpen)}
                />
            </Stack>

            {isOpen && (
                <div className="absolute right-0 mt-[5px] w-[300vw] min-w-[300px] max-w-[560px] bg-white rounded-md shadow-lg ring-1 ring-black ring-opacity-5 z-50 p-1 min-h-[200px] max-h-[465px]">
                    <Input
                        color="black"
                        value={search}
                        onChange={(e) => {
                            setSearch(() => e.target.value);
                            setAvailableApps(() =>
                                apps.filter((a) =>
                                    a.name
                                        .toLowerCase()
                                        .includes(e.target.value.toLowerCase()),
                                ),
                            );
                        }}
                    />
                    <Box
                        display="flex"
                        flexDirection="row"
                        flexWrap="wrap"
                        alignContent="flex-start"
                        alignItems="flex-start"
                        justifyContent="flex-start"
                        overflow="auto"
                        overflowX="hidden"
                    >
                        {availableApps.map(({ name, image, path }) => (
                            <Box
                                as="a"
                                display="flex"
                                flexDirection="column"
                                alignItems="center"
                                justifyContent="center"
                                alignContent="center"
                                justifyItems="center"
                                w="96px"
                                m="8px"
                                borderRadius="12px"
                                textDecor="none"
                                cursor="pointer"
                                href={path}
                                key={name}
                            >
                                <Image
                                    src={image}
                                    alt=""
                                    preview={false}
                                    width="48px"
                                    height="48px"
                                    style={{
                                        cursor: "pointer",
                                    }}
                                />
                                <Text
                                    textAlign="center"
                                    overflowWrap="anywhere"
                                    mt="14px"
                                    color="rgba(0, 0, 0, 0.87)"
                                    fontSize="12px"
                                    letterSpacing="0.01em"
                                    lineHeight="14px"
                                    cursor="pointer"
                                >
                                    {name}
                                </Text>
                            </Box>
                        ))}
                    </Box>
                </div>
            )}
        </div>
    );
}
