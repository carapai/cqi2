interface DHIS2Periods {
    daily: string;
    weekly: string;
    weeklyWednesday: string;
    weeklyThursday: string;
    weeklyBiSaturday: string;
    weeklyBiSunday: string;
    weeklyBiMonday: string;
    weeklyBiTuesday: string;
    weeklyBiWednesday: string;
    weeklyBiThursday: string;
    weeklyBiFriday: string;
    monthly: string;
    biMonthly: string;
    quarterly: string;
    sixMonthly: string;
    sixMonthlyApril: string;
    yearly: string;
    financialApril: string;
    financialJuly: string;
    financialOct: string;
}

/**
 * Generates DHIS2 period values for all period types given a date
 * @param date - The date to generate periods for
 * @returns An object containing period values for all DHIS2 period types
 */
export function generateDHIS2Periods(date: Date): DHIS2Periods {
    const year = date.getFullYear();
    const month = date.getMonth() + 1; // JavaScript months are 0-indexed
    const weekNumber = getISOWeek(date);

    return {
        daily: formatDate(date, "yyyyMMdd"),
        weekly: `${year}W${padNumber(weekNumber)}`,
        weeklyWednesday: getWeeklyWednesday(date),
        weeklyThursday: getWeeklyThursday(date),
        weeklyBiSaturday: getWeeklyBi(date, 6),
        weeklyBiSunday: getWeeklyBi(date, 0),
        weeklyBiMonday: getWeeklyBi(date, 1),
        weeklyBiTuesday: getWeeklyBi(date, 2),
        weeklyBiWednesday: getWeeklyBi(date, 3),
        weeklyBiThursday: getWeeklyBi(date, 4),
        weeklyBiFriday: getWeeklyBi(date, 5),
        monthly: `${year}${padNumber(month)}`,
        biMonthly: `${year}${padNumber(Math.ceil(month / 2))}B`,
        quarterly: `${year}Q${Math.ceil(month / 3)}`,
        sixMonthly: `${year}S${month <= 6 ? 1 : 2}`,
        sixMonthlyApril: getSixMonthlyApril(date),
        yearly: `${year}`,
        financialApril: getFinancialApril(date),
        financialJuly: getFinancialJuly(date),
        financialOct: getFinancialOct(date),
    };
}

// Helper functions

function padNumber(num: number): string {
    return num.toString().padStart(2, "0");
}

function formatDate(date: Date, format: string): string {
    const map: { [key: string]: string } = {
        mm: padNumber(date.getMonth() + 1),
        dd: padNumber(date.getDate()),
        yyyy: date.getFullYear().toString(),
    };
    return format.replace(
        /mm|dd|yyyy/gi,
        (matched) => map[matched.toLowerCase()],
    );
}

function getISOWeek(date: Date): number {
    const d = new Date(
        Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()),
    );
    const dayNum = d.getUTCDay() || 7;
    d.setUTCDate(d.getUTCDate() + 4 - dayNum);
    const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
    return Math.ceil(((d.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
}

function getWeeklyWednesday(date: Date): string {
    const d = new Date(date);
    d.setDate(d.getDate() - ((d.getDay() + 4) % 7));
    return `${d.getFullYear()}WedW${padNumber(getISOWeek(d))}`;
}

function getWeeklyThursday(date: Date): string {
    const d = new Date(date);
    d.setDate(d.getDate() - ((d.getDay() + 3) % 7));
    return `${d.getFullYear()}ThuW${padNumber(getISOWeek(d))}`;
}

function getWeeklyBi(date: Date, startDay: number): string {
    const d = new Date(date);
    d.setDate(d.getDate() - ((d.getDay() - startDay + 7) % 7));
    const biWeekNum = Math.floor((d.getDate() - 1) / 14) + 1;
    const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    return `${d.getFullYear()}${dayNames[startDay]}BiW${biWeekNum}`;
}

function getSixMonthlyApril(date: Date): string {
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    if (month >= 4 && month <= 9) {
        return `${year}AprilS1`;
    } else {
        return month >= 10 ? `${year}AprilS2` : `${year - 1}AprilS2`;
    }
}

function getFinancialApril(date: Date): string {
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    return month >= 4 ? `${year}April` : `${year - 1}April`;
}

function getFinancialJuly(date: Date): string {
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    return month >= 7 ? `${year}July` : `${year - 1}July`;
}

function getFinancialOct(date: Date): string {
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    return month >= 10 ? `${year}Oct` : `${year - 1}Oct`;
}

// Example usage
const date = new Date("2023-05-15");
const periods = generateDHIS2Periods(date);
console.log(periods);
