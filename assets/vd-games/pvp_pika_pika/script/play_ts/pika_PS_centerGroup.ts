import { _decorator, Component, Node, SpriteFrame, SpriteAtlas } from 'cc';
import { pika_PS_starting_effect } from './pika_PS_starting_effect';
import { pika_PS_initPrefabs_icon } from './pika_PS_initPrefabs_icon';
import { pika_CommandID_IP, pika_GAME_STATE_EVENT } from '../network/pika_NetworkDefine';
import { Vec3 } from 'cc';
import { UITransform } from 'cc';
import { Sprite } from 'cc';
import { spriteAssembler } from 'cc';
import { Button } from 'cc';
import { DELAY_SET_ICON_STATUS, IN_OUT_SWAP_ICON_STATUS, PICK_ICON_STATUS, PIKA_SEND_PICK_ICON_TOSEVER_STATE, pika_Path } from '../common/pika_Define';
import VDScreenManager from '../../../../vd-framework/ui/VDScreenManager';
import { VDEventListener } from '../../../../vd-framework/common/VDEventListener';
import { pika_chess_icon_properties } from '../common/pika_Define';
import { pika_pickChess_inputData_toSever } from '../model/pika_input_to_sever_data';
import { pika_searchingOpp_data_model } from '../model/pika_searching_data_model';
import { pika_Director } from '../core/pika_Director';
import { Vec2 } from 'cc';
import { pika_PS_draw_line_icon } from './pika_PS_draw_line_icon';
import { tween } from 'cc';
import { Graphics } from 'cc';
import { pika_board_icon_dataModel, pika_pickChess_dataModel } from '../model/pika_play_data_model';
import { pika_PS_setGame_lever } from './pika_PS_setGame_lever';
const { ccclass, property } = _decorator;

@ccclass('pika_PS_centerGroup')
export class pika_PS_centerGroup extends Component {
    @property(Node)
    draw_node_player: Node = null;
    @property(Node)
    draw_node_opp: Node = null;
    @property(pika_PS_starting_effect)
    start_group: pika_PS_starting_effect = null;
    @property(pika_PS_initPrefabs_icon)
    init_icon_prefab: pika_PS_initPrefabs_icon = null;
    @property(pika_PS_setGame_lever)
    set_game_lever_player: pika_PS_setGame_lever = null;
    @property(pika_PS_setGame_lever)
    set_game_lever_opp: pika_PS_setGame_lever = null;
    private pika_icon_parent: Node = null;
    private pika_icon_child: Node;
    private cot_number: number = 10;
    private hang_number: number = 14;
    private pos_pika_icon_origin: Vec3 = new Vec3(0, 0, 0);
    private distance_2_icon: number = 0;
    private distance_slit_2_icon: number = 4;
    private pos_icon_origin_Node: Node = null;
    public emit_data_icon_properties_1: pika_chess_icon_properties = null;
    public emit_data_icon_properties_2: pika_chess_icon_properties = null;
    private send_pick_toSever_status: PIKA_SEND_PICK_ICON_TOSEVER_STATE = PIKA_SEND_PICK_ICON_TOSEVER_STATE.NO_STATE;
    private count_sendData_icon_properties: number = 0;
    private IP_pika_pickchess_toSever: pika_pickChess_inputData_toSever = null;
    private OP_pika_pickchess_dataModel: pika_pickChess_dataModel = null;
    private OP_searching_opp_data_model: pika_searchingOpp_data_model = null;
    private draw_line_icon_player: pika_PS_draw_line_icon = null;
    private draw_line_icon_opp: pika_PS_draw_line_icon = null;
    private pos_icon_info_pick_1: Vec2[];
    private pos_icon_info_pick_2: Vec2[];
    private icon_index_new: number[];
    private UIsawpIcon_status_player: IN_OUT_SWAP_ICON_STATUS = IN_OUT_SWAP_ICON_STATUS.NO_STATUS;
    private UIsawpIcon_status_opp: IN_OUT_SWAP_ICON_STATUS = IN_OUT_SWAP_ICON_STATUS.NO_STATUS;
    private pick_icon_status: PICK_ICON_STATUS = PICK_ICON_STATUS.NO_STATUS;

    startEvent() {
        this.OP_searching_opp_data_model = pika_Director.instance.OP_searching_OPP_data_model;
        this.pika_icon_parent = this.node.getChildByName('pika_icon');
        this.pos_icon_origin_Node = this.node.getChildByName('position_icon_origin');
        VDEventListener.on(pika_GAME_STATE_EVENT.ICON_CHESS_PROPERTIES_2, this.get_properties_icon_chess, this);
        if (this.OP_pika_pickchess_dataModel) {
            if (this.OP_pika_pickchess_dataModel.isSelf) {
                VDEventListener.on(pika_GAME_STATE_EVENT.IN_OUT_SWAP_ICON, this.set_swapIconStatus_player.bind(this));
            } else {
                VDEventListener.on(pika_GAME_STATE_EVENT.IN_OUT_SWAP_ICON, this.set_swapIconStatus_opp.bind(this));
            }
        }
    }

    offEvent() {
        VDEventListener.off(pika_GAME_STATE_EVENT.ICON_CHESS_PROPERTIES_2, this.get_properties_icon_chess, this);
        VDEventListener.off(pika_GAME_STATE_EVENT.IN_OUT_SWAP_ICON, this.set_swapIconStatus_player.bind(this));
        VDEventListener.off(pika_GAME_STATE_EVENT.IN_OUT_SWAP_ICON, this.set_swapIconStatus_opp.bind(this));
    }

    onEnable() {
        this.startEvent();
    }

    onDisable() {
        this.offEvent();
    }

    get_board_icon_data(board_icon_data: number[][]) {
        let pikaICon_node = this.node.getChildByName('pika_icon');
        let pika_setGameLever = pikaICon_node.getComponent(pika_PS_setGame_lever);
        if (this.UIsawpIcon_status_opp == IN_OUT_SWAP_ICON_STATUS.NO_STATUS || this.UIsawpIcon_status_player == IN_OUT_SWAP_ICON_STATUS.NO_STATUS ||
            this.UIsawpIcon_status_opp == IN_OUT_SWAP_ICON_STATUS.OUT_SWAP_ICON || this.UIsawpIcon_status_player == IN_OUT_SWAP_ICON_STATUS.OUT_SWAP_ICON) {
            pika_setGameLever.get_board_icon(board_icon_data)
        }
        else if (this.UIsawpIcon_status_opp == IN_OUT_SWAP_ICON_STATUS.IN_SWAP_ICON || this.UIsawpIcon_status_player == IN_OUT_SWAP_ICON_STATUS.IN_SWAP_ICON) {
            tween(this.node)
                .delay(0.25)
                .call(() => {
                    pika_setGameLever.get_board_icon(board_icon_data)
                })
                .start();
        }
    }

    set_swapIconStatus_player(UI_swapIcon_status: IN_OUT_SWAP_ICON_STATUS) {
        if (!this.icon_index_new) {
            this.icon_index_new = [];
        }
        if (UI_swapIcon_status == IN_OUT_SWAP_ICON_STATUS.OUT_SWAP_ICON) {
            this.UIsawpIcon_status_player = IN_OUT_SWAP_ICON_STATUS.OUT_SWAP_ICON;
            this.icon_index_new = this.set_game_lever_player.get_icon_index_new();
        }
    }

    set_swapIconStatus_opp(UI_swapIcon_status: IN_OUT_SWAP_ICON_STATUS) {
        if (!this.icon_index_new) {
            this.icon_index_new = [];
        }
        if (UI_swapIcon_status == IN_OUT_SWAP_ICON_STATUS.OUT_SWAP_ICON) {
            this.UIsawpIcon_status_opp = IN_OUT_SWAP_ICON_STATUS.OUT_SWAP_ICON;
            this.icon_index_new = this.set_game_lever_opp.get_icon_index_new();
        }
    }
    get_properties_icon_chess(properties_icon: pika_chess_icon_properties) {
        let pikaICon_node = this.node.getChildByName('pika_icon');
        let pika_setGameLever = pikaICon_node.getComponent(pika_PS_setGame_lever);
        this.count_sendData_icon_properties = this.count_sendData_icon_properties + 1;
        if (this.count_sendData_icon_properties == 1) {
            this.emit_data_icon_properties_1 = properties_icon;
            pika_setGameLever.set_pos_monitor(this.emit_data_icon_properties_1.hang, this.emit_data_icon_properties_1.cot);
        }
        else if (this.count_sendData_icon_properties == 2) {
            this.emit_data_icon_properties_2 = properties_icon;
            if (parseInt(this.emit_data_icon_properties_1.name) != parseInt(this.emit_data_icon_properties_2.name)) {
                this.send_pick_toSever_status = PIKA_SEND_PICK_ICON_TOSEVER_STATE.READY_TO_SEND;
                this.send_data_pickIcon_toSever();
            } else {
                this.emit_data_icon_properties_1 = this.emit_data_icon_properties_2;
                this.count_sendData_icon_properties = 1;
                pika_setGameLever.set_pos_monitor(this.emit_data_icon_properties_1.hang, this.emit_data_icon_properties_1.cot);
            }
        }
    }

    send_data_pickIcon_toSever() {
        if (this.send_pick_toSever_status == PIKA_SEND_PICK_ICON_TOSEVER_STATE.READY_TO_SEND) {
            this.send_pick_toSever_status = PIKA_SEND_PICK_ICON_TOSEVER_STATE.NO_STATE;
            this.IP_pika_pickchess_toSever = {
                id: pika_CommandID_IP.PLAYING_PICK_CHESS_IP,
                r: this.OP_searching_opp_data_model.roomID,
                x1: this.emit_data_icon_properties_1.hang,
                y1: this.emit_data_icon_properties_1.cot,
                x2: this.emit_data_icon_properties_2.hang,
                y2: this.emit_data_icon_properties_2.cot,
            }
            pika_Director.instance.send_pickChessData_toSever(this.IP_pika_pickchess_toSever);
        }
    }

    draw_line_player(pickChess_dataModel: pika_pickChess_dataModel) {
        let pikaICon_node = this.node.getChildByName('pika_icon');
        let pika_setGameLever = pikaICon_node.getComponent(pika_PS_setGame_lever);
        this.draw_line_icon_player = this.draw_node_player.getComponent(pika_PS_draw_line_icon)
        this.pos_icon_info_pick_1 = [];
        this.OP_pika_pickchess_dataModel = pickChess_dataModel;
        if (this.OP_pika_pickchess_dataModel.x || this.OP_pika_pickchess_dataModel.y) {
            this.count_sendData_icon_properties = 0;
            for (let i = 0; i < this.OP_pika_pickchess_dataModel.x.length; i++) {
                let k = this.OP_pika_pickchess_dataModel.x[i] * this.cot_number + this.OP_pika_pickchess_dataModel.y[i];
                this.pos_icon_info_pick_1[i] = this.init_icon_prefab.get_icon_node_player(k);
            }
        } else {

            let pos_icon_new = pika_setGameLever.get_moniterStatusEnd();
            let k1 = pos_icon_new.x * this.cot_number + pos_icon_new.y;
            let k2 = this.OP_pika_pickchess_dataModel.x2 * this.cot_number + this.OP_pika_pickchess_dataModel.y2;
            pika_setGameLever.swap_icon_bg(k1, k2);
            this.emit_data_icon_properties_1 = this.emit_data_icon_properties_2;
            pika_setGameLever.set_pos_monitor(this.emit_data_icon_properties_1.hang, this.emit_data_icon_properties_1.cot);
            this.count_sendData_icon_properties = 1;
        }
        if (this.pos_icon_info_pick_1) {
            let Pos_1: Vec2;
            let Pos_2: Vec2;
            for (let i = 0; i < this.pos_icon_info_pick_1.length; i++) {
                Pos_1 = this.pos_icon_info_pick_1[i];
                if (this.pos_icon_info_pick_1[i + 1]) {
                    Pos_2 = this.pos_icon_info_pick_1[i + 1];
                    this.draw_line_icon_player.draw_line_2_icon(Pos_1, Pos_2);
                }
            }
            if (this.pos_icon_info_pick_1.length > 0) {
                let k1 = this.OP_pika_pickchess_dataModel.x1 * this.cot_number + this.OP_pika_pickchess_dataModel.y1;
                let k2 = this.OP_pika_pickchess_dataModel.x2 * this.cot_number + this.OP_pika_pickchess_dataModel.y2;
                this.UIsawpIcon_status_player = IN_OUT_SWAP_ICON_STATUS.IN_SWAP_ICON;
                if (this.UIsawpIcon_status_opp == IN_OUT_SWAP_ICON_STATUS.NO_STATUS || this.UIsawpIcon_status_opp == IN_OUT_SWAP_ICON_STATUS.OUT_SWAP_ICON) {
                    tween(this.node)
                        .delay(0.15)
                        .call(() => {
                            this.draw_line_icon_player.clear_line_2_icon();
                            this.set_game_lever_player.clear_icon_node(k1, k2);
                            this.set_game_lever_player.update_new_board(k1, k2);
                            this.UIsawpIcon_status_opp = IN_OUT_SWAP_ICON_STATUS.NO_STATUS;
                        })
                        .start();
                }
                else if (this.UIsawpIcon_status_opp == IN_OUT_SWAP_ICON_STATUS.IN_SWAP_ICON) {
                    this.set_game_lever_player.set_prorerties_new_oid_icon(k1, k2);
                    tween(this.node)
                        .delay(0.15)
                        .call(() => {
                            if (this.UIsawpIcon_status_opp == IN_OUT_SWAP_ICON_STATUS.IN_SWAP_ICON) {
                                this.draw_line_icon_player.clear_line_2_icon();
                                this.set_game_lever_player.clear_icon_node(k1, k2);
                                this.set_game_lever_player.update_new_board(k1, k2);
                                this.UIsawpIcon_status_opp = IN_OUT_SWAP_ICON_STATUS.NO_STATUS;
                            }
                            else if (this.UIsawpIcon_status_opp == IN_OUT_SWAP_ICON_STATUS.OUT_SWAP_ICON) {
                                if (this.icon_index_new) {
                                    k1 = this.icon_index_new[0];
                                    k2 = this.icon_index_new[1];
                                }
                                this.draw_line_icon_player.clear_line_2_icon();
                                this.set_game_lever_player.clear_icon_node(k1, k2);
                                this.set_game_lever_player.update_new_board(k1, k2);
                                this.UIsawpIcon_status_opp = IN_OUT_SWAP_ICON_STATUS.NO_STATUS;
                            }
                        })
                        .start();
                }
            }
        }
    }

    draw_line_opp(pickChess_dataModel: pika_pickChess_dataModel) {
        this.pos_icon_info_pick_2 = [];
        this.draw_line_icon_opp = this.draw_node_opp.getComponent(pika_PS_draw_line_icon);
        this.OP_pika_pickchess_dataModel = pickChess_dataModel;
        if (this.OP_pika_pickchess_dataModel.x || this.OP_pika_pickchess_dataModel.y) {
            for (let i = 0; i < this.OP_pika_pickchess_dataModel.x.length; i++) {
                let k = this.OP_pika_pickchess_dataModel.x[i] * this.cot_number + this.OP_pika_pickchess_dataModel.y[i];
                this.pos_icon_info_pick_2[i] = this.init_icon_prefab.get_icon_node_opp(k);
            }
        }
        if (this.pos_icon_info_pick_2) {
            let Pos_1: Vec2;
            let Pos_2: Vec2;
            for (let i = 0; i < this.pos_icon_info_pick_2.length; i++) {
                Pos_1 = this.pos_icon_info_pick_2[i];
                if (this.pos_icon_info_pick_2[i + 1]) {
                    Pos_2 = this.pos_icon_info_pick_2[i + 1];
                    this.draw_line_icon_opp.draw_line_2_icon(Pos_1, Pos_2);
                }
            }
            if (this.pos_icon_info_pick_2.length > 0) {
                let k1 = this.OP_pika_pickchess_dataModel.x1 * this.cot_number + this.OP_pika_pickchess_dataModel.y1;
                let k2 = this.OP_pika_pickchess_dataModel.x2 * this.cot_number + this.OP_pika_pickchess_dataModel.y2;
                this.UIsawpIcon_status_opp = IN_OUT_SWAP_ICON_STATUS.IN_SWAP_ICON;
                if (this.UIsawpIcon_status_player == IN_OUT_SWAP_ICON_STATUS.OUT_SWAP_ICON || this.UIsawpIcon_status_player == IN_OUT_SWAP_ICON_STATUS.NO_STATUS) {
                    tween(this.node)
                        .delay(0.15)
                        .call(() => {
                            this.draw_line_icon_opp.clear_line_2_icon();
                            this.set_game_lever_opp.clear_icon_node(k1, k2);
                            this.set_game_lever_opp.update_new_board(k1, k2);
                            this.UIsawpIcon_status_player = IN_OUT_SWAP_ICON_STATUS.NO_STATUS;
                        })
                        .start();
                }
                if (this.UIsawpIcon_status_player == IN_OUT_SWAP_ICON_STATUS.IN_SWAP_ICON) {
                    this.set_game_lever_opp.set_prorerties_new_oid_icon(k1, k2);
                    tween(this.node)
                        .delay(0.15)
                        .call(() => {
                            if (this.UIsawpIcon_status_player == IN_OUT_SWAP_ICON_STATUS.IN_SWAP_ICON) {
                                this.draw_line_icon_opp.clear_line_2_icon();
                                this.set_game_lever_opp.clear_icon_node(k1, k2);
                                this.set_game_lever_opp.update_new_board(k1, k2);
                                this.UIsawpIcon_status_player = IN_OUT_SWAP_ICON_STATUS.NO_STATUS;
                            }
                            else if (this.UIsawpIcon_status_player == IN_OUT_SWAP_ICON_STATUS.OUT_SWAP_ICON) {
                                if (this.icon_index_new) {
                                    k1 = this.icon_index_new[0];
                                    k2 = this.icon_index_new[1];
                                }
                                this.draw_line_icon_opp.clear_line_2_icon();
                                this.set_game_lever_opp.clear_icon_node(k1, k2);
                                this.set_game_lever_opp.update_new_board(k1, k2);
                                this.UIsawpIcon_status_player = IN_OUT_SWAP_ICON_STATUS.NO_STATUS;
                            }
                        })
                        .start();
                }
            }
        }
    }

    start_game() {
        this.start_group.start_node_moving();
        this.start_group.node.on(pika_GAME_STATE_EVENT.START_EFFECT_END, this.emit_playScreen, this);
    }

    emit_playScreen() {
        this.node.emit(pika_GAME_STATE_EVENT.START_EFFECT_END);
    }

    init_pika_icon(board_icon_center: number[][]) {
        if (this.UIsawpIcon_status_opp == IN_OUT_SWAP_ICON_STATUS.NO_STATUS || this.UIsawpIcon_status_player == IN_OUT_SWAP_ICON_STATUS.NO_STATUS ||
            this.UIsawpIcon_status_opp == IN_OUT_SWAP_ICON_STATUS.OUT_SWAP_ICON || this.UIsawpIcon_status_player == IN_OUT_SWAP_ICON_STATUS.OUT_SWAP_ICON) {
            this.init_icon_prefab.init_pos_origin(this.pos_icon_origin_Node, board_icon_center);
            this.count_sendData_icon_properties = 0;
        }
        else if (this.UIsawpIcon_status_opp == IN_OUT_SWAP_ICON_STATUS.IN_SWAP_ICON || this.UIsawpIcon_status_player == IN_OUT_SWAP_ICON_STATUS.IN_SWAP_ICON) {
            tween(this.node)
                .delay(0.25)
                .call(() => {
                    this.init_icon_prefab.init_pos_origin(this.pos_icon_origin_Node, board_icon_center);
                    this.count_sendData_icon_properties = 0;
                })
                .start();
        }
    }

    set_hint_pick(A: Vec2, B: Vec2) {
        this.init_icon_prefab.set_hint_pick(A, B);
    }
    clear_BL_inStartGroup() {
        this.start_group.clear_BL();
    }
}


