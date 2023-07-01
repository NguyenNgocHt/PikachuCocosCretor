export default class VDBaseTask {

    _delay = 0;
    _caller: any = null;
    _funcName: any = null;
    _args: any;
    _executed = false;

    constructor(caller: any, funcName: any, args: any, delay: number) {
        this._caller = caller;
        this._funcName = funcName;
        this._args = args;

        if (delay !== undefined) {
            this._delay = delay;
        }
    }

    /**
     * cooldown delay time and execute if delay over
     * @param dt
     */
    update(dt: number) {
        if (this._delay >= 0) {
            this._delay -= dt;

            if (this._delay <= 0) this.execute();
        }
    }

    /**
     * true if executed
     * @returns {boolean}
     */
    isDone(): boolean {
        return this._executed;
    }

    /**
     * execute the task
     */
    execute() {
        if (this._executed) return;
        this._executed = true;

        this._funcName?.apply(this._caller, this._args);
    }

    /**
     * clean up all
     */
    cleanUp() {
        this._caller = null;
        this._funcName = null;
        this._args = null;
    }
}
