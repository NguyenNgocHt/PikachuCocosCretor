import * as cc from 'cc';
import { CCBoolean } from 'cc';
import VDControlEvent from './VDControlEvent';

const { ccclass, property } = cc._decorator;

@ccclass
export default class VDTouchHandler extends cc.Component {
    @property(cc.EventHandler)
    touchEvent: cc.EventHandler = new cc.EventHandler();

    @property(CCBoolean)
    longClickEnabled = false;

    private _longPressed: boolean = false;
    private _pressed: boolean = false;
    private _lastHits: any = {};

    onEnable() {
        this._registerEvent();
    }

    onDisable() {
        this._unregisterEvent();
        this.cancelTouch();
    }

    private _registerEvent() {
        let node = this.node as any;
        node.on(cc.Node.EventType.TOUCH_START, this._onTouchBegan, this);
        node.on(cc.Node.EventType.TOUCH_MOVE, this._onTouchMoved, this);
        node.on(cc.Node.EventType.TOUCH_END, this._onTouchEnded, this);
        node.on(cc.Node.EventType.TOUCH_CANCEL, this._onTouchCancelled, this);
        cc.game.on(cc.Game.EVENT_SHOW, this.cancelTouch, this);
    }

    private _unregisterEvent() {
        let node = this.node as any;
        node.off(cc.Node.EventType.TOUCH_START, this._onTouchBegan, this);
        node.off(cc.Node.EventType.TOUCH_MOVE, this._onTouchMoved, this);
        node.off(cc.Node.EventType.TOUCH_END, this._onTouchEnded, this);
        node.off(cc.Node.EventType.TOUCH_CANCEL, this._onTouchCancelled, this);
        cc.game.off(cc.Game.EVENT_SHOW, this.cancelTouch, this);
    }

    protected _onTouchBegan(event: cc.EventTouch): void {
        if (!this.enabledInHierarchy) return;

        let touch = event.touch as any;

        let node = this.node as any;
        this._lastHits[touch.__instanceId] = node._hitTest(touch.getLocation());
        node.emit(VDControlEvent.TouchDown, touch);
        this._pressed = true;
        if (this.longClickEnabled) {
            this.scheduleOnce(this._longClickExec.bind(this), 1.2);
        }
        event.propagationStopped = false;

    }

    protected _onTouchMoved(event: cc.EventTouch) {
        if (!this.enabledInHierarchy ||
            !this._pressed) return;

        let touch = event.touch as any;

        let node = this.node as any;
        let hit = node._hitTest(touch.getLocation());
        if (this._lastHits[touch.__instanceId] != hit) {
            if (hit) {
                this.node.emit(VDControlEvent.TouchDragEnter, touch);
                this.node.emit(VDControlEvent.TouchDragInside, touch);
            } else {
                this.node.emit(VDControlEvent.TouchDragExit, touch);
                this.node.emit(VDControlEvent.TouchDragOutside, touch);
            }
            this._lastHits[touch.__instanceId] = hit;
        } else {
            if (hit) {
                this.node.emit(VDControlEvent.TouchDragInside, touch);
            } else {
                this.node.emit(VDControlEvent.TouchDragOutside, touch);
            }
        }
        this.stopPropagation(event);
    }

    protected _onTouchEnded(event: cc.EventTouch) {
        if (!this.enabledInHierarchy) return;

        let touch = event.touch as any;

        if (this._pressed) {
            this._pressed = false;
            if (!this._longPressed) {
                cc.EventHandler.emitEvents([this.touchEvent], event);
                this.node.emit(VDControlEvent.ClickByTouchHandler, touch);
            } else {
                this._longPressed = false;
            }
        }

        this.node.emit(VDControlEvent.TouchUpInside, touch);

        delete this._lastHits[touch.__instanceId];
        this.stopPropagation(event);
        this.unscheduleAllCallbacks();
    }

    protected _onTouchCancelled(event: cc.EventTouch) {
        if (!this.enabledInHierarchy) return;

        this._pressed = false;
        this._longPressed = false;
        let touch = event.touch as any;
        this.node.emit(VDControlEvent.TouchUpOutside, touch);
        delete this._lastHits[touch.__instanceId];
        this.unscheduleAllCallbacks();
    }

    private _longClickExec(dt: number) {
        if (this.longClickEnabled && this._pressed && !this._longPressed) {
            this.node.emit(VDControlEvent.LongClick, this);
            this._longPressed = true;
        }
    }

    cancelTouch() {
        this._pressed = false;
        this._longPressed = false;
        this.unscheduleAllCallbacks();
        for (let touchId in this._lastHits) {
            delete this._lastHits[touchId];
        }
    }

    stopPropagation(event: cc.Event) {
        event.propagationImmediateStopped = true;
        event.propagationStopped = true;
    }

}