interface LoadingProps {
    text?: string;
    size?: "sm" | "md" | "lg";
    showText?: boolean;
    spinnerColor?: string;
    textColor?: string;
}

export const Loading: React.FC<LoadingProps> = ({
    text = "Loading...",
    size = "md",
    showText = true,
    spinnerColor = "border-blue-600",
    textColor = "text-gray-600",
}) => {
    // Size mappings for the spinner
    const sizeClasses = {
        sm: "w-6 h-6 border-2",
        md: "w-10 h-10 border-3",
        lg: "w-16 h-16 border-4",
    };

    // Size mappings for the text
    const textSizes = {
        sm: "text-sm",
        md: "text-base",
        lg: "text-lg",
    };

    return (
        <div className="fixed inset-0 flex items-center justify-center bg-white bg-opacity-80">
            <div className="flex flex-col items-center space-y-4">
                <div
                    className={`
            ${sizeClasses[size]}
            rounded-full
            border-t-transparent
            ${spinnerColor}
            animate-spin
          `}
                    role="status"
                    aria-label="loading"
                />

                {showText && (
                    <span
                        className={`${textSizes[size]} ${textColor} font-medium`}
                    >
                        {text}
                    </span>
                )}
            </div>
        </div>
    );
};
