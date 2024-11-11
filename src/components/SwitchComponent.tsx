import { ReactElement, ReactNode } from "react";
interface SwitchProps {
    condition: unknown;
    children: ReactElement[];
}

interface CaseProps {
    children: ReactNode;
    value?: unknown;
    default?: boolean;
}

export default function SwitchComponent({ condition, children }: SwitchProps) {
    const defaultResult = children.find((child) => child.props.default) || null;
    const result = children.find((child) => child.props.value === condition);
    return result || defaultResult;
}

export const Case: React.FC<CaseProps> = ({ children }) => <>{children}</>;
