import { spriteAssembler } from 'cc';
import { Prefab } from 'cc';
import { _decorator, Component, Node, instantiate, Vec3, UITransform, Sprite, SpriteFrame, SpriteAtlas, tween, log } from 'cc';
import { ICON_MOVING_STATUS, ICON_OLD_NEW_STATUS, MOVINGNEXT_STATUS, pika_Path, pika_chess_icon_properties } from '../common/pika_Define';
import VDScreenManager from '../../../../vd-framework/ui/VDScreenManager';
import { pika_Director } from '../core/pika_Director';
import { pika_PS_get_cot_hang_icon_chess } from './pika_PS_get_cot_hang_icon_chess';
import { pika_GAME_STATE_EVENT } from '../network/pika_NetworkDefine';
import { VDEventListener } from '../../../../vd-framework/common/VDEventListener';
import { Vec2 } from 'cc';
import { pika_board_icon_dataModel } from '../model/pika_play_data_model';
import { pika_searchingOpp_data_model } from '../model/pika_searching_data_model';
import { labelAssembler } from 'cc';
import { Label } from 'cc';
import { pika_PS_setGame_lever } from './pika_PS_setGame_lever';
import { Color } from 'cc';
import { color } from 'cc';
import { TERRAIN_HEIGHT_BASE } from 'cc';
const { ccclass, property } = _decorator;
enum BlockType {
    BT_NONE,
    BT_STONE,
};
@ccclass('pika_PS_initPrefabs_icon')
export class pika_PS_initPrefabs_icon extends Component {
    @property(Prefab)
    private icon_prefab: Prefab = null;
    private arrayNode: number[] = [];
    private arrayNodeLenth: number = 14 * 10;
    private cot_number: number = 10;
    private hang_number: number = 14;
    private pos_pika_icon_origin: Vec3 = new Vec3(0, 0, 0);
    private distance_2_icon: number = 0;
    private distance_slit_2_icon: number = 4;
    public chess_properties: pika_chess_icon_properties[];
    public icon_width: number = 0;
    public icon_height: number = 0;
    private number_icon_list: number[][] = [];
    private glow_color: Color = Color.YELLOW;
    private set_game_lever: pika_PS_setGame_lever = null;
    startEvent() {

    }
    offEvent() {

    }
    onEnable() {
        this.startEvent();
    }
    onDisable() {
        this.offEvent();
    }

    init_pos_origin(pos_origin_node: Node, board_icon_1: number[][]) {
        this.pos_pika_icon_origin = pos_origin_node.getWorldPosition();
        let uiTransfroms_Icon = pos_origin_node.getComponent(UITransform);
        this.icon_height = uiTransfroms_Icon.contentSize.height;
        this.icon_width = uiTransfroms_Icon.contentSize.width;
        this.distance_2_icon = uiTransfroms_Icon.contentSize.width + this.distance_slit_2_icon;
        this.init_node(board_icon_1);
    }
    init_node(board_icon: number[][]) {
        this.node.removeAllChildren();
        this.arrayNode = [];
        this.number_icon_list = [];
        if (!this.chess_properties) {
            this.chess_properties = [];
        }
        for (let i = 0; i < this.arrayNodeLenth; i++) {
            this.arrayNode.push(BlockType.BT_STONE);
        }
        for (let i = 0; i < this.hang_number; i++) {
            for (let j = 0; j < this.cot_number; j++) {
                let k = i * this.cot_number + j;
                let block: Node = this.spawnBlockByType(this.arrayNode[k]);
                if (block) {
                    this.node.addChild(block);
                    block.addComponent(pika_PS_get_cot_hang_icon_chess);
                    let cot_hang_icon_chess = block.getComponent(pika_PS_get_cot_hang_icon_chess);
                    block.setWorldPosition(this.pos_pika_icon_origin.x + j * (this.distance_2_icon), this.pos_pika_icon_origin.y - i * (this.distance_2_icon), 0);
                    let img_icon_node = block.getChildByName('img_icon');
                    let img_pika_node = img_icon_node.getChildByName('img_pika');
                    img_pika_node.setScale(0.7, 0.7, 0.7);
                    let show_label = img_icon_node.getChildByName('number').getComponent(Label);
                    let sprite_icon = img_icon_node.getComponent(Sprite);
                    let sprite_pika = img_pika_node.getComponent(Sprite);
                    let sprite_Frame_pika = new SpriteFrame();
                    let sprite_Frame_bg_icon = new SpriteFrame();
                    let sprite_atlas_dirs = pika_Path.TEXTURE_ATLAS_ADD;
                    let sprite_atlas = VDScreenManager.instance.assetBundle.get(sprite_atlas_dirs, SpriteAtlas);
                    block.name = `${k}`;
                    if (board_icon[i][j] == -1) {
                        sprite_icon.spriteFrame = null;
                        sprite_pika.spriteFrame = null;
                        this.chess_properties[k] = {
                            name: block.name,
                            cot: j,
                            hang: i,
                            status_vanhdai: true,
                            status_icon: false,
                            pos_X: block.getWorldPosition().x,
                            pos_Y: block.getWorldPosition().y,
                            width: this.icon_width,
                            height: this.icon_height,
                            hollow: false,
                            moving_status: ICON_MOVING_STATUS.NO_STATUS,
                            movingNext_status: MOVINGNEXT_STATUS.NO_STATUS,
                        };
                        cot_hang_icon_chess.set_properties_icon(this.chess_properties[k]);
                        // show_label.string = `${board_icon[i][j]}`;
                    } else {
                        let spriteFrame_namePika = 'img_pika_' + `${board_icon[i][j] + 1}`;
                        let spriteFrame_nameBG = 'img_bgIconPress';
                        sprite_Frame_pika = sprite_atlas.getSpriteFrame(spriteFrame_namePika);
                        sprite_Frame_bg_icon = sprite_atlas.getSpriteFrame(spriteFrame_nameBG);
                        sprite_pika.spriteFrame = sprite_Frame_pika;
                        sprite_icon.spriteFrame = sprite_Frame_bg_icon;
                        this.chess_properties[k] = {
                            name: block.name,
                            cot: j,
                            hang: i,
                            status_vanhdai: false,
                            status_icon: true,
                            pos_X: block.getWorldPosition().x,
                            pos_Y: block.getWorldPosition().y,
                            width: this.icon_width,
                            height: this.icon_height,
                            hollow: false,
                            moving_status: ICON_MOVING_STATUS.NO_STATUS,
                            movingNext_status: MOVINGNEXT_STATUS.NO_STATUS,
                        }
                        cot_hang_icon_chess.set_properties_icon(this.chess_properties[k]);
                        // show_label.string = `${board_icon[i][j]}`;
                    }
                }
            }
        }
        this.set_game_lever = this.node.getComponent(pika_PS_setGame_lever);
        this.set_game_lever.get_chess_properties(this.chess_properties, this.icon_width, this.icon_height, this.pos_pika_icon_origin, this.distance_2_icon);
    }
    spawnBlockByType(type: BlockType) {
        if (!this.icon_prefab) {
            return null;
        }
        let block: Node | null = null;
        switch (type) {
            case BlockType.BT_STONE:
                {
                    block = instantiate(this.icon_prefab);
                    break;
                }
        }
        return block;
    }
    get_icon_node_player(icon_number: number): Vec2 {
        let childs = this.node.children;
        let icon_v2: Vec2;
        for (let i = 0; i < childs.length; i++) {
            if (childs[i].name == `${icon_number}`) {
                icon_v2 = new Vec2(childs[i].getWorldPosition().x, childs[i].getWorldPosition().y);
                return icon_v2;
            }
        }
    }
    get_icon_node_opp(icon_number: number): Vec2 {
        let childs = this.node.children;
        let icon_v2: Vec2;
        for (let i = 0; i < childs.length; i++) {
            if (childs[i].name == `${icon_number}`) {
                icon_v2 = new Vec2(childs[i].getWorldPosition().x, childs[i].getWorldPosition().y);
                return icon_v2;
            }
        }
    }
    set_hint_pick(A: Vec2, B: Vec2) {
        let childs = this.node.children;
        for (let i = 0; i < this.hang_number; i++) {
            for (let j = 0; j < this.cot_number; j++) {
                let k = i * this.cot_number + j;
                if (i == A.x && j == A.y || i == B.x && j == B.y) {
                    let sprite_icon = childs[k].getComponent(Sprite);
                    sprite_icon.color = this.glow_color;
                    tween(childs[k])
                        .to(0.2, { scale: new Vec3(1.5, 1.5, 1.5) })
                        .to(0.2, { scale: new Vec3(1.0, 1.0, 1.0) })
                        .union()
                        .repeat(5)
                        .start();
                }
            }
        }
    }

}
