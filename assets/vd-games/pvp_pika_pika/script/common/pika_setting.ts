import { _decorator, Component, Node, Prefab } from 'cc';
import VDScreenManager from '../../../../vd-framework/ui/VDScreenManager';
import { GAME_STATE_FE, pika_Director } from '../core/pika_Director';
import { ON_OFF_STATE, pika_Path } from './pika_Define';
import VDBasePopup from '../../../../vd-framework/ui/VDBasePopup';
import { pika_loadingScreen } from '../screens/pika_loadingScreen';
import VDBaseScreen from '../../../../vd-framework/ui/VDBaseScreen';
import { pika_PS_audioPlays } from '../play_ts/pika_PS_audioPlays';
import { pika_homeScreen } from '../screens/pika_homeScreen';
import { pika_leaveGame_inputData_toSever } from '../model/pika_input_to_sever_data';
import { pika_seaching_start_data, pika_searchingOpp_data_model } from '../model/pika_searching_data_model';
import { pika_CommandID_IP } from '../network/pika_NetworkDefine';

const { ccclass, property } = _decorator;

@ccclass('pika_setting')
export class pika_setting extends VDBasePopup {
    private audioPlay: pika_PS_audioPlays = null;
    private handCatForNodeMusic: Node = null;
    private handCatforNodeFsx: Node = null;
    private IP_leaveGameData: pika_leaveGame_inputData_toSever = null;
    private OP_searchingOpp_dataModel: pika_searchingOpp_data_model = null;
    onLoad() {
        this.audioPlay = this.node.getComponent(pika_PS_audioPlays);
        this.handCatForNodeMusic = this.node.getChildByPath('img_board/img_music/img_nut/img_hand');
        this.handCatforNodeFsx = this.node.getChildByPath('img_board/img_SFX/img_nut/img_hand');
    }
    start() {
        this.SetButton_status();
        this.set_buttonSfxStatus();
    }
    onClick_music_setting() {
        pika_Director.instance.count_music_button_press = pika_Director.instance.count_music_button_press + 1;
        if (pika_Director.instance.count_music_button_press == 1) {
            this.audioPlay.music_pause();
            this.audioPlay.stop_audioPlay();
            pika_Director.instance.music_button_on_off_state = ON_OFF_STATE.OFF;
            this.SetButton_status();
        }
        else if (pika_Director.instance.count_music_button_press == 2) {
            this.audioPlay.resume_nhacnen();
            pika_Director.instance.music_button_on_off_state = ON_OFF_STATE.ON;
            pika_Director.instance.count_music_button_press = 0;
            this.SetButton_status();
        }
    }
    SetButton_status() {
        if (pika_Director.instance.music_button_on_off_state == ON_OFF_STATE.OFF) {
            this.handCatForNodeMusic.active = false;
        }
        else if (pika_Director.instance.music_button_on_off_state == ON_OFF_STATE.ON) {
            this.handCatForNodeMusic.active = true;
        }
    }
    onClick_SFX_setting() {
        pika_Director.instance.count_sfx_button_press = pika_Director.instance.count_sfx_button_press + 1;
        if (pika_Director.instance.count_sfx_button_press == 1) {
            this.audioPlay.effect_stop_all();
            pika_Director.instance.sfx_button_on_off_state = ON_OFF_STATE.OFF;
            this.set_buttonSfxStatus();
        }
        else if (pika_Director.instance.count_sfx_button_press == 2) {
            this.audioPlay.effect_play_all();
            pika_Director.instance.sfx_button_on_off_state = ON_OFF_STATE.ON;
            pika_Director.instance.count_sfx_button_press = 0;
            this.set_buttonSfxStatus();
        }
    }
    set_buttonSfxStatus() {
        if (pika_Director.instance.sfx_button_on_off_state == ON_OFF_STATE.ON) {
            this.handCatforNodeFsx.active = true;
        }
        else if (pika_Director.instance.sfx_button_on_off_state == ON_OFF_STATE.OFF) {
            this.handCatforNodeFsx.active = false;
        }
    }
    onClick_exit_button() {
        if (pika_Director.instance.gameStateFE == GAME_STATE_FE.HOME_SCREEN) {
            let loading_screen = VDScreenManager.instance.assetBundle.get(pika_Path.LOADING_SCREEN, Prefab);
            VDScreenManager.instance.replaceScreenAtIndex(loading_screen, 0, (screen: VDBaseScreen) => {
                pika_Director.instance.gameStateFE = GAME_STATE_FE.LOADING_SCREEN;
                pika_Director.instance.LoadingScreen = screen as pika_loadingScreen
            });
        }
        else if (pika_Director.instance.gameStateFE == GAME_STATE_FE.PLAYING_SCREEN) {
            this.OP_searchingOpp_dataModel = pika_Director.instance.OP_searching_OPP_data_model;
            this.IP_leaveGameData = {
                id: pika_CommandID_IP.PLAYING_LEAVE_GAME_IP,
                r: this.OP_searchingOpp_dataModel.roomID,
            };
            pika_Director.instance.send_leaveGameData_toSever(this.IP_leaveGameData);
            let homeScreen = VDScreenManager.instance.assetBundle.get(pika_Path.HOME_SCREEN, Prefab)!;
            VDScreenManager.instance.replaceScreenAtIndex(homeScreen, 0, (screen: VDBaseScreen) => {
                pika_Director.instance.gameStateFE = GAME_STATE_FE.HOME_SCREEN;
                pika_Director.instance.homeScreen = screen as pika_homeScreen;
            });
        }


        this.hide();
    }
    onClick_button_X() {
        this.hide();
    }
    onClick_soundEffect() {
        this.audioPlay.effect_clickButton();
    }
}


