
import { _decorator, Component, Node, instantiate, Vec3, UITransform, Sprite, SpriteFrame, SpriteAtlas, tween, log, Vec2, labelAssembler, Label, Prefab, spriteAssembler } from 'cc';
import { MOVINGNEXT_STATUS, ICON_MOVING_STATUS, ICON_OLD_NEW_STATUS, IN_OUT_SWAP_ICON_STATUS, UPNEXT_STATUS, pika_Path, pika_chess_icon_properties, MONITER_STATUS } from '../common/pika_Define';
import VDScreenManager from '../../../../vd-framework/ui/VDScreenManager';
import { pika_Director } from '../core/pika_Director';
import { pika_PS_get_cot_hang_icon_chess } from './pika_PS_get_cot_hang_icon_chess';
import { pika_GAME_STATE_EVENT } from '../network/pika_NetworkDefine';
import { VDEventListener } from '../../../../vd-framework/common/VDEventListener';
import { pika_board_icon_dataModel, pika_pickChess_dataModel } from '../model/pika_play_data_model';
import { pika_searchingOpp_data_model } from '../model/pika_searching_data_model';
import { pika_PS_initPrefabs_icon } from './pika_PS_initPrefabs_icon';
import { pika_playScreen } from '../screens/pika_playScreen';
import { pika_PS_centerGroup } from './pika_PS_centerGroup';
const { ccclass, property } = _decorator;

@ccclass('pika_PS_setGame_lever')
export class pika_PS_setGame_lever extends Component {
    private OP_searching_opp_dataModel: pika_searchingOpp_data_model = null;
    private OP_pick_iconData: pika_pickChess_dataModel = null;
    public chess_properties: pika_chess_icon_properties[];
    private cot_number: number = 10;
    private hang_number: number = 14;
    private OP_board_icon_data: any = [];
    public icon_width: number = 0;
    public icon_height: number = 0;
    private pos_icon_org: Vec3 = new Vec3(0, 0, 0);
    private distance_2_icon: number = 0;
    public emit_data_icon_properties: pika_chess_icon_properties = null;
    private UIsawpIcon_status_player: IN_OUT_SWAP_ICON_STATUS = IN_OUT_SWAP_ICON_STATUS.NO_STATUS;
    private UIsawpIcon_status_opp: IN_OUT_SWAP_ICON_STATUS = IN_OUT_SWAP_ICON_STATUS.NO_STATUS;
    private moniter_status: MONITER_STATUS = MONITER_STATUS.NO_STATUS;
    private pos_moniter: Vec2 = new Vec2(0, 0);
    private count_moniter_moving_down: number = 0;
    private count_moniter_moving_up: number = 0;
    private bg_icon_white: string = 'img_bgIconPress';
    private bg_icon_yellow: string = 'img_bgIcon';

    startEvent() {
        VDEventListener.on(pika_GAME_STATE_EVENT.ICON_MOVING_END, this.show_update.bind(this));
        VDEventListener.on(pika_GAME_STATE_EVENT.ICON_CHESS_PROPERTIES_1, this.get_properties_icon_chess, this);
    }

    offEvent() {
        VDEventListener.off(pika_GAME_STATE_EVENT.ICON_MOVING_END, this.show_update.bind(this));
        VDEventListener.off(pika_GAME_STATE_EVENT.ICON_CHESS_PROPERTIES_1, this.get_properties_icon_chess, this);
    }

    onEnable() {
        this.startEvent();
    }

    onDisable() {
        this.offEvent();
    }
    get_properties_icon_chess(properties_icon: pika_chess_icon_properties) {
        this.emit_data_icon_properties = properties_icon;
        VDEventListener.dispatchEvent(pika_GAME_STATE_EVENT.ICON_CHESS_PROPERTIES_2, this.emit_data_icon_properties);
    }
    set_pos_monitor(hang_start: number, cot_start: number) {
        this.pos_moniter = new Vec2(hang_start, cot_start);
        this.moniter_status = MONITER_STATUS.MONITER_START;
    }
    get_moniterStatusEnd(): Vec2 {
        this.moniter_status = MONITER_STATUS.MONOTER_END;
        return this.pos_moniter;
    }
    get_chess_properties(chessProperties: pika_chess_icon_properties[], icon_W: number, icon_H: number, pos_org_icon: Vec3, distance_icon: number) {
        this.chess_properties = chessProperties;
        this.icon_width = icon_W;
        this.icon_height = icon_H;
        this.pos_icon_org = pos_org_icon;
        this.distance_2_icon = distance_icon;
    }

    clear_icon_node(icon_number_1: number, icon_number_2: number) {
        this.count_moniter_moving_down = 0;
        this.count_moniter_moving_up = 0;
        let childs = this.node.children;
        this.OP_searching_opp_dataModel = pika_Director.instance.OP_searching_OPP_data_model;
        let properties_icon_1 = this.chess_properties[icon_number_1];
        let properties_icon_2 = this.chess_properties[icon_number_2];
        for (let i = 0; i < this.hang_number; i++) {
            for (let j = 0; j < this.cot_number; j++) {
                let k = i * this.cot_number + j;
                if (k == icon_number_1 || k == icon_number_2) {
                    let img_icon_node = childs[k].getChildByName('img_icon');
                    let img_pika_node = img_icon_node.getChildByName('img_pika');
                    let sprite_img_icon = img_icon_node.getComponent(Sprite);
                    let sprite_img_pika = img_pika_node.getComponent(Sprite);
                    sprite_img_icon.spriteFrame = null;
                    sprite_img_pika.spriteFrame = null;
                    this.chess_properties[k + 1].hollow = true;
                    childs[k].getComponent(pika_PS_get_cot_hang_icon_chess).set_properties_icon(this.chess_properties[k + 1]);
                }
            }
        }
        if (this.OP_searching_opp_dataModel.h == 1) {
            this.set_gameLever_nomal(properties_icon_1, properties_icon_2);
        }
        else if (this.OP_searching_opp_dataModel.h == 2) {
            this.set_gameLever_hard(properties_icon_1, properties_icon_2);
        }
    }
    get_board_icon(board_icon_data: number[][]) {
        let arr = [];
        if (this.OP_board_icon_data) {
            this.OP_board_icon_data = [];
        }
        for (let i = 0; i < this.hang_number; i++) {
            var row = [];
            for (let j = 0; j < this.cot_number; j++) {
                row.push(board_icon_data[i][j])
            }
            this.OP_board_icon_data.push(row);
        }
    }
    update_new_board(icon_number_1: number, icon_number_2: number) {
        let childs = this.node.children;
        let pos_icon1: Vec2;
        let pos_icon2: Vec2;
        this.OP_searching_opp_dataModel = pika_Director.instance.OP_searching_OPP_data_model;
        for (let i = 0; i < this.hang_number; i++) {
            for (let j = 0; j < this.cot_number; j++) {
                let k = i * this.cot_number + j;
                if (childs[k].name == `${icon_number_1}`) {
                    this.OP_board_icon_data[i][j] = -1;
                    pos_icon1 = new Vec2(i, j);
                }
                else if (childs[k].name == `${icon_number_2}`) {
                    this.OP_board_icon_data[i][j] = -1;
                    pos_icon2 = new Vec2(i, j);
                }
            }
        }
        if (this.OP_searching_opp_dataModel.h == 0) {
            this.show_update(pos_icon1.y);
            this.show_update(pos_icon2.y);
        }
        else if (this.OP_searching_opp_dataModel.h == 1) {
            this.swap_board_icon_lever_nomal(pos_icon1, pos_icon2);
        }
        else if (this.OP_searching_opp_dataModel.h == 2) {
            this.swap_board_icon_lever_hard(pos_icon1, pos_icon2)
        }
        // this.show_label_icon();
    }

    swap_board_icon_lever_nomal(pos_icon1: Vec2, pos_icon2: Vec2) {
        let icon_swap: number;
        if (pos_icon1.y != pos_icon2.y) {
            for (let i = this.hang_number - 2; i > 0; i--) {
                for (let j = this.cot_number - 2; j > 0; j--) {
                    if (this.OP_board_icon_data[i][j] == -1) {
                        this.swap_board_icon_down(i, j);
                    }
                }
            }
        }
        else if (pos_icon1.y == pos_icon2.y) {
            for (let n = 0; n < 2; n++) {
                for (let i = this.hang_number - 2; i > 0; i--) {
                    for (let j = this.cot_number - 2; j > 0; j--) {
                        if (this.OP_board_icon_data[i][j] == -1) {
                            this.swap_board_icon_down(i, j);
                        }
                    }
                }
            }
        }
    }

    swap_board_icon_lever_hard(pos_icon1: Vec2, pos_icon2: Vec2) {
        let icon_swap: number;
        if (pos_icon1.y != pos_icon2.y) {
            for (let i = this.hang_number - 2; i > 0; i--) {
                for (let j = this.cot_number - 2; j > 0; j--) {
                    if (j % 2 != 0) {
                        if (this.OP_board_icon_data[i][j] == -1) {
                            this.swap_board_icon_down(i, j);
                        }
                    }
                }
            }
            for (let i = 1; i < this.hang_number - 1; i++) {
                for (let j = 1; j < this.cot_number - 1; j++) {
                    if (j % 2 == 0) {
                        if (this.OP_board_icon_data[i][j] == -1) {
                            this.swap_board_icon_up(i, j);
                        }
                    }
                }
            }
        }
        else if (pos_icon1.y == pos_icon2.y) {
            for (let n = 0; n < 2; n++) {
                for (let i = this.hang_number - 2; i > 0; i--) {
                    for (let j = this.cot_number - 2; j > 0; j--) {
                        if (j % 2 != 0) {
                            if (this.OP_board_icon_data[i][j] == -1) {
                                this.swap_board_icon_down(i, j);
                            }
                        }
                    }
                }
            }
            for (let n = 0; n < 2; n++) {
                for (let i = 1; i < this.hang_number - 1; i++) {
                    for (let j = 1; j < this.cot_number - 1; j++) {
                        if (j % 2 == 0) {
                            if (this.OP_board_icon_data[i][j] == -1) {
                                this.swap_board_icon_up(i, j);
                            }
                        }
                    }
                }
            }
        }
    }
    swap_board_icon_down(icon_hang: number, icon_cot: number) {
        let icon_swap: number;
        icon_swap = this.OP_board_icon_data[icon_hang][icon_cot];
        this.OP_board_icon_data[icon_hang][icon_cot] = this.OP_board_icon_data[icon_hang - 1][icon_cot];
        this.OP_board_icon_data[icon_hang - 1][icon_cot] = icon_swap;
    }
    swap_board_icon_up(icon_hang: number, icon_cot: number) {
        let icon_swap: number;
        icon_swap = this.OP_board_icon_data[icon_hang][icon_cot];
        this.OP_board_icon_data[icon_hang][icon_cot] = this.OP_board_icon_data[icon_hang + 1][icon_cot];
        this.OP_board_icon_data[icon_hang + 1][icon_cot] = icon_swap;
    }
    show_update(cot_index: number) {
        let childs = this.node.children;
        let sprite_frame_iconBG = new SpriteFrame;
        let sprite_frame_imgPika = new SpriteFrame;
        let sprite_icon_add = pika_Path.TEXTURE_ATLAS_ADD;
        let sprite_atlas = VDScreenManager.instance.assetBundle.get(sprite_icon_add, SpriteAtlas);
        for (let i = 0; i < this.hang_number; i++) {
            for (let j = 0; j < this.cot_number; j++) {
                let k = i * this.cot_number + j;
                if (childs[k]) {
                    let PS_get_cot_hang_icon_chess = childs[k].getComponent(pika_PS_get_cot_hang_icon_chess);
                    let img_icon_node = childs[k].getChildByName('img_icon');
                    let img_icon_pika = img_icon_node.getChildByName('img_pika');
                    let sprite_img_icon = img_icon_node.getComponent(Sprite);
                    let sprite_img_pika = img_icon_pika.getComponent(Sprite);
                    let show_number = img_icon_node.getChildByName('number');
                    let label_showNumber = show_number.getComponent(Label);
                    img_icon_pika.setScale(0.7, 0.7, 0.7);
                    if (j == cot_index) {
                        childs[k].setWorldPosition(this.pos_icon_org.x + j * (this.distance_2_icon), this.pos_icon_org.y - i * (this.distance_2_icon), 0)
                        if (this.OP_board_icon_data[i][j] == -1) {

                            sprite_img_icon.spriteFrame = null;
                            sprite_img_pika.spriteFrame = null;
                            this.chess_properties[k] = {
                                name: childs[k].name,
                                cot: j,
                                hang: i,
                                status_vanhdai: true,
                                status_icon: false,
                                pos_X: childs[k].getWorldPosition().x,
                                pos_Y: childs[k].getWorldPosition().y,
                                width: this.icon_width,
                                height: this.icon_height,
                                hollow: false,
                                moving_status: ICON_MOVING_STATUS.NO_STATUS,
                                movingNext_status: MOVINGNEXT_STATUS.NO_STATUS,
                            };
                            PS_get_cot_hang_icon_chess.set_properties_icon(this.chess_properties[k]);
                            // label_showNumber.string = this.chess_properties[k].name;
                        } else {
                            let icon_name_pika = 'img_pika_' + `${this.OP_board_icon_data[i][j] + 1}`;
                            let icon_name_BGIcon = this.bg_icon_white;
                            sprite_frame_imgPika = sprite_atlas.getSpriteFrame(icon_name_pika);
                            sprite_frame_iconBG = sprite_atlas.getSpriteFrame(icon_name_BGIcon);
                            sprite_img_pika.spriteFrame = sprite_frame_imgPika;
                            sprite_img_icon.spriteFrame = sprite_frame_iconBG;
                            this.chess_properties[k] = {
                                name: childs[k].name,
                                cot: j,
                                hang: i,
                                status_vanhdai: false,
                                status_icon: true,
                                pos_X: childs[k].getWorldPosition().x,
                                pos_Y: childs[k].getWorldPosition().y,
                                width: this.icon_width,
                                height: this.icon_height,
                                hollow: false,
                                moving_status: ICON_MOVING_STATUS.NO_STATUS,
                                movingNext_status: MOVINGNEXT_STATUS.NO_STATUS,
                            }
                            PS_get_cot_hang_icon_chess.set_properties_icon(this.chess_properties[k]);
                            // label_showNumber.string = this.chess_properties[k].name;
                        }
                    }
                }
            }
        }
        if (pika_Director.instance.OP_pickChess_data_model) {
            this.OP_pick_iconData = pika_Director.instance.OP_pickChess_data_model;
        }
        if (this.OP_pick_iconData.isSelf) {
            this.UIsawpIcon_status_player = IN_OUT_SWAP_ICON_STATUS.OUT_SWAP_ICON;
            VDEventListener.dispatchEvent(pika_GAME_STATE_EVENT.IN_OUT_SWAP_ICON, this.UIsawpIcon_status_player);
        } else {
            this.UIsawpIcon_status_opp = IN_OUT_SWAP_ICON_STATUS.OUT_SWAP_ICON;
            VDEventListener.dispatchEvent(pika_GAME_STATE_EVENT.IN_OUT_SWAP_ICON, this.UIsawpIcon_status_opp);
        }
    }

    show_label_icon() {
        let childs = this.node.children;
        this.OP_searching_opp_dataModel = pika_Director.instance.OP_searching_OPP_data_model;
        for (let i = 0; i < this.hang_number; i++) {
            for (let j = 0; j < this.cot_number; j++) {
                let k = i * this.cot_number + j;
                let show_label_node = childs[k].getChildByPath('img_icon/number');
                let label_icon = show_label_node.getComponent(Label);
                label_icon.string = `${this.OP_board_icon_data[i][j]}`;
            }
        }
    }

    clear_label_icon(hang: number, cot: number) {
        let childs = this.node.children;
        this.OP_searching_opp_dataModel = pika_Director.instance.OP_searching_OPP_data_model;
        for (let i = 0; i < this.hang_number; i++) {
            for (let j = 0; j < this.cot_number; j++) {
                let k = i * this.cot_number + j;
                if (i == hang && j == cot) {
                    let show_label_node = childs[k].getChildByPath('img_icon/number');
                    let label_icon = show_label_node.getComponent(Label);
                    label_icon.string = " ";
                }
            }
        }
    }

    set_prorerties_new_oid_icon(number_1_old: number, number_2_old: number) {
        let childs = this.node.children;
        for (let i = 1; i < this.hang_number - 1; i++) {
            for (let j = 1; j < this.hang_number - 1; j++) {
                let k = i * this.cot_number + j;
                if (childs[k].name == `${number_1_old}` || childs[k].name == `${number_2_old}`) {
                    let properties_icon = childs[k].getComponent(pika_PS_get_cot_hang_icon_chess);
                    properties_icon.oid_new_status = ICON_OLD_NEW_STATUS.OLD;
                }
            }
        }
    }

    get_icon_index_new(): number[] {
        let childs = this.node.children;
        let icon_index: number[] = [];
        for (let i = 1; i < this.hang_number - 1; i++) {
            for (let j = 1; j < this.hang_number - 1; j++) {
                let k = i * this.cot_number + j;
                let properties_icon = childs[k].getComponent(pika_PS_get_cot_hang_icon_chess);
                if (properties_icon.oid_new_status == ICON_OLD_NEW_STATUS.OLD) {
                    icon_index.push[k];
                    properties_icon.oid_new_status = ICON_OLD_NEW_STATUS.NO_STATUS;
                }
            }
        }
        return icon_index;
    }
    swap_icon_bg(index_icon_clear: number, index_icon_select: number) {
        let childs = this.node.children;
        for (let i = 0; i < this.hang_number; i++) {
            for (let j = 0; j < this.cot_number; j++) {
                let k = i * this.cot_number + j;
                let icon_manager = childs[k].getComponent(pika_PS_get_cot_hang_icon_chess);
                let icon_BG_node = childs[k].getChildByName('img_icon');
                let sprite_iconBG = icon_BG_node.getComponent(Sprite);
                if (this.OP_board_icon_data[i][j] != -1) {
                    if (k == index_icon_clear) {
                        icon_manager.set_BG_icon(this.bg_icon_white);
                    }
                    if (k == index_icon_select) {
                        icon_manager.set_BG_icon(this.bg_icon_yellow);
                    }
                } else {
                    sprite_iconBG.spriteFrame = null;
                }
            }
        }
    }
    set_gameLever_nomal(properties_icon_1: pika_chess_icon_properties, properties_icon_2: pika_chess_icon_properties) {
        if (pika_Director.instance.OP_pickChess_data_model) {
            this.OP_pick_iconData = pika_Director.instance.OP_pickChess_data_model;
        }
        var childs = this.node.children;
        for (let i = 1; i < this.hang_number - 1; i++) {
            for (let j = 1; j < this.cot_number - 1; j++) {
                let k = i * this.cot_number + j;
                let icon_properties = childs[k].getComponent(pika_PS_get_cot_hang_icon_chess);
                if (properties_icon_1.cot != properties_icon_2.cot) {
                    if (j == properties_icon_1.cot && i <= properties_icon_1.hang) {
                        this.set_icon_downNext(icon_properties, 1);
                        this.set_icon_movingDown(icon_properties, 1, k);
                        this.update_moniter_icon_down(i, j, 1);
                    }

                    else if (j == properties_icon_2.cot && i <= properties_icon_2.hang) {
                        this.set_icon_downNext(icon_properties, 1);
                        this.set_icon_movingDown(icon_properties, 1, k);
                        this.update_moniter_icon_down(i, j, 1);
                    }
                }
                else if (properties_icon_1.cot == properties_icon_2.cot) {
                    if (properties_icon_1.hang == properties_icon_2.hang + 1) {
                        if (i < properties_icon_2.hang && j == properties_icon_1.cot) {
                            this.set_icon_downNext(icon_properties, 2);
                            this.set_icon_movingDown(icon_properties, 2, k);
                            this.update_moniter_icon_down(i, j, 2);
                        }
                    }
                    else if (properties_icon_2.hang == properties_icon_1.hang + 1) {
                        if (i < properties_icon_1.hang && j == properties_icon_1.cot) {
                            this.set_icon_downNext(icon_properties, 2);
                            this.set_icon_movingDown(icon_properties, 2, k);
                            this.update_moniter_icon_down(i, j, 2);
                        }
                    }
                    else if (properties_icon_2.hang > properties_icon_1.hang + 1) {
                        if (i > properties_icon_1.hang && i < properties_icon_2.hang && j == properties_icon_1.cot) {
                            this.set_icon_downNext(icon_properties, 1);
                            this.set_icon_movingDown(icon_properties, 1, k);
                            this.update_moniter_icon_down(i, j, 1);
                        }
                        else if (i < properties_icon_1.hang && j == properties_icon_1.cot) {
                            this.set_icon_downNext(icon_properties, 2);
                            this.set_icon_movingDown(icon_properties, 2, k);
                            this.update_moniter_icon_down(i, j, 2);
                        }
                    }
                    else if (properties_icon_1.hang > properties_icon_2.hang + 1) {
                        if (i > properties_icon_2.hang && i < properties_icon_1.hang && j == properties_icon_1.cot) {
                            this.set_icon_downNext(icon_properties, 1);
                            this.set_icon_movingDown(icon_properties, 1, k);
                            this.update_moniter_icon_down(i, j, 1);
                        }
                        else if (i < properties_icon_2.hang && j == properties_icon_1.cot) {
                            this.set_icon_downNext(icon_properties, 2);
                            this.set_icon_movingDown(icon_properties, 2, k);
                            this.update_moniter_icon_down(i, j, 2);
                        }
                    }
                }
            }
        }
    }

    set_gameLever_hard(properties_icon_1: pika_chess_icon_properties, properties_icon_2: pika_chess_icon_properties) {
        let childs = this.node.children;
        for (let i = 1; i < this.hang_number - 1; i++) {
            for (let j = 1; j < this.cot_number - 1; j++) {
                let k = i * this.cot_number + j;
                let icon_properties = childs[k].getComponent(pika_PS_get_cot_hang_icon_chess);
                if (properties_icon_1.cot % 2 != 0 && properties_icon_2.cot % 2 != 0) {
                    if (j % 2 != 0) {
                        if (properties_icon_1.cot != properties_icon_2.cot) {
                            if (j == properties_icon_1.cot && i <= properties_icon_1.hang) {
                                this.set_icon_downNext(icon_properties, 1);
                                this.set_icon_movingDown(icon_properties, 1, k);
                                this.update_moniter_icon_down(i, j, 1);
                            }
                            else if (j == properties_icon_2.cot && i <= properties_icon_2.hang) {
                                this.set_icon_downNext(icon_properties, 1);
                                this.set_icon_movingDown(icon_properties, 1, k);
                                this.update_moniter_icon_down(i, j, 1);
                            }
                        }
                        else if (properties_icon_1.cot == properties_icon_2.cot) {
                            if (properties_icon_1.hang == properties_icon_2.hang + 1) {
                                if (i < properties_icon_2.hang && j == properties_icon_1.cot) {
                                    this.set_icon_downNext(icon_properties, 2);
                                    this.set_icon_movingDown(icon_properties, 2, k);
                                    this.update_moniter_icon_down(i, j, 2);
                                }
                            }
                            else if (properties_icon_2.hang == properties_icon_1.hang + 1) {
                                if (i < properties_icon_1.hang && j == properties_icon_1.cot) {
                                    this.set_icon_downNext(icon_properties, 2);
                                    this.set_icon_movingDown(icon_properties, 2, k);
                                    this.update_moniter_icon_down(i, j, 2);
                                }
                            }
                            else if (properties_icon_2.hang > properties_icon_1.hang + 1) {
                                if (i > properties_icon_1.hang && i < properties_icon_2.hang && j == properties_icon_1.cot) {
                                    this.set_icon_downNext(icon_properties, 1);
                                    this.set_icon_movingDown(icon_properties, 1, k);
                                    this.update_moniter_icon_down(i, j, 1);
                                }
                                else if (i < properties_icon_1.hang && j == properties_icon_1.cot) {
                                    this.set_icon_downNext(icon_properties, 2);
                                    this.set_icon_movingDown(icon_properties, 2, k);
                                    this.update_moniter_icon_down(i, j, 2);
                                }
                            }
                            else if (properties_icon_1.hang > properties_icon_2.hang + 1) {
                                if (i > properties_icon_2.hang && i < properties_icon_1.hang && j == properties_icon_1.cot) {
                                    this.set_icon_downNext(icon_properties, 1);
                                    this.set_icon_movingDown(icon_properties, 1, k);
                                    this.update_moniter_icon_down(i, j, 1);
                                }
                                else if (i < properties_icon_2.hang && j == properties_icon_1.cot) {
                                    this.set_icon_downNext(icon_properties, 2);
                                    this.set_icon_movingDown(icon_properties, 2, k);
                                    this.update_moniter_icon_down(i, j, 2);
                                }
                            }
                        }
                    }
                }
                else if (properties_icon_1.cot % 2 == 0 && properties_icon_2.cot % 2 == 0) {
                    if (j % 2 == 0) {
                        if (properties_icon_1.cot != properties_icon_2.cot) {
                            if (j == properties_icon_1.cot && i >= properties_icon_1.hang) {
                                this.set_icon_upNext(icon_properties, 1);
                                this.set_icon_movingUp(icon_properties, 1, k);
                                this.update_moniter_icon_up(i, j, 1);
                            }
                            else if (j == properties_icon_2.cot && i >= properties_icon_2.hang) {
                                this.set_icon_upNext(icon_properties, 1);
                                this.set_icon_movingUp(icon_properties, 1, k);
                                this.update_moniter_icon_up(i, j, 1);
                            }
                        }
                        else if (properties_icon_1.cot == properties_icon_2.cot) {
                            if (properties_icon_1.hang == properties_icon_2.hang + 1) {
                                if (i > properties_icon_1.hang && j == properties_icon_1.cot) {
                                    this.set_icon_upNext(icon_properties, 2);
                                    this.set_icon_movingUp(icon_properties, 2, k);
                                    this.update_moniter_icon_up(i, j, 2);
                                }
                            }
                            else if (properties_icon_2.hang == properties_icon_1.hang + 1) {
                                if (i > properties_icon_2.hang && j == properties_icon_1.cot) {
                                    this.set_icon_upNext(icon_properties, 2);
                                    this.set_icon_movingUp(icon_properties, 2, k);
                                    this.update_moniter_icon_up(i, j, 2);
                                }
                            }
                            else if (properties_icon_2.hang > properties_icon_1.hang + 1) {
                                if (i > properties_icon_1.hang && i < properties_icon_2.hang && j == properties_icon_1.cot) {
                                    this.set_icon_upNext(icon_properties, 1);
                                    this.set_icon_movingUp(icon_properties, 1, k);
                                    this.update_moniter_icon_up(i, j, 1);
                                }
                                else if (i > properties_icon_2.hang && j == properties_icon_1.cot) {
                                    this.set_icon_upNext(icon_properties, 2);
                                    this.set_icon_movingUp(icon_properties, 2, k);
                                    this.update_moniter_icon_up(i, j, 2);
                                }
                            }
                            else if (properties_icon_1.hang > properties_icon_2.hang + 1) {
                                if (i > properties_icon_2.hang && i < properties_icon_1.hang && j == properties_icon_1.cot) {
                                    this.set_icon_upNext(icon_properties, 1);
                                    this.set_icon_movingUp(icon_properties, 1, k);
                                    this.update_moniter_icon_up(i, j, 1);
                                }
                                else if (i > properties_icon_1.hang && j == properties_icon_1.cot) {
                                    this.set_icon_upNext(icon_properties, 2);
                                    this.set_icon_movingUp(icon_properties, 2, k);
                                    this.update_moniter_icon_up(i, j, 2);
                                }
                            }
                        }
                    }
                }
                else if (properties_icon_1.cot % 2 == 0 && properties_icon_2.cot % 2 != 0) {
                    if (j % 2 != 0) {
                        if (j == properties_icon_2.cot && i <= properties_icon_2.hang) {
                            this.set_icon_downNext(icon_properties, 1);
                            this.set_icon_movingDown(icon_properties, 1, k);
                            this.update_moniter_icon_down(i, j, 1);
                        }
                    }
                    if (j % 2 == 0) {
                        if (j == properties_icon_1.cot && i >= properties_icon_1.hang) {
                            this.set_icon_upNext(icon_properties, 1);
                            this.set_icon_movingUp(icon_properties, 1, k);
                            this.update_moniter_icon_up(i, j, 1);
                        }
                    }
                }
                else if (properties_icon_1.cot % 2 != 0 && properties_icon_2.cot % 2 == 0) {
                    if (j % 2 != 0) {
                        if (j == properties_icon_1.cot && i <= properties_icon_1.hang) {
                            this.set_icon_downNext(icon_properties, 1);
                            this.set_icon_movingDown(icon_properties, 1, k);
                            this.update_moniter_icon_down(i, j, 1);
                        }
                    }
                    if (j % 2 == 0) {
                        if (j == properties_icon_2.cot && i >= properties_icon_2.hang) {
                            this.set_icon_upNext(icon_properties, 1);
                            this.set_icon_movingUp(icon_properties, 1, k);
                            this.update_moniter_icon_up(i, j, 1);
                        }
                    }
                }
            }
        }
    }
    update_moniter_icon_down(hang: number, cot: number, updateNumber: number) {
        if (this.moniter_status == MONITER_STATUS.MONITER_START && hang < 12) {
            if (this.pos_moniter.y == cot && this.pos_moniter.x == hang) {
                this.count_moniter_moving_down = this.count_moniter_moving_down + 1;
                if (this.count_moniter_moving_down == 1) {
                    this.pos_moniter.x = this.pos_moniter.x + updateNumber;
                }
            }
        }
    }
    update_moniter_icon_up(hang: number, cot: number, updateNumber: number) {
        if (this.moniter_status == MONITER_STATUS.MONITER_START && hang > 1) {
            if (this.pos_moniter.y == cot && this.pos_moniter.x == hang) {
                this.count_moniter_moving_up = this.count_moniter_moving_up + 1;
                if (this.count_moniter_moving_up == 1) {
                    this.pos_moniter.x = this.pos_moniter.x - updateNumber;
                }
            }
        }
    }
    set_icon_movingUp(icon_properties: pika_PS_get_cot_hang_icon_chess, count_up: number, icon_index: number) {
        let childs = this.node.children;
        if (icon_properties.chess_properties.moving_status == ICON_MOVING_STATUS.NO_STATUS) {
            childs[icon_index].getComponent(pika_PS_get_cot_hang_icon_chess).chess_properties.moving_status = ICON_MOVING_STATUS.MOVING_UP;
            childs[icon_index].getComponent(pika_PS_get_cot_hang_icon_chess).count_up = count_up;
            this.icon_moving(icon_index);
        }
    }
    set_icon_movingDown(icon_properties: pika_PS_get_cot_hang_icon_chess, count_down: number, icon_index: number) {
        let childs = this.node.children;
        if (icon_properties.chess_properties.moving_status == ICON_MOVING_STATUS.NO_STATUS) {
            childs[icon_index].getComponent(pika_PS_get_cot_hang_icon_chess).chess_properties.moving_status = ICON_MOVING_STATUS.MOVING_DOWN;
            childs[icon_index].getComponent(pika_PS_get_cot_hang_icon_chess).count_down = count_down;
            this.icon_moving(icon_index);
        }
    }
    set_icon_downNext(icon_properties: pika_PS_get_cot_hang_icon_chess, count_downNext: number) {
        if (icon_properties.chess_properties.moving_status == ICON_MOVING_STATUS.MOVING_DOWN) {
            icon_properties.chess_properties.movingNext_status = MOVINGNEXT_STATUS.DOWN_NEXT;
            icon_properties.count_downNext = count_downNext;
        }
    }
    set_icon_upNext(icon_properties: pika_PS_get_cot_hang_icon_chess, count_upNext: number) {
        if (icon_properties.chess_properties.moving_status == ICON_MOVING_STATUS.MOVING_UP) {
            icon_properties.chess_properties.movingNext_status = MOVINGNEXT_STATUS.UP_NEXT;
            icon_properties.count_upNext = count_upNext;
        }
    }
    icon_moving(icon_index: number) {
        let childs = this.node.children;
        for (let i = 0; i < childs.length; i++) {
            if (i == icon_index) {
                let properties_icon = childs[i].getComponent(pika_PS_get_cot_hang_icon_chess);
                if (properties_icon.chess_properties.name == `${i}`) {
                    properties_icon.set_icon_moving();
                }
            }
        }
    }
}