import { _decorator, Component, Node } from 'cc';
import { VDAudioManager } from '../../../../vd-framework/audio/VDAudioManager';
import { pika_Director } from '../core/pika_Director';
import { ON_OFF_STATE } from '../common/pika_Define';
const { ccclass, property } = _decorator;
enum EFFECT_STATE {
    NO_STATE,
    ON,
    OFF,
}
@ccclass('pika_PS_audioPlays')
export class pika_PS_audioPlays extends Component {
    onLoad() {
        VDAudioManager.instance.effectVolume = 1;
    }
    start() {
    }
    start_nhacnen() {
        pika_Director.instance.count_audioPlayNhacNen = pika_Director.instance.count_audioPlayNhacNen + 1;

        if (pika_Director.instance.music_on_off_state == ON_OFF_STATE.ON && pika_Director.instance.count_audioPlayNhacNen == 1) {
            VDAudioManager.instance.musicVolume = 0.3;
            VDAudioManager.instance.playBGM('nhacNenPikaPika');
        }
    }
    stop_audioPlay() {

        if (pika_Director.instance.music_on_off_state == ON_OFF_STATE.OFF) {
            VDAudioManager.instance.pauseBGM();
        }
    }
    stop_music_home() {
        VDAudioManager.instance.pauseBGM();
    }
    resume_nhacnen() {
        VDAudioManager.instance.resumeBGM();
    }
    effect_clickButton() {
        if (pika_Director.instance.sfx_on_off_state == ON_OFF_STATE.ON) {
            VDAudioManager.instance.playEffect("clickbutton");
        }
    }
    effect_chooseRight() {
        if (pika_Director.instance.sfx_on_off_state == ON_OFF_STATE.ON) {
            VDAudioManager.instance.playEffect('correctASW');
        }
    }
    effect_drawGame() {
        if (pika_Director.instance.sfx_on_off_state == ON_OFF_STATE.ON) {
            VDAudioManager.instance.playEffect('drawGame');
        }
    }
    effect_chooseWrong() {
        if (pika_Director.instance.sfx_on_off_state == ON_OFF_STATE.ON) {
            VDAudioManager.instance.playEffect('wrongAsway');
        }
    }
    effect_lose_game() {
        if (pika_Director.instance.sfx_on_off_state == ON_OFF_STATE.ON) {
            VDAudioManager.instance.playEffect("loseGame");
        }
    }
    effect_win_game() {
        if (pika_Director.instance.sfx_on_off_state == ON_OFF_STATE.ON) {
            VDAudioManager.instance.playEffect("soundWin");
        }
    }
    effect_stop_all() {
        pika_Director.instance.sfx_on_off_state = ON_OFF_STATE.OFF
    }
    effect_play_all() {
        pika_Director.instance.sfx_on_off_state = ON_OFF_STATE.ON
    }
    music_play() {
        pika_Director.instance.music_on_off_state = ON_OFF_STATE.ON;
    }
    music_pause() {
        pika_Director.instance.music_on_off_state = ON_OFF_STATE.OFF;
    }
    //rung 2s
    effect_vibrate() {
        navigator.vibrate(2000);
        setTimeout(() => {
            navigator.vibrate(0);
        }, 2000);
    }
}


