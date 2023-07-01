import VDWebSocketClient, { WEBSOCKET_GAME_STATE } from "../../../../vd-framework/network/VDWebSocketClient";
import { pika_GameListener } from "./pika_GameListener";
import { pika_Config } from "../common/pika_config";
import { pika_Director } from "../core/pika_Director";
import { JsonAsset } from "cc";
import { RenderFlow } from "cc";
import { log } from "cc";
import { pika_bets_inputData_toSever, pika_hintPick_inputData_toSever, pika_leaveGame_inputData_toSever, pika_pickChess_inputData_toSever, pika_playStart_inputData_toSever, pika_reconnectReady_inputData_toSever, pika_stopSearchingOpp_inputData_ToSever, pika_swapIcon_inputData_toSever, pika_update_money_inputData_toSever } from "../model/pika_input_to_sever_data";

export class pika_WebSocket extends VDWebSocketClient {
    _isInit: boolean = false;

    constructor() {
        super();
    }
    connectToServer(token: number, userID: number, connectSuccessCallback?: any) {
        log(window.location.href);
        this._isInit = true;

        let ip = pika_Config.host_url;
        let port = pika_Config.port;
        let isHttps = pika_Config.isHttps;
        let user_ID = userID;

        let listener = new pika_GameListener();
        listener.setConnectedCallback(connectSuccessCallback);
        pika_Director.instance.wsGameState = WEBSOCKET_GAME_STATE.CONNECTING;
        this.connect(ip, port, isHttps, user_ID, listener, token);
    }
    send_BetsData_toSever(bets_data: pika_bets_inputData_toSever) {
        let msgStr = JSON.stringify(bets_data);
        this.send(msgStr);
    }

    send_playReadyData_toSever(playReady_data: pika_playStart_inputData_toSever) {
        let msgStr = JSON.stringify(playReady_data);
        this.send(msgStr);
    }

    send_pick_icon_chessData_toSever(pick_chess_data: pika_pickChess_inputData_toSever) {
        let msgStr = JSON.stringify(pick_chess_data);
        this.send(msgStr);
    }

    send_update_moneyData_toSever(updateMoney_data: pika_update_money_inputData_toSever) {
        let msgStr = JSON.stringify(updateMoney_data);
        this.send(msgStr);
    }
    send_swapIconData_toSever(swapIcon_data: pika_swapIcon_inputData_toSever) {
        let msgStr = JSON.stringify(swapIcon_data);
        this.send(msgStr);
    }
    send_hintPickIconData_toSever(hintPickIcon_data: pika_hintPick_inputData_toSever) {
        let msgStr = JSON.stringify(hintPickIcon_data);
        this.send(msgStr);
    }
    send_reconnectReadyData_toSever(reconnectReady_data: pika_reconnectReady_inputData_toSever) {
        let msgStr = JSON.stringify(reconnectReady_data);
        this.send(msgStr);
    }
    send_stopSearchingOppData_toSever(stopSearching_data: pika_stopSearchingOpp_inputData_ToSever) {
        let msgStr = JSON.stringify(stopSearching_data);
        this.send(msgStr);
    }
    send_leaveGameData_toSever(leaveGameData: pika_leaveGame_inputData_toSever) {
        let msgStr = JSON.stringify(leaveGameData);
        this.send(msgStr);
    }
}


