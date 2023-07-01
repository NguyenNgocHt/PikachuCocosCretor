const lodash = globalThis._;

import { VDGameListener } from "../../../../vd-framework/network/VDGameListener";
import * as cc from 'cc';
import { pika_Director } from "../core/pika_Director";
import { log } from "cc";
import { VDEventListener } from "../../../../vd-framework/common/VDEventListener";
import { pika_GAME_STATE_EVENT, pika_NETWORK_STATE_EVENT, pika_CommandID_IP, pika_CommandID_OP } from "./pika_NetworkDefine";
import { pika_BuildModel } from "../model/pika_BuildModel";
import { Contact2DType } from "cc";
import { WEBSOCKET_GAME_STATE } from "../../../../vd-framework/network/VDWebSocketClient";
import { CONNECT_STATE } from "../common/pika_Define";
import { pika_WaitingProgress } from "../popups/pika_WaitingProgress";
import { pika_loading_data_full } from "../model/pika_Loading_data_model";
import { pika_board_icon_dataInfoShort, pika_board_icon_dataModel, pika_endGame_data_infoShort, pika_hint_pick_gamePlay_dataModel, pika_pickChess_data_infoShort, pika_reconnected_infoShort, pika_timer_playGame_dataInfoShort } from "../model/pika_play_data_model";
import VDScreenManager from "../../../../vd-framework/ui/VDScreenManager";
import { pika_searchingOpp_data_infoShort } from "../model/pika_searching_data_model";
import { pika_RECONNECTED_data_infoShort } from "../model/pika_play_data_model";


export class pika_GameListener implements VDGameListener {
    private arr: number[][] = [];
    _waitingJoinGame: boolean = false;
    _connectedCallback: any = null;

    setConnectedCallback(connectedCallback?: any) {
        connectedCallback && (this._connectedCallback = connectedCallback);
    }

    onSocketOpen() {
        cc.log("@ [cf_GameListener] onSocketOpen");
        pika_WaitingProgress.instance.hide();
        this._connectedCallback && this._connectedCallback();
    }

    onSocketReconnect() {
        cc.log("@ [cf_GameListener] onSocketReconnect");
        pika_WaitingProgress.instance.hide();
        pika_Director.instance.handleAfterReconnected();
        pika_Director.instance.connect_player = CONNECT_STATE.CONNECT;
    }

    onSocketMessage(cmd, data) {
        cc.log("@ [cf_GameListener] onSocketMessage data = " + data);
        let dataJson = JSON.parse(data);
        let commandId = dataJson.id;
        switch (commandId) {
            case pika_CommandID_OP.LOGIN_RETURN_OP:
                this.transfromPlayerInfo(dataJson);
                break;
            case pika_CommandID_OP.PICK_CHESS_OP:
                this.transfrom_pickChess_Info(dataJson);
                break;
            case pika_CommandID_OP.SEARCHING_DATA_OPP:
                this.transfrom_searching_opp_Info(dataJson);
                break;
            case pika_CommandID_OP.TIMER_OP:
                this.transfrom_timer_playGame_info(dataJson);
                break;
            case pika_CommandID_OP.BOARD_DATA_OP:
                this.transfrom_boardIcon_Info(dataJson);
                break;
            case pika_CommandID_OP.HINT_PICK_DATA_OP:
                this.send_hint_pick_data_to_director(dataJson);
                break;
            case pika_CommandID_OP.RECONNECT_OP:
                this.transfrom_ReconnectData_info(dataJson);
                break;
            case pika_CommandID_OP.END_GAME_OP:
                this.transfrom_endGameData_info(dataJson);
                break;
        }
    }

    onSocketError() {
        cc.log("@ [cf_GameListener] onSocketError");
        this._waitingJoinGame = false;
        // cf_Director.instance.closeWebSocket();
        pika_WaitingProgress.instance.hide();
        VDEventListener.dispatchEvent(pika_NETWORK_STATE_EVENT.ERROR);
    }

    onSocketClose() {
        cc.log("@ [cf_GameListener] onSocketClose");
        this._waitingJoinGame = false;
        pika_WaitingProgress.instance.show();

        // cf_Director.instance.closeWebSocket();
        // VDEventListener.dispatchEvent(cf_NETWORK_STATE_EVENT.DISCONNECT);
    }
    onSocketDisconnect() {
        cc.log("@ [cf_GameListener] onSocketDisconnect");
        this._waitingJoinGame = false;
        // cf_Director.instance.closeWebSocket();
        pika_Director.instance.connect_player = CONNECT_STATE.DISCONNECT;
        pika_WaitingProgress.instance.hide();
        VDEventListener.dispatchEvent(pika_NETWORK_STATE_EVENT.ERROR);
    }
    // --------------------- TRANSFORM DATA: SHORT -> CLEAR ---------------------
    send_hint_pick_data_to_director(hintPick_data: pika_hint_pick_gamePlay_dataModel) {
        VDEventListener.dispatchEvent(pika_GAME_STATE_EVENT.HINT_PICK_DATA, hintPick_data);
    }
    transfromPlayerInfo(loading_data_full: pika_loading_data_full) {
        let playerInfoModel = pika_BuildModel.buildPlayerModel(loading_data_full);
        let betsDataInfoModel = pika_BuildModel.builBetsModel(loading_data_full);
        VDEventListener.dispatchEvent(pika_GAME_STATE_EVENT.LOGIN_SUCCESS, playerInfoModel, betsDataInfoModel);
    }
    transfrom_pickChess_Info(pick_chess_data_infoShort: pika_pickChess_data_infoShort) {
        let pickChessData_infoModel = pika_BuildModel.build_pickChess_model(pick_chess_data_infoShort);
        VDEventListener.dispatchEvent(pika_GAME_STATE_EVENT.PLAYING_PICK_CHESS_DATA_MODEL, pickChessData_infoModel);

    }
    transfrom_searching_opp_Info(searching_opp_infoShort: pika_searchingOpp_data_infoShort) {
        let searching_opp_data_model = pika_BuildModel.build_searching_opp_model(searching_opp_infoShort);
        VDEventListener.dispatchEvent(pika_GAME_STATE_EVENT.SEARCHING_OPP_DATA_MODEL, searching_opp_data_model);
    }
    transfrom_timer_playGame_info(timer_playGame_infoShort: pika_timer_playGame_dataInfoShort) {
        let timer_playGame_data_model = pika_BuildModel.build_timer_playGame_model(timer_playGame_infoShort);
        VDEventListener.dispatchEvent(pika_GAME_STATE_EVENT.TIMER_PLAYGAME_DATA_MODEL, timer_playGame_data_model);
    }
    transfrom_boardIcon_Info(boardIcon_infoShort: pika_board_icon_dataInfoShort) {
        let board_icon_dataModel = pika_BuildModel.build_board_icon_data_model(boardIcon_infoShort);
        VDEventListener.dispatchEvent(pika_GAME_STATE_EVENT.BOARD_ICON_DATA_MODEL, board_icon_dataModel.board);
    }
    transfrom_ReconnectData_info(reconnect_infoShort: pika_RECONNECTED_data_infoShort) {
        let reconnectData_model = pika_BuildModel.build_reconnectData_model(reconnect_infoShort);
        VDEventListener.dispatchEvent(pika_GAME_STATE_EVENT.RECONNECT_DATA_MODEL, reconnectData_model);
    }
    transfrom_endGameData_info(endGame_infoShort: pika_endGame_data_infoShort) {
        let endGameData_model = pika_BuildModel.build_endGameData_model(endGame_infoShort);
        VDEventListener.dispatchEvent(pika_GAME_STATE_EVENT.END_GAME_DATA_MODEL, endGameData_model);
    }
    // convertStringtoArray(boardIcon_infoShort: pika_board_icon_dataInfoShort) {
    //     const trimmedString = boardIcon_infoShort.board.slice(1, -1);
    //     const rowStrings = trimmedString.split("],[");
    //     this.arr = [];
    //     this.arr = rowStrings.map(rowStrings => rowStrings.split(",").map(Number));
    //     for (let i = 0; i < 16; i++) {
    //         for (let j = 0; j < 11; j++) {
    //             if (isNaN(this.arr[i][j])) {
    //                 this.arr[i][j] = -1;
    //             }
    //         }
    //     }
    // }
    // --------------------- END: TRANSFORM DATA --------------------
}


