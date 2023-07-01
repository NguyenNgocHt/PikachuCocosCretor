import * as cc from 'cc';
const { ccclass, property } = cc._decorator;

export class VDTimelineTask {
    constructor(key: string, func: Function, caller: any | null, args: any[] | null, delay: number) {
        this.key = key;
        this.func = func;
        this.caller = caller;
        this.args = args;
        this.delay = delay;
    }
    key: string;
    func: Function | null;
    caller: any;
    args: any[] | null;
    delay: number;
    startingTime: number = 0;
    started: boolean = false;

    isDelay() {
        return this.delay > 0;
    }
    /**
    * update all task inside
    * @param dt delta time in second
    */
    update(dt: number) {
        let args: any[] = [dt];
        if (this.delay > 0) {
            this.delay -= dt;
        }
        if (this.delay <= 0) {
            this.started = true;
            if (this.args && this.args.length != 0) {
                args = args.concat(this.args);
            }
            this.func?.apply(this.caller, args);
        }
    }

    cleanUp() {
        this.caller = null;
        this.func = null;
        this.args = null;
    }

    getKey() {
        return this.key;
    }
}


export default class VDTimelineTaskMgr extends cc.Component {
    private _pool: VDTimelineTask[] = [];
    private _intervalId: number = -1;
    private _dt: number = 0.025;
    private _isRunning = true;
    private _lastestTimeStamp: number = 0;

    private static _instance: VDTimelineTaskMgr = null!;
    public static get instance(): VDTimelineTaskMgr {
        if (VDTimelineTaskMgr._instance == null) {
            VDTimelineTaskMgr._instance = new VDTimelineTaskMgr();
        }
        return VDTimelineTaskMgr._instance;
    }

    constructor() {
        super();
        this.schedule(this.update.bind(this), 0, cc.macro.REPEAT_FOREVER, 0);
        cc.game.on(cc.Game.EVENT_HIDE, this._onHideGame, this);
        cc.game.on(cc.Game.EVENT_SHOW, this._onShowGame, this);
    }

    destroy() {
        this.unscheduleAllCallbacks();
        cc.game.off(cc.Game.EVENT_HIDE, this._onHideGame, this);
        cc.game.off(cc.Game.EVENT_SHOW, this._onShowGame, this);

        return super.destroy();
    }

    private _onShowGame() {
        this._isRunning = true;
        let delta = performance.now() - this._lastestTimeStamp;
        this.update(delta);
        this._lastestTimeStamp = 0;

    }

    private _onHideGame() {
        this._isRunning = false;
        this._lastestTimeStamp = performance.now();
    }

    update(dt: number) {
        if (!this._isRunning || this._pool.length == 0) {
            return;
        }

        for (let i = 0; i < this._pool.length; ++i) {
            if (this._lastestTimeStamp > 0 && this._pool[i].started) {
                this._pool[i].update(dt);
            }
            else {
                this._pool[i].update(dt);
            }
        }
    }

    removeTaskByKey(key: string) {
        for (let i = 0; i < this._pool.length; ++i) {
            if (this._pool[i].getKey() && this._pool[i].getKey() === key) {
                this._pool[i].cleanUp();
                this._pool.splice(i, 1);
                return true;
            }
        }

        return false;
    }

    scheduleTask(key: string, updateFunc: Function, caller: any | null = null, args: any[] | null = null, overide: boolean = true, delay: number = 0) {
        if (overide) {
            for (let i = 0; i < this._pool.length; ++i) {
                if (this._pool[i].getKey() && this._pool[i].getKey() === key) {
                    this._pool[i].cleanUp();
                    this._pool.splice(i, 1);
                    break;
                }
            }
        }
        let task = new VDTimelineTask(key, updateFunc, caller, args, delay);
        task.startingTime = Date.now() + delay * 1000;
        this._pool.push(task);
    }

    /**
     * clean up all
     */
    cleanUp() {
        for (var i = 0; i < this._pool.length; ++i) {
            if (this._pool[i]) {
                this._pool[i].cleanUp();
            }
        }
        this._pool.splice(0, this._pool.length);
    }
}