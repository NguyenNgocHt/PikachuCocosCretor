import { _decorator, Component, Node, Prefab } from 'cc';
import VDBaseScreen from '../../../../vd-framework/ui/VDBaseScreen';
import { pika_Director } from '../core/pika_Director';
import { SEARCHING_COMEBACK_STATUS, WIN_LOSE_DRAW_STATUS } from '../common/pika_Define';
import { TERRAIN_SOUTH_INDEX } from 'cc';
import { Label } from 'cc';
import VDScreenManager from '../../../../vd-framework/ui/VDScreenManager';
import { pika_Path } from '../common/pika_Define';
import { GAME_STATE_FE } from '../core/pika_Director';
import { pika_homeScreen } from './pika_homeScreen';
import { RECONNECT_STATE } from '../common/pika_Define';
import { pika_searchingScreen } from './pika_searchingScreen';
import { pika_PS_audioPlays } from '../play_ts/pika_PS_audioPlays';
const { ccclass, property } = _decorator;

@ccclass('pika_resultScreen')
export class pika_resultScreen extends VDBaseScreen {
    private loseGroup: Node = null;
    private winGroup: Node = null;
    private drawGroup: Node = null;
    private showBonus: Node = null;
    private audioPlay: pika_PS_audioPlays = null;

    onLoad() {
        this.loseGroup = this.node.getChildByName('lose_group');
        this.winGroup = this.node.getChildByName('win_group');
        this.drawGroup = this.node.getChildByName('draw_group');
        this.showBonus = this.node.getChildByPath('img_Background/img_Nen1/img_Nen2/img_tien/money');
        this.audioPlay = this.node.getComponent(pika_PS_audioPlays);

    }
    start() {
        this.Show_resultGame();
        this.Show_bonus();
    }
    Show_resultGame() {
        if (pika_Director.instance.resultStatus == WIN_LOSE_DRAW_STATUS.LOSE) {
            this.audioPlay.effect_lose_game();
            this.winGroup.active = false;
            this.drawGroup.active = false;
            this.loseGroup.active = true;
        }
        else if (pika_Director.instance.resultStatus == WIN_LOSE_DRAW_STATUS.WIN) {
            this.audioPlay.effect_win_game();
            this.loseGroup.active = false;
            this.drawGroup.active = false;
            this.winGroup.active = true;
        }
        else if (pika_Director.instance.resultStatus == WIN_LOSE_DRAW_STATUS.DRAW) {
            this.audioPlay.effect_drawGame();
            this.winGroup.active = false;
            this.loseGroup.active = false;
            this.drawGroup.active = true;
        }
    }

    Show_bonus() {
        let label_bonus = this.showBonus.getComponent(Label);
        label_bonus.string = `${pika_Director.instance.OP_endGame_dataModel.coinWin}`;
    }
    Home_comeBack() {
        let homeScreen = VDScreenManager.instance.assetBundle.get(pika_Path.HOME_SCREEN, Prefab)!;
        VDScreenManager.instance.replaceScreenAtIndex(homeScreen, 0, (screen: VDBaseScreen) => {
            pika_Director.instance.gameStateFE = GAME_STATE_FE.HOME_SCREEN
            pika_Director.instance.homeScreen = screen as pika_homeScreen;
            pika_Director.instance.reconnect_state = RECONNECT_STATE.NORMAL_CONNECT;
        });
    }
    KeepFighting() {
        pika_Director.instance.searchingComebackStatus = SEARCHING_COMEBACK_STATUS.SEARCHING_COMEBACK;
        let searching_screen = VDScreenManager.instance.assetBundle.get(pika_Path.SEARCH_SCREEN, Prefab);
        VDScreenManager.instance.replaceScreenAtIndex(searching_screen, 0, (screen: VDBaseScreen) => {
            pika_Director.instance.gameStateFE = GAME_STATE_FE.SEARCHING_OPP_SCREEN;
            pika_Director.instance.searchScreen = screen as pika_searchingScreen
            pika_Director.instance.reconnect_state = RECONNECT_STATE.NORMAL_CONNECT;
        });
    }
    onClick_suondEffect() {
        this.audioPlay.effect_clickButton();
    }
}


