import { _decorator, Component, Node, Prefab } from 'cc';
import { pika_PlayerInfoModel } from '../model/pika_Loading_data_model';
import { pika_seaching_start_data, pika_searchingOpp_data_model } from '../model/pika_searching_data_model';
import { pika_Director } from '../core/pika_Director';
import { SpriteFrame } from 'cc';
import { pika_seaching_avatar_waiting, SEARCHING_COMEBACK_STATUS, SEARCHING_STATUS } from '../common/pika_Define';
import { Label } from 'cc';
import { Sprite } from 'cc';
import { pika_Path } from '../common/pika_Define';
import VDScreenManager from '../../../../vd-framework/ui/VDScreenManager';
import { SpriteAtlas } from 'cc';
import { Tween } from 'cc';
import { tween } from 'cc';
import { Vec3 } from 'cc';
import VDBaseScreen from '../../../../vd-framework/ui/VDBaseScreen';
import { GAME_STATE_FE } from '../core/pika_Director';
import { pika_playScreen } from './pika_playScreen';
import { pika_bets_inputData_toSever, pika_stopSearchingOpp_inputData_ToSever } from '../model/pika_input_to_sever_data';
import { pika_CommandID_IP } from '../network/pika_NetworkDefine';
import { pika_homeScreen } from './pika_homeScreen';
import { pika_PS_audioPlays } from '../play_ts/pika_PS_audioPlays';
const { ccclass, property } = _decorator;

@ccclass('pika_searchingScreen')
export class pika_searchingScreen extends VDBaseScreen {
    private OP_player_dataModel: pika_PlayerInfoModel = null;
    private OP_searching_oppDataModel: pika_searchingOpp_data_model = null;
    private searching_start_data: pika_seaching_start_data = null;
    private player_group: Node = null;
    private opp_group: Node = null;
    private cancelButton: Node = null;
    private tweenStop!: Tween<Node>;
    private IP_stopSearchingOpp_inputToSever: pika_stopSearchingOpp_inputData_ToSever = null;
    private searching_status: SEARCHING_STATUS = SEARCHING_STATUS.NO_STATUS;
    private IP_sendBestData_toSever: pika_bets_inputData_toSever = null;
    private IP_betData_toSever: pika_bets_inputData_toSever = null;
    private audioplay: pika_PS_audioPlays = null;

    onLoad() {
        this.audioplay = this.node.getComponent(pika_PS_audioPlays);
        this.OP_player_dataModel = pika_Director.instance.OP_player_data_model;
        this.player_group = this.node.getChildByName('player_group');
        this.opp_group = this.node.getChildByName('opp_group');
        this.cancelButton = this.node.getChildByName('img_button');
        this.searching_start_data = {
            seaching_avatar_name: pika_seaching_avatar_waiting.AVATAR_NAME,
            searching_text: pika_seaching_avatar_waiting.SEARCHING_TEXT,
        }
    }
    start() {
        this.IP_betData_toSever = pika_Director.instance.IP_bets_data_toSever;
        this.init_player_group(pika_Director.instance.avatar_for_player, this.OP_player_dataModel.displayName);
        this.init_opp_group();
        if (pika_Director.instance.searchingComebackStatus == SEARCHING_COMEBACK_STATUS.SEARCHING_COMEBACK) {
            this.IP_sendBestData_toSever = {
                id: pika_CommandID_IP.BETS_IP,
                b: this.IP_betData_toSever.b,
            };
            pika_Director.instance.send_betsData_toSever(this.IP_sendBestData_toSever);
            pika_Director.instance.searchingComebackStatus = SEARCHING_COMEBACK_STATUS.NO_STATUS;
        }
    }
    init_player_group(player_avatar: SpriteFrame, player_name: string) {
        let playerNameNode = this.player_group.getChildByName('name_player');
        let avatarNode = this.player_group.getChildByPath('img_button_avt/mask_avatar/avatar');
        let labelNamePlayer = playerNameNode.getComponent(Label);
        let spriteAvatar = avatarNode.getComponent(Sprite);
        spriteAvatar.spriteFrame = player_avatar;
        labelNamePlayer.string = player_name;
    }
    init_opp_group() {
        this.init_waiting(this.searching_start_data.seaching_avatar_name, this.searching_start_data.searching_text);
    }
    init_waiting(waiting_avatar_name: string, searching_text: string) {
        this.searching_status = SEARCHING_STATUS.SEARCHING;
        let sprite_frame = new SpriteFrame();
        let sprite_atlas_add = pika_Path.TEXTURE_ATLAS_ADD;
        let sprite_atlas = VDScreenManager.instance.assetBundle.get(sprite_atlas_add, SpriteAtlas);
        sprite_frame = sprite_atlas.getSpriteFrame(waiting_avatar_name);
        let avatar_waiting_node = this.opp_group.getChildByPath('img_button_avt/mask_avatar/avatar');
        let sprite_avatar = avatar_waiting_node.getComponent(Sprite);
        sprite_avatar.spriteFrame = sprite_frame;
        this.SearchingPlay();
    }
    SearchingPlay() {
        let img_waitingNode = this.opp_group.getChildByName('img_waiting');
        let searchingPlay = tween(img_waitingNode)
            .by(1, { eulerAngles: new Vec3(0, 0, -360) })
            .repeatForever()
        this.tweenStop = tween(img_waitingNode)
            .then(searchingPlay)
    }
    onEnable() {
        this.scheduleOnce(function () {
            this.tweenStop.start();
        }, 0.1);
    }
    init_avatar_opp(opp_avatar: SpriteFrame, opp_name: string) {
        let opp_nameNode = this.opp_group.getChildByName('opp_name');
        let opp_avatarNode = this.opp_group.getChildByPath('img_button_avt/mask_avatar/avatar');
        let label_nameOpp = opp_nameNode.getComponent(Label);
        let sprite_avatarOpp = opp_avatarNode.getComponent(Sprite);
        label_nameOpp.string = opp_name;
        sprite_avatarOpp.spriteFrame = opp_avatar;
        this.TweenStop();
        tween(this.node)
            .delay(2)
            .call(() => {
                this.MoveToPlayScreen();
            })
            .start();
    }
    TweenStop() {
        this.tweenStop.stop();
        this.searching_status = SEARCHING_STATUS.FIND_A_OPP;
        let imgWaiting = this.opp_group.getChildByName('img_waiting');
        imgWaiting.active = false;
    }
    MoveToPlayScreen() {
        let playScreen = VDScreenManager.instance.assetBundle.get(pika_Path.PLAY_SCREEN, Prefab)!;
        VDScreenManager.instance.replaceScreenAtIndex(playScreen, 0, (screen: VDBaseScreen) => {
            pika_Director.instance.gameStateFE = GAME_STATE_FE.PLAYING_SCREEN;
            pika_Director.instance.playScreen = screen as pika_playScreen;
        });
    }
    stop_searchingOpp() {
        if (this.searching_status == SEARCHING_STATUS.SEARCHING) {
            this.IP_stopSearchingOpp_inputToSever = {
                id: pika_CommandID_IP.STOP_MACHING_IP,
                b: pika_Director.instance.IP_bets_data_toSever.b,
            };
            pika_Director.instance.send_stopSearchingOppData_toSever(this.IP_stopSearchingOpp_inputToSever);
            let homeScreen = VDScreenManager.instance.assetBundle.get(pika_Path.HOME_SCREEN, Prefab)!;
            VDScreenManager.instance.replaceScreenAtIndex(homeScreen, 0, (screen: VDBaseScreen) => {
                pika_Director.instance.gameStateFE = GAME_STATE_FE.HOME_SCREEN
                pika_Director.instance.homeScreen = screen as pika_homeScreen;
            });
        }
    }
    onClick_soundEffect() {
        this.audioplay.effect_clickButton();
    }
    update(deltaTime: number) {

    }
}


