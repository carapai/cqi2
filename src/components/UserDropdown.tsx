import React, { useState, useEffect, useRef } from "react";
import { Settings, User, HelpCircle, Info, LogOut } from "lucide-react";
import { Stack, Text } from "@chakra-ui/react";

interface UserDropdownProps {
    initials: string;
    fullName: string;
    email: string;
}

export const UserDropdown = ({
    initials,
    fullName,
    email,
}: UserDropdownProps) => {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

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

    const menuItems = [
        {
            icon: <Settings size={20} />,
            label: "Settings",
            href: "../../../dhis-web-commons-security/logout.action",
        },
        {
            icon: <User size={20} />,
            label: "Account",
            href: "../../../dhis-web-user-profile/#/account",
        },
        {
            icon: <HelpCircle size={20} />,
            label: "Help",
            href: "https://dhis2.github.io/dhis2-docs/master/en/user/html/dhis2_user_manual_en.html",
        },
        {
            icon: <Info size={20} />,
            label: "About DHIS2",
            href: "../../../dhis-web-user-profile/#/aboutPage",
        },
        {
            icon: <LogOut size={20} />,
            label: "Logout",
            href: "../../../dhis-web-commons-security/logout.action",
        },
    ];

    return (
        <div className="relative" ref={dropdownRef}>
            <Stack
                alignItems="center"
                justifyContent="center"
                bgColor="#1A202C"
                borderRadius="full"
                cursor={"pointer"}
                w="32px"
                h="32px"
                title="User"
                onClick={() => setIsOpen(!isOpen)}
            >
                <Text fontWeight="bold" color="white" fontSize="sm">
                    {initials}
                </Text>
            </Stack>

            {isOpen && (
                <div className="absolute right-0 mt-2 w-72 bg-white rounded-md shadow-lg ring-1 ring-black ring-opacity-5 z-50">
                    <div className="p-4 border-b border-gray-200 flex flex-row items-center gap-2 justify-center">
                        <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center">
                            {initials}
                        </div>
                        <div>
                            <h3 className="text-base font-medium text-gray-900">
                                {fullName}
                            </h3>
                            <p className="text-sm text-gray-500">{email}</p>
                        </div>
                    </div>

                    <div className="py-1">
                        {menuItems.map((item) => (
                            <React.Fragment key={item.label}>
                                {/* {item.separator && (
                                    <div className="h-px bg-gray-200 mx-1 my-1" />
                                )} */}
                                <a
                                    href={item.href}
                                    className="flex items-center px-4 py-4 text-sm text-gray-700 hover:bg-gray-100"
                                >
                                    <span className="mr-3 text-gray-500">
                                        {item.icon}
                                    </span>
                                    {item.label}
                                </a>
                            </React.Fragment>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};
