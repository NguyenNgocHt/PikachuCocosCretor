import { _decorator, Component, Node, Sprite, SpriteFrame, lerp, Label, Prefab } from 'cc';
import VDBaseScreen from '../../../../vd-framework/ui/VDBaseScreen';
import { GAME_STATE_FE, pika_Director } from '../core/pika_Director';
import VDScreenManager from '../../../../vd-framework/ui/VDScreenManager';
import { pika_Path } from '../common/pika_Define';
import { pika_playScreen } from './pika_playScreen';
import { pika_bets_inputData_toSever } from '../model/pika_input_to_sever_data';
import { pika_CommandID_IP } from '../network/pika_NetworkDefine';
import { pika_BetInfoModel } from '../model/pika_Loading_data_model';
import { labelAssembler } from 'cc';
import { pika_searchingScreen } from './pika_searchingScreen';
import VDBasePopup from '../../../../vd-framework/ui/VDBasePopup';
import { pika_PS_audioPlays } from '../play_ts/pika_PS_audioPlays';
import { tween } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('pika_homeScreen')
export class pika_homeScreen extends VDBaseScreen {
    private top_group: Node = null;
    private bottom_group: Node = null;
    private IP_betsData_toSever: pika_bets_inputData_toSever = null;
    private OP_betsDataModel: pika_BetInfoModel = null;
    private best_index: number = 0;
    private home_setting_popup: VDBasePopup = null!;
    private audioPlay: pika_PS_audioPlays = null;
    onLoad() {
        this.top_group = this.node.getChildByName('top_group');
        this.bottom_group = this.node.getChildByName('bottom_group');
        this.audioPlay = this.node.getComponent(pika_PS_audioPlays);
    }
    start() {
        this.audioPlay.start_nhacnen();
        this.init_top_group(pika_Director.instance.avatar_for_player, pika_Director.instance.OP_player_data_model.displayName,
            pika_Director.instance.OP_player_data_model.money);
    }

    init_top_group(avatar_player: SpriteFrame, user_name: string, money_player: number) {
        this.set_avatar_and_name_for_player(avatar_player, user_name);
        this.set_money_for_player(money_player);
        this.init_bets_list();
    }
    set_avatar_and_name_for_player(avatar_for_player: SpriteFrame, user_name: string) {
        let avatar_Node = this.top_group.getChildByPath("img_box/img_ava/avatar");
        let name_player_Node = this.top_group.getChildByPath("img_box/player_name");
        let sprite_avatar = avatar_Node.getComponent(Sprite);
        let label_name = name_player_Node.getComponent(Label);
        sprite_avatar.spriteFrame = avatar_for_player;
        label_name.string = user_name;
    }
    set_money_for_player(money_player: number) {
        let score_Node = this.top_group.getChildByPath("img_box/score");
        let label_score = score_Node.getComponent(Label);
        label_score.string = `${money_player}`;
    }
    init_bets_list() {
        this.OP_betsDataModel = pika_Director.instance.OP_bets_data_model;
        for (let i = 0; i < this.OP_betsDataModel.betAmount.length; i++) {
            let best_icon_add = 'bottom_group/' + 'Layer' + `${i + 1}` + '/' + 'button' + `${i + 1}` + '/' + `${this.OP_betsDataModel.betAmount[i]}`
            let best_node = this.node.getChildByPath(best_icon_add);
            let label_best = best_node.getComponent(Label);
            label_best.string = `${this.OP_betsDataModel.betAmount[i]}`;
        }
    }
    //onclick button play moving playScreen
    onclick_button_best(event: TouchEvent, bets: number) {
        for (let i = 0; i < this.OP_betsDataModel.betAmount.length; i++) {
            if (this.OP_betsDataModel.betAmount[i] == bets) {
                this.best_index = i;
            }
        }
        this.send_bets_data_toSever(this.best_index);
        let searching_screen = VDScreenManager.instance.assetBundle.get(pika_Path.SEARCH_SCREEN, Prefab)!;
        VDScreenManager.instance.replaceScreenAtIndex(searching_screen, 0, (screen: VDBaseScreen) => {
            pika_Director.instance.gameStateFE = GAME_STATE_FE.SEARCHING_OPP_SCREEN;
            pika_Director.instance.searchScreen = screen as pika_searchingScreen;
        });
    }
    //***********function fake**************** */
    send_bets_data_toSever(best_index: number) {
        this.IP_betsData_toSever = {
            id: pika_CommandID_IP.BETS_IP,
            b: best_index,
        };
        pika_Director.instance.send_betsData_toSever(this.IP_betsData_toSever);
    }
    click_button_setting() {
        VDScreenManager.instance.showPopupFromPrefabName(pika_Path.SETTING_POPUP, (popup: VDBasePopup) => {
            this.home_setting_popup = popup;
            let callbacks = [() => {
                VDScreenManager.instance.hidePopup(true);
            }];
        }, false, true, true);
    }
    onCLick_soundEffect() {
        this.audioPlay.effect_clickButton();
    }
}


