import { _decorator, Component, Node } from 'cc';
import { pika_Director } from '../core/pika_Director';
import { pika_searchingOpp_data_model } from '../model/pika_searching_data_model';
import { pika_PlayerInfoModel } from '../model/pika_Loading_data_model';
import { SpriteFrame } from 'cc';
import { Sprite } from 'cc';
import { Label } from 'cc';
import { tween } from 'cc';
import { ProgressBar } from 'cc';
import { pika_pickChess_dataModel } from '../model/pika_play_data_model';
import { labelAssembler } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('pika_PS_topGroup')
export class pika_PS_topGroup extends Component {
    private OP_searching_data_model: pika_searchingOpp_data_model = null;
    private OP_player_data_model: pika_PlayerInfoModel = null;
    private avatar_opp: Node = null;
    private avatar_player: Node = null;
    private progressBar: Node = null;
    private time_round_game: number = 120;
    private time_start: number = 0;
    onLoad() {
        this.OP_player_data_model = pika_Director.instance.OP_player_data_model;
        this.OP_searching_data_model = pika_Director.instance.OP_searching_OPP_data_model;
        this.avatar_opp = this.node.getChildByName('avatar_opp');
        this.avatar_player = this.node.getChildByName('avatar_player');
        this.progressBar = this.node.getChildByName('progress_Bar_play_time');
    }
    init_avatar(oppAvatar: SpriteFrame, opp_Name: string, playerAvatar: SpriteFrame, playerName: string) {
        this.init_opp(oppAvatar, opp_Name);
        this.init_player(playerAvatar, playerName);
    }
    init_opp(avatar_spriteFrame: SpriteFrame, name_user: string) {
        let avatar_Node = this.avatar_opp.getChildByPath('avatar_mask/avatar');
        let name_Node = this.avatar_opp.getChildByName('name');
        let sprite_avatar = avatar_Node.getComponent(Sprite);
        let label_name = name_Node.getComponent(Label);
        sprite_avatar.spriteFrame = avatar_spriteFrame;
        label_name.string = name_user;
    }
    init_player(avatar_spriteFrame: SpriteFrame, name_user: string) {
        let avatar_Node = this.avatar_player.getChildByPath('avatar_mask/avatar');
        let name_Node = this.avatar_player.getChildByName('name');
        let sprite_avatar = avatar_Node.getComponent(Sprite);
        let label_name = name_Node.getComponent(Label);
        sprite_avatar.spriteFrame = avatar_spriteFrame;
        label_name.string = name_user;
    }
    init_progressbar_from_sever(time_start: number) {
        let time = time_start;
        let progress_time_game = this.progressBar.getComponent(ProgressBar);
        tween(progress_time_game)
            .to(1, { progress: time_start / this.time_round_game })
            .start();
    }
    update_showPoint_player(totalPoint: number) {
        let showPoint_node = this.node.getChildByPath('avatar_player/show_point/point');
        let label_showPoint = showPoint_node.getComponent(Label);
        label_showPoint.string = `${totalPoint}`;
    }
    update_showPoint_opp(totalPoint: number) {
        let showPoint_node = this.node.getChildByPath('avatar_opp/show_point/point');
        let label_showPoint = showPoint_node.getComponent(Label);
        label_showPoint.string = `${totalPoint}`;
    }
}


