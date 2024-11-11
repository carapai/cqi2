/* eslint-disable @typescript-eslint/no-explicit-any */
import { ExcelGenerator } from "@/ExcelGenerator";
import { ExcelHeader } from "@/interfaces";

interface ExcelDownloadButtonProps<T> {
    headers: ExcelHeader[];
    data: T[];
    filename?: string;
    sheetName?: string;
    className?: string;
}

export const ExcelDownloadButton = <T extends Record<string, any>>({
    headers,
    data,
    filename = "download.xlsx",
    sheetName = "Sheet1",
    className = "",
}: ExcelDownloadButtonProps<T>) => {
    const handleDownload = async () => {
        const generator = new ExcelGenerator();
        try {
            await generator.downloadExcel(headers, data, filename, sheetName);
        } catch (error) {
            console.error("Error downloading Excel:", error);
        }
    };

    return (
        <button onClick={handleDownload} className={className}>
            Download Excel
        </button>
    );
};
