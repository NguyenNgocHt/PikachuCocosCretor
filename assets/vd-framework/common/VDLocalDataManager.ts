import * as cc from 'cc';

export default class VDLocalDataManager {

    public static getString(key: string, defaultValue: string): string {
        var val = cc.sys.localStorage.getItem(key);
        if (val === null || Number.isNaN(val))
            return defaultValue;
        else {
            return val;
        }
    }

    public static setString(key: string, value: string): void {
        cc.sys.localStorage.setItem(key, value);
    }

    public static getNumber(key: string, defaultValue: number): number {
        var val = cc.sys.localStorage.getItem(key);
        if (val === null || Number.isNaN(val))
            return defaultValue;
        else
            return Number(val).valueOf();
    }

    public static setNumber(key: string, value: number) {
        cc.sys.localStorage.setItem(key, value.toString());
    }

    public static getBoolean(key: string, defaultValue: boolean): boolean {
        var val = cc.sys.localStorage.getItem(key);

        if (val === null || val === undefined || val === '')
            return defaultValue;
        else {
            return !(val == 'true');
        }

    }

    public static setBoolean(key: string, value: boolean) {
        var numVal = value ? "false" : "true";
        cc.sys.localStorage.setItem(key, numVal);
    }
}