import { UIOpacity } from 'cc';
import { UITransform } from 'cc';
import { size } from 'cc';
import { Vec3 } from 'cc';
import { tween } from 'cc';
import { _decorator, Component, Node } from 'cc';
import { pika_GAME_STATE_EVENT } from '../network/pika_NetworkDefine';
const { ccclass, property } = _decorator;

@ccclass('pika_PS_starting_effect')
export class pika_PS_starting_effect extends Component {
    private start_1: Node = null;
    private start_2: Node = null;
    private bl: Node = null;
    private pos_center: Node = null;
    private pos_origin_start_1: Vec3 = new Vec3(0, 0, 0);
    private pos_origin_start_2: Vec3 = new Vec3(0, 0, 0);
    onLoad() {
        this.start_1 = this.node.getChildByName('start_1');
        this.start_2 = this.node.getChildByName('start_2');
        this.bl = this.node.getChildByName('bl');
        this.pos_center = this.node.getChildByName('position_center');
        this.pos_origin_start_1 = this.start_1.getWorldPosition();
        this.pos_origin_start_2 = this.start_2.getWorldPosition();
    }
    start() {
    }
    clear_BL() {
        this.bl.active = false;
    }
    start_node_moving() {
        tween(this.start_1)
            .to(0.5, { worldPosition: this.pos_center.getWorldPosition() }, { easing: "backInOut" })
            .call(() => {
                tween(this.start_1)
                    .delay(0.3)
                    .to(0.5, { worldPosition: this.pos_origin_start_2 }, { easing: "backInOut" })
                    .call(() => {
                        this.start_1.setWorldPosition(this.pos_origin_start_1);
                        tween(this.bl.getComponent(UITransform))
                            .to(0.1, { contentSize: size(720, 0) })
                            .call(() => {
                                this.bl.active = false;
                                this.node.emit(pika_GAME_STATE_EVENT.START_EFFECT_END);
                            })
                            .start();
                    })
                    .start();
            })
            .start();

        tween(this.start_2)
            .to(0.5, { worldPosition: this.pos_center.getWorldPosition() }, { easing: "backInOut" })
            .call(() => {
                tween(this.start_2)
                    .delay(0.3)
                    .to(0.5, { worldPosition: this.pos_origin_start_1 }, { easing: "backInOut" })
                    .call(() => {
                        this.start_1.setWorldPosition(this.pos_origin_start_2);
                    })
                    .start();
            })
            .start();
    }

}


