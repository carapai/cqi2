/* eslint-disable @typescript-eslint/no-explicit-any */
import { Workbook, Worksheet } from "exceljs";
import { CellStyle, ColumnInfo, ExcelHeader } from "./interfaces";

export class ExcelGenerator {
    private workbook: Workbook;
    private worksheet: Worksheet | null;

    constructor() {
        this.workbook = new Workbook();
        this.worksheet = null;
    }

    private createHeaderStructure(headers: ExcelHeader[]): ColumnInfo {
        const columnInfo: ColumnInfo = {
            totalColumns: 0,
            merges: [],
            columns: [],
        };

        const currentColumn = 1;
        this.processHeaders(headers, 1, currentColumn, columnInfo);

        return columnInfo;
    }

    private processHeaders(
        headers: ExcelHeader[],
        row: number,
        startCol: number,
        columnInfo: ColumnInfo,
        level: number = 1,
    ): void {
        let currentCol = startCol;

        headers.forEach((header) => {
            const hasChildren = header.children && header.children.length > 0;
            const span = hasChildren
                ? this.calculateSpan(header.children!)
                : header.span || 1;

            // Add merge if span is greater than 1 or if there are no children
            if (span > 1 && !hasChildren) {
                columnInfo.merges.push({
                    start: { row, col: currentCol },
                    end: { row, col: currentCol + span - 1 },
                });
            }

            // Process children or add leaf column
            if (hasChildren) {
                columnInfo.merges.push({
                    start: { row, col: currentCol },
                    end: { row, col: currentCol + span - 1 },
                });

                this.processHeaders(
                    header.children!,
                    row + 1,
                    currentCol,
                    columnInfo,
                    level + 1,
                );
            } else {
                columnInfo.columns.push({
                    header: header.title,
                    key: header.key || `col${currentCol}`,
                    width: header.width || 15,
                });
            }

            columnInfo.totalColumns = Math.max(
                columnInfo.totalColumns,
                currentCol + span - 1,
            );

            currentCol += span;
        });
    }

    private calculateSpan(children: ExcelHeader[]): number {
        return children.reduce((total, child) => {
            if (child.children) {
                return total + this.calculateSpan(child.children);
            }
            return total + (child.span || 1);
        }, 0);
    }

    private styleHeaders(totalColumns: number): void {
        if (!this.worksheet) return;
        // Apply styles to header rows

        const headerStyle: CellStyle = {
            font: {
                bold: true,
                color: { argb: "000000" },
            },
            fill: {
                type: "pattern",
                pattern: "solid",
                fgColor: { argb: "FFE0E0E0" },
            },
            alignment: {
                vertical: "middle",
                horizontal: "center",
            },
            border: {
                top: { style: "thin" },
                left: { style: "thin" },
                bottom: { style: "thin" },
                right: { style: "thin" },
            },
        };

        // Apply styles to header rows
        for (let row = 1; row <= 2; row++) {
            for (let col = 1; col <= totalColumns; col++) {
                const cell = this.worksheet.getCell(row, col);
                Object.assign(cell, headerStyle);
            }
        }
    }

    public async generateExcel<T extends Record<string, any>>(
        headers: ExcelHeader[],
        data: T[],
        sheetName: string = "Sheet1",
    ): Promise<Blob> {
        this.worksheet = this.workbook.addWorksheet(sheetName);

        // Create header structure
        const columnInfo = this.createHeaderStructure(headers);

        // Set columns
        this.worksheet.columns = columnInfo.columns;

        // Apply merges
        columnInfo.merges.forEach((merge) => {
            this.worksheet?.mergeCells(
                merge.start.row,
                merge.start.col,
                merge.end.row,
                merge.end.col,
            );
        });

        // Add data
        if (data && data.length > 0) {
            this.worksheet.addRows(data);
        }

        // Style headers
        this.styleHeaders(columnInfo.totalColumns);

        // Generate blob
        const buffer = await this.workbook.xlsx.writeBuffer();
        return new Blob([buffer], {
            type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        });
    }

    // Helper method to download the generated Excel file
    public async downloadExcel<T extends Record<string, any>>(
        headers: ExcelHeader[],
        data: T[],
        filename: string = "download.xlsx",
        sheetName: string = "Sheet1",
    ): Promise<void> {
        const blob = await this.generateExcel(headers, data, sheetName);
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
    }
}
