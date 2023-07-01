import { _decorator, Component, Node, Prefab } from 'cc';
import VDBaseScreen from '../../../../vd-framework/ui/VDBaseScreen';
import { pika_Director } from '../core/pika_Director';
import { pika_PS_topGroup } from '../play_ts/pika_PS_topGroup';
import { pika_PS_centerGroup } from '../play_ts/pika_PS_centerGroup';
import { pika_CommandID_IP, pika_GAME_STATE_EVENT } from '../network/pika_NetworkDefine';
import { pika_playStart_inputData_toSever, pika_reconnectReady_inputData_toSever } from '../model/pika_input_to_sever_data';
import { pika_searchingOpp_data_model } from '../model/pika_searching_data_model';
import { pika_board_icon_dataModel, pika_hint_pick_gamePlay_dataModel, pika_pickChess_dataModel, pika_RECONNECTED_dataModel, pika_timer_playGame_dataModel } from '../model/pika_play_data_model';
import { tween } from 'cc';
import { Vec2 } from 'cc';
import { pika_PS_bottomGroup } from '../play_ts/pika_PS_bottomGroup';
import { RECONNECT_STATE } from '../common/pika_Define';
import { pika_PlayerInfoModel } from '../model/pika_Loading_data_model';
import VDScreenManager from '../../../../vd-framework/ui/VDScreenManager';
import { pika_Path } from '../common/pika_Define';
import { GAME_STATE_FE } from '../core/pika_Director';
import { pika_resultScreen } from './pika_resultScreen';
import { pika_PS_audioPlays } from '../play_ts/pika_PS_audioPlays';
import VDBasePopup from '../../../../vd-framework/ui/VDBasePopup';
const { ccclass, property } = _decorator;

@ccclass('pika_playScreen')
export class pika_playScreen extends VDBaseScreen {
    @property(pika_PS_bottomGroup)
    private bottomGroup: pika_PS_bottomGroup = null;
    @property(pika_PS_topGroup)
    private topGroup: pika_PS_topGroup = null;
    @property(pika_PS_centerGroup)
    private centerGroup: pika_PS_centerGroup = null;
    private IP_playreadyData_to_sever: pika_playStart_inputData_toSever = null;
    private IP_reconnect_playReadyData_toSever: pika_reconnectReady_inputData_toSever = null;
    private OP_searching_opp_data_model: pika_searchingOpp_data_model = null;
    private OP_pickChess_dataModel: pika_pickChess_dataModel = null;
    private OP_reconnectDataModel: pika_RECONNECTED_dataModel = null;
    private OP_timerPlayGame_dataModel: pika_timer_playGame_dataModel = null;
    private OP_player_data_model: pika_PlayerInfoModel = null;
    private point_A: Vec2 = new Vec2(0, 0);
    private point_B: Vec2 = new Vec2(0, 0);
    private OP_hintPickData: pika_hint_pick_gamePlay_dataModel = null;
    private audioPlay: pika_PS_audioPlays = null;
    private play_setting_popup: VDBasePopup = null!;
    onLoad() {
        this.OP_searching_opp_data_model = pika_Director.instance.OP_searching_OPP_data_model;
        this.OP_player_data_model = pika_Director.instance.OP_player_data_model;
        this.audioPlay = this.node.getComponent(pika_PS_audioPlays);
    }
    start() {
        if (pika_Director.instance.reconnect_state == RECONNECT_STATE.NORMAL_CONNECT) {
            this.bottomGroup.node.active = false
            this.centerGroup.start_game();
        }
        if (pika_Director.instance.reconnect_state == RECONNECT_STATE.RECONNECT) {
            this.get_ReconnectDataModel();
            this.centerGroup.clear_BL_inStartGroup();
            this.init_reconnect_PlayScreen();
            this.audioPlay.start_nhacnen();
        }
        this.centerGroup.node.on(pika_GAME_STATE_EVENT.START_EFFECT_END, this.initPlayScreen, this);
    }
    //*****************************RECONNECT MANAGER***************************** */
    get_ReconnectDataModel() {
        this.OP_reconnectDataModel = pika_Director.instance.OP_reconnect_dataModel;
    }
    init_reconnect_PlayScreen() {
        this.send_reconnectReadyData_toSever();
        this.topGroup.init_avatar(pika_Director.instance.avatar_for_opp, this.OP_reconnectDataModel.oppName,
            pika_Director.instance.avatar_for_player, this.OP_player_data_model.displayName);
        this.bottomGroup.node.active = true;
    }
    send_reconnectReadyData_toSever() {
        if (this.OP_reconnectDataModel.status) {
            this.IP_reconnect_playReadyData_toSever = {
                id: pika_CommandID_IP.RECONNECT_PLAYREADY,
                r: this.OP_reconnectDataModel.idRoom,
            };
            pika_Director.instance.send_reconnect_playReadyData_toSever(this.IP_reconnect_playReadyData_toSever);
        } else {
            this.send_playReadyData_toSever();
        }
    }
    //****************************CONNECT NOMAL MANAGER ****************************** */
    initPlayScreen() {
        this.send_playReadyData_toSever();
        this.topGroup.init_avatar(pika_Director.instance.avatar_for_opp, this.OP_searching_opp_data_model.opp_name,
            pika_Director.instance.avatar_for_player, this.OP_player_data_model.displayName);
        this.bottomGroup.node.active = true;
    }
    send_playReadyData_toSever() {
        this.IP_playreadyData_to_sever = {
            id: pika_CommandID_IP.PLAY_READY_IP,
            r: this.OP_searching_opp_data_model.roomID,
        };
        pika_Director.instance.send_playReadyData_toSever(this.IP_playreadyData_to_sever);
    }
    //top group
    set_timer_playGame(timerPlayGame_dataModel: pika_timer_playGame_dataModel) {
        this.OP_timerPlayGame_dataModel = timerPlayGame_dataModel;
        this.topGroup.init_progressbar_from_sever(this.OP_timerPlayGame_dataModel.time_count);
    }
    setPoint_gamePlay() {
        tween(this.node)
            .delay(0.6)
            .call(() => {
                this.topGroup.update_showPoint_opp(this.OP_pickChess_dataModel.oppTotalPoint);
                this.topGroup.update_showPoint_player(this.OP_pickChess_dataModel.playerTotalPoint);
            })
            .start();
    }

    //center group
    draw_line_icon(pickChess_dataModel: pika_pickChess_dataModel) {

        this.OP_pickChess_dataModel = pickChess_dataModel;

        if (this.OP_pickChess_dataModel.isSelf) {
            this.centerGroup.draw_line_player(this.OP_pickChess_dataModel);
            if (this.OP_pickChess_dataModel.x) {
                this.audioPlay.effect_chooseRight();
            } else {
                this.audioPlay.effect_chooseWrong();
            }
        } else {
            this.centerGroup.draw_line_opp(this.OP_pickChess_dataModel);
        }
        this.setPoint_gamePlay();
    }
    init_center_board_icon(board_icon_playscreen: number[][]) {
        this.centerGroup.init_pika_icon(board_icon_playscreen)
        this.centerGroup.get_board_icon_data(board_icon_playscreen);
    }
    set_hint_pick(hintPick_data: pika_hint_pick_gamePlay_dataModel) {
        this.OP_hintPickData = hintPick_data;
        this.point_A.x = this.OP_hintPickData.x1;
        this.point_A.y = this.OP_hintPickData.y1;
        this.point_B.x = this.OP_hintPickData.x2;
        this.point_B.y = this.OP_hintPickData.y2;
        this.centerGroup.set_hint_pick(this.point_A, this.point_B);
    }
    onDestroy() {
        this.centerGroup.init_icon_prefab.offEvent();
    }
    set_endGame() {
        tween(this.node)
            .delay(2)
            .call(() => {
                let result_screen = VDScreenManager.instance.assetBundle.get(pika_Path.RESULT_SCREEN, Prefab)!;
                VDScreenManager.instance.replaceScreenAtIndex(result_screen, 0, (screen: VDBaseScreen) => {
                    pika_Director.instance.gameStateFE = GAME_STATE_FE.RESULT_SCREEN;
                    pika_Director.instance.resultScreen = screen as pika_resultScreen;
                });
            })
            .start();
    }
    onClick_soundEffect() {
        this.audioPlay.effect_clickButton();
    }
    onClick_setting() {
        VDScreenManager.instance.showPopupFromPrefabName(pika_Path.SETTING_POPUP, (popup: VDBasePopup) => {
            this.play_setting_popup = popup;
            let callbacks = [() => {
                VDScreenManager.instance.hidePopup(true);
            }];
        }, false, true, true);
    }
}


