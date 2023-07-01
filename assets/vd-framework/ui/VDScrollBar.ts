import * as cc from 'cc';
import VDScrollView from './VDScrollView';


const { ccclass, property, type } = cc._decorator;

var BAR_LINE_HEIGHT = 10;

export enum VDScrollBarDirection {
    VERTICAL = 1,
    HORIZONTAL = 2
}

@ccclass
export default class VDScrollBar extends cc.Component {

    @property(cc.Sprite)
    bar: cc.Sprite = null!;

    @property(VDScrollView)
    scrollView: VDScrollView = null!;

    @property({
        type: cc.Enum(VDScrollBarDirection)
    })
    direction: VDScrollBarDirection = VDScrollBarDirection.VERTICAL;

    onLoad() {
        if (this.scrollView && (this.direction & this.scrollView.direction) != 0 && this.bar && (this.direction == VDScrollBarDirection.HORIZONTAL || this.direction == VDScrollBarDirection.VERTICAL)) {

        } else {
            throw "Scroll Bar init failed, check ui logic again";
        }
    }

    onEnable() {
        this.node.on('position-changed', this.updateBackground, this);
        this.node.on('scale-changed', this.updateBackground, this);
        this.node.on('size-changed', this.updateBackground, this);
        this.node.on('rotation-changed', this.updateBackground, this);
    }

    onDisable() {
        this.node.off('position-changed', this.updateBackground, this);
        this.node.off('scale-changed', this.updateBackground, this);
        this.node.off('size-changed', this.updateBackground, this);
        this.node.off('rotation-changed', this.updateBackground, this);
    }

    start() {
        this.updateBackground();
    }

    updateBackground() {
        if (this.scrollView) {
            this.node.getComponent(cc.UITransform)!.height = this.scrollView.node.getComponent(cc.UITransform)!.height;
            this.node.getComponent(cc.UITransform)!.width = BAR_LINE_HEIGHT;

            if (this.direction == VDScrollBarDirection.VERTICAL) {
                //set background position at the right of the view
                let x = this.scrollView.node.getComponent(cc.UITransform)!.width * (1 - this.scrollView.node.getComponent(cc.UITransform)!.anchorX) - (this.node.getComponent(cc.UITransform)!.width * (1 - this.node.getComponent(cc.UITransform)!.anchorX) * this.node.getScale().x);
                let y = this.scrollView.node.getComponent(cc.UITransform)!.height * (1 - this.scrollView.node.getComponent(cc.UITransform)!.anchorY) - (this.node.getComponent(cc.UITransform)!.height * (1 - this.node.getComponent(cc.UITransform)!.anchorY) * this.node.getScale().y);
                this.node.setPosition(x, y);
            } else if (this.direction == VDScrollBarDirection.HORIZONTAL) {
                //set background position at the bottom of the view
                this.node.angle = 90;
                let x = this.scrollView.node.getComponent(cc.UITransform)!.width * (1 - this.scrollView.node.getComponent(cc.UITransform)!.anchorX) - (this.node.getComponent(cc.UITransform)!.height * (1 - this.node.getComponent(cc.UITransform)!.anchorY) * this.node.getScale().y);
                let y = - this.scrollView.node.getComponent(cc.UITransform)!.height * this.scrollView.node.getComponent(cc.UITransform)!.anchorY + (this.node.getComponent(cc.UITransform)!.width * (1 - this.node.getComponent(cc.UITransform)!.anchorX) * this.node.getScale().x);
                this.node.setPosition(x, y);
            }
            this.updateScrollBar();
        }
    }

    updateScrollBar() {
        let factor = Math.min(this.scrollView.node.getComponent(cc.UITransform)!.height / this.scrollView.content.getComponent(cc.UITransform)!.height, 1);
        // let scrollRatio = this.
        this.bar.node.getComponent(cc.UITransform)!.height = factor * this.node.getComponent(cc.UITransform)!.height;
        this.bar.node.getComponent(cc.UITransform)!.width = this.node.getComponent(cc.UITransform)!.width;
        if (this.direction == VDScrollBarDirection.VERTICAL) {
            let x = this.node.getComponent(cc.UITransform)!.width * (1 - this.node.getComponent(cc.UITransform)!.anchorX) - (this.bar.node.getComponent(cc.UITransform)!.width * (1 - this.bar.node.getComponent(cc.UITransform)!.anchorX) * this.bar.node.getScale().x);
            let y = this.node.getComponent(cc.UITransform)!.width * (1 - this.node.getComponent(cc.UITransform)!.anchorX) - (this.bar.node.getComponent(cc.UITransform)!.width * (1 - this.bar.node.getComponent(cc.UITransform)!.anchorX) * this.bar.node.getScale().x);
            this.bar.node.setPosition(x, y);
        }
    }
}
