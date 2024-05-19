import { convertHHMMSSToMilliSeconds, convertMilliSecondsToHHMMSS } from "./formatTime";

describe('formatTime unit tests', () => {
    it('tests convertMilliSecondsToHHMMSS with a null value', async () => {
        const expected: null = null;
        const actual = convertMilliSecondsToHHMMSS(null);
        expect(expected).toEqual(actual);
    });
    it('tests convertMilliSecondsToHHMMSS: round 1ms down to 0s', async () => {
        const expected: string = "00:00:00";
        const actual = convertMilliSecondsToHHMMSS(1);
        expect(expected).toEqual(actual);
    });
    it('tests convertMilliSecondsToHHMMSS: round 999ms down to 0s', async () => {
        const expected: string = "00:00:00";
        const actual = convertMilliSecondsToHHMMSS(999);
        expect(expected).toEqual(actual);
    });
    it('tests convertMilliSecondsToHHMMSS: round 60000 down to 1m', async () => {
        const expected: string = "00:01:00";
        const actual = convertMilliSecondsToHHMMSS(60000);
        expect(expected).toEqual(actual);
    });
    it('tests convertMilliSecondsToHHMMSS: round 61000 number down to 1m 1s', async () => {
        const expected: string = "00:01:01";
        const actual = convertMilliSecondsToHHMMSS(61000);
        expect(expected).toEqual(actual);
    });
    it('tests convertMilliSecondsToHHMMSS: round 3661000 number down to h1 1m 1s', async () => {
        const expected: string = "01:01:01";
        const actual = convertMilliSecondsToHHMMSS(3661000);
        expect(expected).toEqual(actual);
    });


    it('tests convertHHMMSSToMilliSeconds: convert 0s to 0ms', async () => {
        const expected = 0;
        const actual = convertHHMMSSToMilliSeconds("00:00:00");
        expect(expected).toEqual(actual);
    });
    it('tests convertHHMMSSToMilliSeconds: convert 1s to 1000ms', async () => {
        const expected = 1000;
        const actual = convertHHMMSSToMilliSeconds("00:00:01");
        expect(expected).toEqual(actual);
    });
    it('tests convertHHMMSSToMilliSeconds: convert 1m 1s to 61000ms', async () => {
        const expected: string = "00:01:01";
        const actual = convertMilliSecondsToHHMMSS(61000);
        expect(expected).toEqual(actual);
    });
    it('tests convertHHMMSSToMilliSeconds: convert 1h 1m 1s to 3600000ms', async () => {
        const expected: string = "01:00:00";
        const actual = convertMilliSecondsToHHMMSS(3600000);
        expect(expected).toEqual(actual);
    });
    it('tests convertHHMMSSToMilliSeconds: convert 1h 1m 1s to 90000000ms', async () => {
        const expected: string = "25:00:00";
        const actual = convertMilliSecondsToHHMMSS(90000000);
        expect(expected).toEqual(actual);
    });
});
