import { log, pingPong } from 'cc';
import { _decorator, Component, Node, tween, sys, Vec3, assetManager, Texture2D, SpriteAtlas, SpriteFrame, Sprite, resources, RenderTexture, ImageAsset } from 'cc';
import { VDEventListener } from '../../../../vd-framework/common/VDEventListener';
import VDBasePopup from '../../../../vd-framework/ui/VDBasePopup';
import VDScreenManager from '../../../../vd-framework/ui/VDScreenManager';
import { best_list, mock_config, money_for_player } from '../../../../vd-mock/mock_config';
import { pika_Path, pika_Text, CONNECT_STATE, ON_OFF_STATE, RECONNECT_RELOADING_PLAYSCREEN, RECONNECT_STATE, WIN_LOSE_DRAW_STATUS, SEARCHING_COMEBACK_STATUS } from '../common/pika_Define';
import { pika_WebSocket } from '../network/pika_WebSocket';
import { pika_homeScreen } from '../screens/pika_homeScreen';
import { pika_loadingScreen } from '../screens/pika_loadingScreen';
import { pika_searchingScreen } from '../screens/pika_searchingScreen';
import { pika_playScreen } from '../screens/pika_playScreen';
import { pika_resultScreen } from '../screens/pika_resultScreen';
import { pika_BuildModel } from '../model/pika_BuildModel';
import { WEBSOCKET_GAME_STATE } from '../../../../vd-framework/network/VDWebSocketClient';
import { JSB } from 'cc/env';
import { pika_GameListener } from '../network/pika_GameListener';
import { pika_GAME_STATE_EVENT } from '../network/pika_NetworkDefine';
import { pika_NETWORK_STATE_EVENT } from '../network/pika_NetworkDefine';
import { pika_WaitingProgress } from '../popups/pika_WaitingProgress';
import { pika_PopupNotify } from '../popups/pika_PopupNotify';
import { pika_BetInfoModel, pika_PlayerInfoModel } from '../model/pika_Loading_data_model';
import { pika_searchingOpp_data_model } from '../model/pika_searching_data_model';
import { pika_RECONNECTED_dataModel, pika_board_icon_dataModel, pika_endGame_dataModel, pika_hint_pick_gamePlay_dataModel, pika_icon_list, pika_pickChess_dataModel, pika_timer_playGame_dataModel } from '../model/pika_play_data_model';
import { pika_bets_inputData_toSever, pika_hintPick_inputData_toSever, pika_leaveGame_inputData_toSever, pika_pickChess_inputData_toSever, pika_playStart_inputData_toSever, pika_reconnectReady_inputData_toSever, pika_stopSearchingOpp_inputData_ToSever, pika_swapIcon_inputData_toSever, pika_update_money_inputData_toSever } from '../model/pika_input_to_sever_data';
enum reconectState {
    nostate,
    normalConnect,
    reconnect,
}
enum searching_comeBack_state {
    nostate,
    normalSearching,
    searching_comeBack,
}
enum connectState {
    nostate,
    success,
    false,
}
export enum LOGIN_STATE {
    NO_LOGIN = 0,
    LOGINNING = 1,
    LOGIN_SUCCESS = 2,
    LOGIN_FAIL = 3,
}

export enum GAME_STATE_FE {
    LOADING_SCREEN = 'LOADING_SCREEN',
    HOME_SCREEN = 'HOME_SCREEN',
    SEARCHING_OPP_SCREEN = 'SEARCHING_OPP_SCREEN',
    PLAYING_SCREEN = 'PLAYING_SCREEN',
    RESULT_SCREEN = 'RESULT_SCREEN'
}
const { ccclass, property } = _decorator;

@ccclass('pika_Director')
export class pika_Director extends Component {
    private logClassTag: string = "@ [cf_Director] -- ";
    private static _instance: pika_Director = null!;
    public static get instance(): pika_Director {
        if (this._instance == null) {
            this._instance = new pika_Director();
        }
        return this._instance;
    }
    //############################################################################################################
    //---------------- [Properties] --- Data -----------------------------
    //**********data */
    public reconnect_state: RECONNECT_STATE = RECONNECT_STATE.NORMAL_CONNECT;
    //data output from sever
    public OP_player_data_model: pika_PlayerInfoModel = null;
    public OP_bets_data_model: pika_BetInfoModel = null;
    public OP_searching_OPP_data_model: pika_searchingOpp_data_model = null;
    public OP_pika_icon_list: pika_icon_list = null;
    public OP_pickChess_data_model: pika_pickChess_dataModel = null;
    public OP_timerPlayGame_dataModel: pika_timer_playGame_dataModel = null;
    public OP_boardIcon_dataModel: number[][];
    public OP_boardICon_reconnectData: any[];
    public OP_hintPick_dataModel: pika_hint_pick_gamePlay_dataModel = null;
    public OP_reconnect_dataModel: pika_RECONNECTED_dataModel = null;
    public OP_endGame_dataModel: pika_endGame_dataModel = null;
    //data returned to the sever
    //data input to sever
    public IP_bets_data_toSever: pika_bets_inputData_toSever = null;
    public IP_playReadyData_toSever: pika_playStart_inputData_toSever = null;
    public IP_pickChessData_toSever: pika_pickChess_inputData_toSever = null;
    public IP_updateMoneyData_toSever: pika_update_money_inputData_toSever = null;
    //---------------- [Properties] --- WebSocket --------------------------
    public wsGameClient: pika_WebSocket = null;
    public wsGameState: WEBSOCKET_GAME_STATE = WEBSOCKET_GAME_STATE.NOT_CONNECTED;
    public connect_state: connectState = connectState.nostate;

    //---------------- [Properties] --- Screen -----------------------------
    playScreen: pika_playScreen | null = null;
    homeScreen: pika_homeScreen | null = null;
    searchScreen: pika_searchingScreen | null = null;
    LoadingScreen: pika_loadingScreen | null = null;
    resultScreen: pika_resultScreen | null = null;

    private _gameStateFE: GAME_STATE_FE = GAME_STATE_FE.LOADING_SCREEN;

    //---------------- [Properties] --- Callback -----------------------------
    callbackLoginSuccess: any = null;
    callbackLoginFail: any = null;

    //---------------- [Properties] --- Others -----------------------------

    private _popupDisplay: VDBasePopup = null!;
    public loadingSuccess: boolean = false;
    public arr_button: Vec3[];
    public userID: number = 0;
    public resultStatus: WIN_LOSE_DRAW_STATUS = WIN_LOSE_DRAW_STATUS.NO_STATUS;
    public searchingComebackStatus: SEARCHING_COMEBACK_STATUS = SEARCHING_COMEBACK_STATUS.NO_STATUS;
    //*********************** [setting variable]****************************/
    public sfx_on_off_state: ON_OFF_STATE = ON_OFF_STATE.ON;
    public music_on_off_state: ON_OFF_STATE = ON_OFF_STATE.ON;
    public music_button_on_off_state: ON_OFF_STATE = ON_OFF_STATE.ON;
    public sfx_button_on_off_state: ON_OFF_STATE = ON_OFF_STATE.ON;
    public count_music_button_press: number = 0;
    public count_sfx_button_press: number = 0;
    public count_audioPlayNhacNen: number = 0;
    //avatar player
    public avatar_for_player: SpriteFrame = null;
    public avatar_for_opp: SpriteFrame = null;

    public _loginState: LOGIN_STATE = LOGIN_STATE.NO_LOGIN;
    private hang_number: number = 14;
    private cot_number: number = 10;
    //---------------- [Reconnect] -----------------------------
    public _isSendingBetData: boolean = false;
    public connect_player: CONNECT_STATE = CONNECT_STATE.NO_STATE;
    public connect_opp: CONNECT_STATE = CONNECT_STATE.NO_STATE;
    public reconnect_playscreen: boolean = false;
    public reconnect_reload_playscreen: RECONNECT_RELOADING_PLAYSCREEN = RECONNECT_RELOADING_PLAYSCREEN.NO_STATE;

    //---------------- [Properties] --- End ---------------------------------

    //############################################################################################################
    //-----------------[fake function]-----------------------------------

    //############################################################################################################
    //---------------- [Functions] --- Game State --------------------------
    public set gameStateFE(gameState: GAME_STATE_FE) {
        this._gameStateFE = gameState;
    }

    public get gameStateFE(): GAME_STATE_FE {
        return this._gameStateFE;
    }
    //---------------- [Functions] --- Network --------------------------
    login(callbackSuccess: any, callbackFail?: any) {
        this.callbackLoginSuccess = callbackSuccess;
        this.callbackLoginFail = callbackFail;
        this.registerEvents();
    }

    getLoginState() {
        return this._loginState;
    }
    connectToGameServer(token: number, userID: number) {
        this.userID = userID;
        if (!this.wsGameClient) {
            this.wsGameClient = new pika_WebSocket();
        }
        this._loginState = LOGIN_STATE.LOGINNING;
        this.wsGameClient.connectToServer(token, userID, () => {
            this.connect_state = connectState.success;
            this.connect_player = CONNECT_STATE.CONNECT;
        });
    }

    closeWebSocket() {
        this.wsGameClient = null;
    }
    //---------------- [Functions] --- Register Event --------------------------
    registerEvents() {
        VDEventListener.on(pika_NETWORK_STATE_EVENT.ERROR, this.handleNetworkError.bind(this));
        VDEventListener.on(pika_NETWORK_STATE_EVENT.DISCONNECT, this.handleNetworkDisconnect.bind(this));
        VDEventListener.on(pika_GAME_STATE_EVENT.LOGIN_SUCCESS, this.handlePlayerInfo.bind(this));
        VDEventListener.on(pika_GAME_STATE_EVENT.SEARCHING_OPP_DATA_MODEL, this.handleSearching_opp_dataInfo.bind(this));
        VDEventListener.on(pika_GAME_STATE_EVENT.PLAYING_PICK_CHESS_DATA_MODEL, this.handle_pickChessDataInfo.bind(this));
        VDEventListener.on(pika_GAME_STATE_EVENT.TIMER_PLAYGAME_DATA_MODEL, this.handle_timer_playGame_dataInfo.bind(this));
        VDEventListener.on(pika_GAME_STATE_EVENT.BOARD_ICON_DATA_MODEL, this.handle_boardIcon_dataInfo.bind(this));
        VDEventListener.on(pika_GAME_STATE_EVENT.HINT_PICK_DATA, this.handle_hintPick_dataInfo.bind(this));
        VDEventListener.on(pika_GAME_STATE_EVENT.RECONNECT_DATA_MODEL, this.handle_reconnectDataInfo.bind(this));
        VDEventListener.on(pika_GAME_STATE_EVENT.END_GAME_DATA_MODEL, this.handle_endGameDataInfo.bind(this));
    }
    offEvents() {
        VDEventListener.off(pika_NETWORK_STATE_EVENT.ERROR, this.handleNetworkError.bind(this));
        VDEventListener.off(pika_NETWORK_STATE_EVENT.DISCONNECT, this.handleNetworkDisconnect.bind(this));
        VDEventListener.off(pika_GAME_STATE_EVENT.LOGIN_SUCCESS, this.handlePlayerInfo.bind(this));
        VDEventListener.off(pika_GAME_STATE_EVENT.SEARCHING_OPP_DATA_MODEL, this.handleSearching_opp_dataInfo.bind(this));
        VDEventListener.off(pika_GAME_STATE_EVENT.PLAYING_PICK_CHESS_DATA_MODEL, this.handle_pickChessDataInfo.bind(this));
        VDEventListener.off(pika_GAME_STATE_EVENT.TIMER_PLAYGAME_DATA_MODEL, this.handle_timer_playGame_dataInfo.bind(this));
        VDEventListener.off(pika_GAME_STATE_EVENT.BOARD_ICON_DATA_MODEL, this.handle_boardIcon_dataInfo.bind(this));
        VDEventListener.off(pika_GAME_STATE_EVENT.HINT_PICK_DATA, this.handle_hintPick_dataInfo.bind(this));
        VDEventListener.off(pika_GAME_STATE_EVENT.RECONNECT_DATA_MODEL, this.handle_reconnectDataInfo.bind(this));
        VDEventListener.off(pika_GAME_STATE_EVENT.END_GAME_DATA_MODEL, this.handle_endGameDataInfo.bind(this));
    }
    public handleNetworkError() {
        this.handleNetworkDisconnect();
    }
    public handleNetworkDisconnect() {
        log(this.logClassTag + 'handleNetworkDisconnect');
        if (this._loginState == LOGIN_STATE.LOGINNING) {
            this._loginState = LOGIN_STATE.LOGIN_FAIL;
            this.callbackLoginFail && this.callbackLoginFail();
        }
        // this.closeIfNeed();
        if (this._popupDisplay != null) return;
        VDScreenManager.instance.showPopupFromPrefabName(pika_Path.NOTIFY_POPUP, (popup: VDBasePopup) => {
            this._popupDisplay = popup;
            let popupDisplay = popup as pika_PopupNotify;
            let callbacks = [() => {
                VDScreenManager.instance.hidePopup(true);
                this._popupDisplay = null;
                if (this.wsGameClient) {
                    pika_WaitingProgress.instance.show();
                    this.wsGameClient.reconnect();
                }
            }];
            popupDisplay.setupPopup(pika_Text.DISCONNECT, callbacks);
        }, false, true, true);
    }
    handleAfterReconnected() {
        if (this.gameStateFE == GAME_STATE_FE.SEARCHING_OPP_SCREEN) {
            log('@ Reconnect for SEARCHING_OPP_SCREEN...');
            if (this._isSendingBetData) {
                this.reSend_betsData();
            } else {
                // this.searchScreen.get_searchingDataModel(this.OP_searchingDataModel);
            }
        }
        if (this.gameStateFE == GAME_STATE_FE.PLAYING_SCREEN) {
            this.reconnect_playscreen = true;
            this.reconnect_reload_playscreen = RECONNECT_RELOADING_PLAYSCREEN.PLAYSCREEN;
        }
    }
    closeIfNeed() {
        if (this._popupDisplay != null) {
            VDScreenManager.instance.hidePopup(true);
            this._popupDisplay = null;
        }
    }
    //------------- resend Data for Reconnect -------------
    public reSend_betsData() {
        // this.wsGameClient.send_BetsData(this.IP_bets_data);
    }
    //---------------- [Functions] --- Handle Data --------------------------
    handle_hintPick_dataInfo(hintPick_data: pika_hint_pick_gamePlay_dataModel) {
        this.OP_hintPick_dataModel = hintPick_data;
        this.playScreen.set_hint_pick(this.OP_hintPick_dataModel);
    }
    handlePlayerInfo(playerInfoModel: pika_PlayerInfoModel, betsInfoModel: pika_BetInfoModel) {
        if (this.gameStateFE == GAME_STATE_FE.HOME_SCREEN) {
            this.OP_player_data_model = playerInfoModel;
            this.OP_bets_data_model = betsInfoModel;
            this.get_images_player_from_URL();
        } else {
            this.OP_player_data_model = playerInfoModel;
            this.OP_bets_data_model = betsInfoModel;
            if (this._loginState == LOGIN_STATE.LOGINNING) {
                this._loginState = LOGIN_STATE.LOGIN_SUCCESS;
                this.callbackLoginSuccess && this.callbackLoginSuccess();
            }
            this.get_images_player_from_URL();
        }
    }
    handleSearching_opp_dataInfo(searching_opp_data_infoModel: pika_searchingOpp_data_model) {
        this.OP_searching_OPP_data_model = searching_opp_data_infoModel;
        this.get_images_opp_from_URL(this.OP_searching_OPP_data_model.opp_avatar);
    }
    handle_pickChessDataInfo(pickChessData_infoModel: pika_pickChess_dataModel) {
        this.OP_pickChess_data_model = pickChessData_infoModel;
        if (this.playScreen) {
            this.playScreen.draw_line_icon(this.OP_pickChess_data_model);
        }
    }
    handle_timer_playGame_dataInfo(timer_playGame_dataModel: pika_timer_playGame_dataModel) {
        this.OP_timerPlayGame_dataModel = timer_playGame_dataModel;
        if (this.playScreen) {
            this.playScreen.set_timer_playGame(this.OP_timerPlayGame_dataModel);
        }
    }
    handle_boardIcon_dataInfo(board_icon_model: number[][]) {
        if (!this.OP_boardIcon_dataModel) {
            this.OP_boardIcon_dataModel = [];
        }
        const arr = [];
        if (board_icon_model) {
            for (let i = 0; i < this.hang_number; i++) {
                let row = [];
                for (let j = 0; j < this.cot_number; j++) {
                    row.push(board_icon_model[i][j])
                }
                arr.push(row);
            }
        }
        if (this.playScreen) {
            this.playScreen.init_center_board_icon(arr);
        }
    }
    handle_reconnectDataInfo(reconnect_dataModel: pika_RECONNECTED_dataModel) {
        this.reconnect_state = RECONNECT_STATE.RECONNECT;
        this.OP_reconnect_dataModel = reconnect_dataModel;
        this.get_images_opp_from_URL(this.OP_reconnect_dataModel.oppAvatar)
    }
    handle_endGameDataInfo(endGame_dataModel: pika_endGame_dataModel) {
        this.OP_endGame_dataModel = endGame_dataModel;
        if (this.OP_endGame_dataModel.coinWin == 0) {
            this.resultStatus = WIN_LOSE_DRAW_STATUS.LOSE;
        }
        else if (this.OP_endGame_dataModel.coinWin == this.OP_bets_data_model.betAmount[this.IP_bets_data_toSever.b]) {
            this.resultStatus = WIN_LOSE_DRAW_STATUS.DRAW;
        } else {
            this.resultStatus = WIN_LOSE_DRAW_STATUS.WIN;
        }
        this.playScreen.set_endGame();
    }
    get_images_player_from_URL() {
        const imagesDir = "res/images/avatar_loading_from_URL/";
        const imageName = 'player_avatar.png';
        let imageURL = this.OP_player_data_model.avatarLink;
        //load images
        assetManager.loadRemote<ImageAsset>(imageURL, (err, ImageAsset) => {
            if (err) {
                console.error("Failed to load image:", err);
                return;
            }
            const spriteFrame = new SpriteFrame();
            const texture = new Texture2D();
            texture.image = ImageAsset;
            spriteFrame.texture = texture;
            this.avatar_for_player = spriteFrame;
        })
    }
    get_images_opp_from_URL(avatarAdd: string) {
        const imagesDir = "res/images/avatar_loading_from_URL/";
        const imageName = 'player_avatar.png';
        let imageURL = avatarAdd;
        //load images
        assetManager.loadRemote<ImageAsset>(imageURL, (err, ImageAsset) => {
            if (err) {
                console.error("Failed to load image:", err);
                return;
            }
            const spriteFrame = new SpriteFrame();
            const texture = new Texture2D();
            texture.image = ImageAsset;
            spriteFrame.texture = texture;
            this.avatar_for_opp = spriteFrame;
            if (this.searchScreen) {
                this.searchScreen.init_avatar_opp(this.avatar_for_opp, this.OP_searching_OPP_data_model.opp_name);
            }
        })
    }
    //**************************************SEND DATA TO SEVER****************************************//
    public send_betsData_toSever(bets_data: pika_bets_inputData_toSever) {
        this.IP_bets_data_toSever = bets_data;
        this.wsGameClient.send_BetsData_toSever(this.IP_bets_data_toSever);
    }
    public send_playReadyData_toSever(playReady_Data: pika_playStart_inputData_toSever) {
        this.IP_playReadyData_toSever = playReady_Data;
        this.wsGameClient.send_playReadyData_toSever(this.IP_playReadyData_toSever);
    }
    public send_pickChessData_toSever(pick_chess_data: pika_pickChess_inputData_toSever) {
        this.IP_pickChessData_toSever = pick_chess_data;
        this.wsGameClient.send_pick_icon_chessData_toSever(this.IP_pickChessData_toSever);
    }
    public send_updateMoneyData_toSever(updateMoney_data: pika_update_money_inputData_toSever) {
        this.IP_updateMoneyData_toSever = updateMoney_data;
        this.wsGameClient.send_update_moneyData_toSever(this.IP_updateMoneyData_toSever);
    }
    public send_swapIconData_toSever(swapIcon_data: pika_swapIcon_inputData_toSever) {
        this.wsGameClient.send_swapIconData_toSever(swapIcon_data);
    }
    public send_hintPickIconData_toSever(hintPickIcon_data: pika_hintPick_inputData_toSever) {
        this.wsGameClient.send_hintPickIconData_toSever(hintPickIcon_data);
    }
    public send_reconnect_playReadyData_toSever(reconnect_playReady_data: pika_reconnectReady_inputData_toSever) {
        this.wsGameClient.send_reconnectReadyData_toSever(reconnect_playReady_data);
    }
    public send_stopSearchingOppData_toSever(stopSearching_data: pika_stopSearchingOpp_inputData_ToSever) {
        this.wsGameClient.send_stopSearchingOppData_toSever(stopSearching_data);
    }
    public send_leaveGameData_toSever(leaveGameData: pika_leaveGame_inputData_toSever) {
        this.wsGameClient.send_leaveGameData_toSever(leaveGameData);
    }
}


