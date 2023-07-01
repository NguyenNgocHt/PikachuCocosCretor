import { _decorator, Component, Node, SpriteFrame, SpriteAtlas } from 'cc';
import { ICON_MOVING_STATUS, ICON_OLD_NEW_STATUS, pika_chess_icon_properties } from '../common/pika_Define';
import { pika_PS_initPrefabs_icon } from './pika_PS_initPrefabs_icon';
import { pika_GAME_STATE_EVENT } from '../network/pika_NetworkDefine';
import { VDEventListener } from '../../../../vd-framework/common/VDEventListener';
import { pika_Path } from '../common/pika_Define';
import { UITransform } from 'cc';
import { tween } from 'cc';
import { Vec3 } from 'cc';
import { Label } from 'cc';
import { spriteAssembler } from 'cc';
import { Sprite } from 'cc';
import VDScreenManager from '../../../../vd-framework/ui/VDScreenManager';
import { MOVINGNEXT_STATUS, UPNEXT_STATUS } from '../common/pika_Define';
const { ccclass, property } = _decorator;
@ccclass('pika_PS_get_cot_hang_icon_chess')

export class pika_PS_get_cot_hang_icon_chess extends Component {
    public chess_properties: pika_chess_icon_properties = null;
    private distance_slit_2_icon: number = 4;
    public count_up: number = 0;
    public count_down: number = 0;
    private label_icon: Label = null;
    public node_img_icon_bg: Node = null;
    private node_img_pika: Node = null;
    public oid_new_status: ICON_OLD_NEW_STATUS = ICON_OLD_NEW_STATUS.NO_STATUS;
    public movingNext_status: MOVINGNEXT_STATUS = MOVINGNEXT_STATUS.NO_STATUS;
    public count_downNext: number = 0;
    public count_upNext: number = 0;
    private bg_icon_white: string = 'img_bgIconPress';
    private bg_icon_yellow: string = 'img_bgIcon';

    start() {
        this.node.on(Node.EventType.TOUCH_START, this.get_properties_icon.bind(this));
        this.node_img_icon_bg = this.node.getChildByName('img_icon');
        this.label_icon = this.node_img_icon_bg.getChildByName('number').getComponent(Label);
        this.node_img_pika = this.node_img_icon_bg.getChildByName('img_pika');
    }

    get_properties_icon() {
        if (this.chess_properties.status_vanhdai == false && this.chess_properties.status_icon == true && this.chess_properties.moving_status == ICON_MOVING_STATUS.NO_STATUS) {
            this.set_BG_icon(this.bg_icon_yellow);
            VDEventListener.dispatchEvent(pika_GAME_STATE_EVENT.ICON_CHESS_PROPERTIES_1, this.chess_properties);
        }
    }
    set_BG_icon(bg_name: string) {
        let sprite_img_BGIcon = this.node_img_icon_bg.getComponent(Sprite);
        sprite_img_BGIcon.spriteFrame = null;
        let sprite_frame_iconBG = new SpriteFrame;
        let sprite_icon_add = pika_Path.TEXTURE_ATLAS_ADD;
        let sprite_atlas = VDScreenManager.instance.assetBundle.get(sprite_icon_add, SpriteAtlas);
        let spriteFrame_name_BGIcon = bg_name;
        sprite_frame_iconBG = sprite_atlas.getSpriteFrame(spriteFrame_name_BGIcon);
        sprite_img_BGIcon.spriteFrame = sprite_frame_iconBG;
    }
    set_properties_icon(new_properties_icon: pika_chess_icon_properties) {
        this.chess_properties = {
            name: new_properties_icon.name,
            cot: new_properties_icon.cot,
            hang: new_properties_icon.hang,
            status_vanhdai: new_properties_icon.status_vanhdai,
            status_icon: new_properties_icon.status_icon,
            pos_X: new_properties_icon.pos_X,
            pos_Y: new_properties_icon.pos_Y,
            width: new_properties_icon.width,
            height: new_properties_icon.height,
            hollow: new_properties_icon.hollow,
            moving_status: new_properties_icon.moving_status,
            movingNext_status: new_properties_icon.movingNext_status,
        }
    }
    set_label_icon(Show_label: string) {
        this.label_icon.string = Show_label;
    }

    set_icon_moving() {
        if (this.chess_properties.moving_status == ICON_MOVING_STATUS.MOVING_UP) {
            let pos_origin = this.node_img_icon_bg.getPosition();
            tween(this.node_img_icon_bg)
                .to(0.1, { position: new Vec3(pos_origin.x, pos_origin.y + this.count_up * (this.chess_properties.height + this.distance_slit_2_icon), 0) })
                .call(() => {
                    if (this.chess_properties.movingNext_status == MOVINGNEXT_STATUS.NO_STATUS) {
                        this.count_up = 0;
                        let sprite_img_icon = this.node_img_icon_bg.getComponent(Sprite);
                        let sprite_img_pika = this.node_img_pika.getComponent(Sprite);
                        sprite_img_icon.spriteFrame = null;
                        sprite_img_pika.spriteFrame = null;
                        this.node_img_icon_bg.setPosition(0, 0, 0);
                        this.label_icon.string = " ";
                        VDEventListener.dispatchEvent(pika_GAME_STATE_EVENT.ICON_MOVING_END, this.chess_properties.cot);
                    }
                    else if (this.chess_properties.movingNext_status == MOVINGNEXT_STATUS.UP_NEXT) {
                        let pos_originNext = this.node_img_icon_bg.getPosition();
                        tween(this.node_img_icon_bg)
                            .to(0.1, { position: new Vec3(pos_originNext.x, pos_originNext.y + this.count_upNext * (this.chess_properties.height + this.distance_slit_2_icon), 0) })
                            .call(() => {
                                this.count_upNext = 0;
                                let sprite_img_icon = this.node_img_icon_bg.getComponent(Sprite);
                                let sprite_img_pika = this.node_img_pika.getComponent(Sprite);
                                sprite_img_icon.spriteFrame = null;
                                sprite_img_pika.spriteFrame = null;
                                this.node_img_icon_bg.setPosition(0, 0, 0);
                                this.label_icon.string = " ";
                                VDEventListener.dispatchEvent(pika_GAME_STATE_EVENT.ICON_MOVING_END, this.chess_properties.cot);
                            })
                            .start();
                    }
                })
                .start();
        }

        if (this.chess_properties.moving_status == ICON_MOVING_STATUS.MOVING_DOWN) {
            let pos_origin = this.node_img_icon_bg.getPosition();
            tween(this.node_img_icon_bg)
                .to(0.1, { position: new Vec3(pos_origin.x, pos_origin.y - this.count_down * (this.chess_properties.height + this.distance_slit_2_icon), 0) })
                .call(() => {
                    if (this.chess_properties.movingNext_status == MOVINGNEXT_STATUS.NO_STATUS) {
                        this.count_down = 0;
                        let sprite_img_icon = this.node_img_icon_bg.getComponent(Sprite);
                        let sprite_img_pika = this.node_img_pika.getComponent(Sprite);
                        sprite_img_icon.spriteFrame = null;
                        sprite_img_pika.spriteFrame = null;
                        this.node_img_icon_bg.setPosition(0, 0, 0);
                        this.label_icon.string = " ";
                        VDEventListener.dispatchEvent(pika_GAME_STATE_EVENT.ICON_MOVING_END, this.chess_properties.cot);
                    }
                    else if (this.chess_properties.movingNext_status == MOVINGNEXT_STATUS.DOWN_NEXT) {
                        let pos_originNext = this.node_img_icon_bg.getPosition();
                        tween(this.node_img_icon_bg)
                            .to(0.1, { position: new Vec3(pos_originNext.x, pos_originNext.y - this.count_downNext * (this.chess_properties.height + this.distance_slit_2_icon), 0) })
                            .call(() => {
                                this.count_downNext = 0;
                                let sprite_img_icon = this.node_img_icon_bg.getComponent(Sprite);
                                let sprite_img_pika = this.node_img_pika.getComponent(Sprite);
                                sprite_img_icon.spriteFrame = null;
                                sprite_img_pika.spriteFrame = null;
                                this.node_img_icon_bg.setPosition(0, 0, 0);
                                this.label_icon.string = " ";
                                VDEventListener.dispatchEvent(pika_GAME_STATE_EVENT.ICON_MOVING_END, this.chess_properties.cot);
                            })
                            .start();
                    }
                })
                .start();
        }
    }
    set_moving_next() {
        if (this.movingNext_status == MOVINGNEXT_STATUS.DOWN_NEXT) {

        }
        if (this.movingNext_status == MOVINGNEXT_STATUS.UP_NEXT) {

        }
    }

}


