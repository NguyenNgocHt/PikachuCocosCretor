import { _decorator, find, instantiate, isValid, Node, Prefab, Tween, tween, Vec3 } from 'cc';
import VDScreenManager from '../../../../vd-framework/ui/VDScreenManager';
import { pika_Path } from '../common/pika_Define'; 
const { ccclass, property } = _decorator;

@ccclass('pika_WaitingProgress')
export class pika_WaitingProgress {
    private _isShowing: boolean = false;
    private _nodeWaiting: Node = null;
    private tweenWaitingRF!: Tween<Node>;

    static _instance: pika_WaitingProgress;

    static get instance() {
        if (!this._instance) {
            this._instance = new pika_WaitingProgress();
        }
        return this._instance;
    }

    init() {
        // init node and add to Canvas
        let prefabWaiting = VDScreenManager.instance.assetBundle.get(pika_Path.WATING_PROGRESS, Prefab)!;
        const node = instantiate(prefabWaiting!);
        node.setPosition(0, 0, 0);

        // rotate img waiting
        let imgWaiting = node.getChildByName('img_waiting');
        this.tweenWaitingRF = tween(imgWaiting)
            .by(1, { eulerAngles: new Vec3(0, 0, -360) })
            .repeatForever();

        this._nodeWaiting = node; // save node to reuse
    }

    show() {
        if (this._isShowing) return;

        // node WaitingProgress is existed
        if (this._nodeWaiting && isValid(this._nodeWaiting)) {
            // log('@@@ Waiting reuse');
            this._nodeWaiting.parent = find('Canvas');
            this._nodeWaiting.active = true;
            this.tweenWaitingRF && this.tweenWaitingRF.start();
            this._isShowing = true;
        }
    }

    hide() {
        if (this._nodeWaiting && isValid(this._nodeWaiting)) {
            this._nodeWaiting.parent = null;
        }
        this.tweenWaitingRF && this.tweenWaitingRF.stop();
        this._isShowing = false;
    }

}


