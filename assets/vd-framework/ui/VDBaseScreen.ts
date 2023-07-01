import * as cc from 'cc';
import VDGameLoop from '../common/VDGameLoop';
import VDViewGroup from './VDViewGroup';

const { ccclass, property } = cc._decorator;

@ccclass
export default class VDBaseScreen extends VDViewGroup {
    @property
    hideCurScreenOnShow: boolean = true;

    protected needLooping: boolean = false;

    start() {
        if (this.needLooping) {
            this._createGameLoop();
        }
        // VDAsyncTaskMgr.instance.schedule();
    }

    onDisable() {
        if (this.needLooping) {
            VDGameLoop.instance.stop();
        }
    }

    _createGameLoop() {
        VDGameLoop.instance.start();
        VDGameLoop.instance.addFunc("update_screen", this, this.updateScreen.bind(this));
    }

    public updateScreen() { }
}