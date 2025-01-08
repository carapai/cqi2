import { ExcelHeader } from "@/interfaces";
export interface ExcelDownloadButtonProps<T> {
    headers: ExcelHeader[];
    data: T[];
    filename?: string;
    sheetName?: string;
    className?: string;
}
