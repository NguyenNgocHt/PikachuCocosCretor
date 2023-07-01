import * as cc from 'cc';
import { VDEventListener, VDEventListenerName } from '../common/VDEventListener';
import VDViewGroup from './VDViewGroup';

const { ccclass, property } = cc._decorator;

@ccclass
export default class VDBasePopup extends VDViewGroup {

    @property
    draggable: boolean = false;

    protected _touchMoved: boolean = false;

    public get hideWhenTouchOnBackground(): boolean {
        return this._hideWhenTouchOnBackground;
    }

    public set hideWhenTouchOnBackground(value: boolean) {
        this._hideWhenTouchOnBackground = value;
    }
    private _hideWhenTouchOnBackground: boolean = true;

    protected _hasNestedViewGroup(event: cc.EventTouch, captureListeners?: any[] | null): boolean {
        if (event.eventPhase !== cc.Event.CAPTURING_PHASE) return false;

        if (captureListeners) {
            //captureListeners are arranged from child to parent
            for (let i = 0; i < captureListeners.length; ++i) {
                let item = captureListeners[i];
                if (this.node === item) {
                    let target = event.target as cc.Node;
                    let vg = target?.getComponent(cc.ViewGroup) as cc.ViewGroup;
                    if (vg) {
                        if (vg instanceof VDViewGroup) {
                            return vg.isNestedViewGroup(event);
                        }
                    }
                    return vg != null;
                }
                let vg = item.getComponent(cc.ViewGroup) as cc.ViewGroup;
                if (vg) {
                    if (vg instanceof VDViewGroup) {
                        return vg.isNestedViewGroup(event);
                    }
                }
                return vg != null;
            }
        }
        return false;
    }

    onEnable() {
        if (this.draggable) {
            this.node.on(cc.Node.EventType.TOUCH_START, this._onTouchBegan, this, true);
            this.node.on(cc.Node.EventType.TOUCH_MOVE, this._onTouchMoved, this, true);
            this.node.on(cc.Node.EventType.TOUCH_END, this._onTouchEnded, this, true);
            this.node.on(cc.Node.EventType.TOUCH_CANCEL, this._onTouchCancelled, this, true);
        }
        else {
            this.node.on(cc.Node.EventType.TOUCH_START, this._onTouchBegan, this);
        }
    }

    onDisable() {
        if (this.draggable) {
            this.node.off(cc.Node.EventType.TOUCH_START, this._onTouchBegan, this, true);
            this.node.off(cc.Node.EventType.TOUCH_MOVE, this._onTouchMoved, this, true);
            this.node.off(cc.Node.EventType.TOUCH_END, this._onTouchEnded, this, true);
            this.node.off(cc.Node.EventType.TOUCH_CANCEL, this._onTouchCancelled, this, true);
        }
        else {
            this.node.off(cc.Node.EventType.TOUCH_START, this._onTouchBegan, this);
        }
    }

    _stopPropagationIfTargetIsMe(event: cc.EventTouch) {
        if (event.eventPhase === cc.Event.AT_TARGET && event.target === this.node) {
            event.propagationStopped = true;
            event.propagationImmediateStopped = true;
        }
    }

    _onTouchBegan(event: cc.EventTouch) {
        if (!this.enabledInHierarchy!) return;
        if (this._hasNestedViewGroup(event)) return;

        if (this.draggable) {
            this._touchMoved = false;
            this._stopPropagationIfTargetIsMe(event);
        }
        else {
            // event.propagationStopped = true;
            // event.propagationImmediateStopped = true;
            event.stopPropagation();
        }
    }

    _onTouchMoved(event: cc.EventTouch) {
        if (!this.enabledInHierarchy!) return;
        if (this._hasNestedViewGroup(event)) return;

        let distance = event.touch?.getDelta();
        this.node.position = this.node.position.add(new cc.Vec3(distance?.x, distance?.y, 0));
        var n = event.getLocation().subtract(event.getStartLocation());

        if (n.length() > 12 && !this._touchMoved && event.target != this.node) {
            var e = new cc.EventTouch(event.getTouches(), event.bubbles, cc.Node.EventType.TOUCH_CANCEL);
            // e.type = cc.Node.EventType.TOUCH_CANCEL;
            e.touch = event.touch;
            e.simulate = true;
            (event.target as cc.Node)?.dispatchEvent(e);
            this._touchMoved = true;
        }
    }

    _onTouchEnded(event: cc.EventTouch) {
        if (!this.enabledInHierarchy!) return;
        if (this._hasNestedViewGroup(event)) return;

        this._stopPropagationIfTargetIsMe(event);
    }

    _onTouchCancelled(event: cc.EventTouch) {
        if (!this.enabledInHierarchy!) return;
        if (this._hasNestedViewGroup(event)) return;

        this._stopPropagationIfTargetIsMe(event);
    }

    public hide() {
        VDEventListener.dispatchEvent(VDEventListenerName.REMOVE_BASE_POPUP, this);
    }

    popupWillAppear() {

    }

    popupDidAppear() {

    }

    popupWillDisappear() {

    }

    popupDidDisappear() {

    }

    onUITouchEvent(button: any) {

    }
}
