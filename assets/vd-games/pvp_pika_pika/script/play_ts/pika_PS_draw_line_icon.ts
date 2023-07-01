import { Vec2 } from 'cc';
import { Graphics } from 'cc';
import { _decorator, Component, Node, v3 } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('pika_PS_draw_line_icon')
export class pika_PS_draw_line_icon extends Component {
    area: Node = null;
    graphics: Graphics = null;
    start() {
        this.init_graphics();
    }
    init_graphics() {
        let parentG = this.node.getParent();
        this.area = parentG ? parentG : null;
        this.graphics = this.node.getComponent(Graphics);
    }
    draw_line_2_icon(pos_1: Vec2, pos_2: Vec2) {
        let out_1 = v3();
        this.area.inverseTransformPoint(out_1, v3(pos_1.x, pos_1.y, 0));
        let out_2 = v3();
        this.area.inverseTransformPoint(out_2, v3(pos_2.x, pos_2.y, 0));
        let g = this.graphics;
        g.moveTo(out_1.x, out_1.y);
        g.lineTo(out_2.x, out_2.y);
        g.stroke();
    }
    clear_line_2_icon() {
        let g = this.graphics;
        g.clear();
    }
}


