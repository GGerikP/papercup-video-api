import { time } from "console";

const zeroPad = (num: number, places: number) => String(num).padStart(places, '0')

const convertMilliSecondsToHHMMSS = (timeInMilliSecs: number): string | null => {
    if (timeInMilliSecs === null || timeInMilliSecs === undefined || timeInMilliSecs < 0) {
        return null;
    }
    const seconds = Math.floor((timeInMilliSecs / 1000) % 60);
    const minutes = Math.floor((timeInMilliSecs / (1000 * 60)) % 60);
    const hours = Math.floor((timeInMilliSecs / (1000 * 60 * 60)));
    return `${zeroPad(hours, 2)}:${zeroPad(minutes, 2)}:${zeroPad(seconds, 2)}`;
}

const convertHHMMSSToMilliSeconds = (stringTime: string): number | null => {

    if (!stringTime) {
        return null;
    }
    const regex = /^(\d+):([0-5]\d):([0-5]\d)$/;
    if (!regex.test(stringTime)) {
        throw new Error(`Invalid Time format supplied: ${stringTime}`);
    }

    const [hours, minutes, seconds] = stringTime.split(":");
    return (parseInt(hours) * (1000 * 60 * 60)) + (parseInt(minutes) * (1000 * 60)) + (parseInt(seconds) * 1000)
}

export { convertHHMMSSToMilliSeconds, convertMilliSecondsToHHMMSS };