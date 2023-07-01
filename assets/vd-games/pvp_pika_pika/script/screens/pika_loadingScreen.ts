
import { ProgressBar } from 'cc';
import { Label } from 'cc';
import { AudioClip, assetManager, Asset, Button, utils, sp, Prefab, tween, Vec3, Size } from 'cc';
import { sys } from 'cc';
import { _decorator, Component, log } from 'cc';
import { VDAudioManager } from '../../../../vd-framework/audio/VDAudioManager';
import VDLocalDataManager from '../../../../vd-framework/common/VDLocalDataManager';
import VDBasePopup from '../../../../vd-framework/ui/VDBasePopup';
import VDBaseScreen from '../../../../vd-framework/ui/VDBaseScreen';
import VDScreenManager from '../../../../vd-framework/ui/VDScreenManager';
import { pika_Config } from '../common/pika_config';
import { RECONNECT_RELOADING_PLAYSCREEN, RECONNECT_STATE, pika_Path, pika_Text } from '../common/pika_Define';
import { GAME_STATE_FE, LOGIN_STATE, pika_Director } from '../core/pika_Director';
import { pika_PopupNotify } from '../popups/pika_PopupNotify';
import { pika_WaitingProgress } from '../popups/pika_WaitingProgress';
import { pika_homeScreen } from './pika_homeScreen';
import { pika_playScreen } from './pika_playScreen';
import { EditBox } from 'cc';
import { UITransform } from 'cc';
import { pika_PS_audioPlays } from '../play_ts/pika_PS_audioPlays';
enum reconectState {
    nostate,
    normalConnect,
    reconnect,
}
enum connectState {
    nostate,
    success,
    false,
}
const { ccclass, property } = _decorator;

@ccclass('pika_loadingScreen')
export class pika_loadingScreen extends VDBaseScreen {
    private reconnect_state: reconectState = reconectState.normalConnect;
    @property(ProgressBar)
    loadingProgress: ProgressBar = null!;
    @property(Label)
    lbVersion: Label = null!;
    @property(Button)
    btnGoHomeScreen: Button = null!;
    private _audios: { [key: string]: string } = {};
    private _items: string[] = [];
    private _isLoading: boolean = false;
    private _isLoginning: boolean = false;
    private percentage: number = 0;
    private percentage_number_width: number = 0;
    private audioPlay: pika_PS_audioPlays = null;
    onLoad() {
        let soundDirs = [
            'res/sounds/bgm/',
            'res/sounds/sfx/',
        ];

        let imageDirs = [
            'res/fonts/',
            'res/images/background/',
            'res/images/play_screen/',
            'res/images/loading_screen/',
            'res/images/home_screen/',
            'res/images/result_screen/',
            'res/images/common_popup/',
            'res/images/texturePackage/',
        ];

        let prefabDirs = [
            'res/prefabs/popup_common/',
        ];

        let prefabs = [
            'res/prefabs/screen/test_network_screen',
            'res/prefabs/screen/play_screen',
            'res/prefabs/screen/home_screen',
            'res/prefabs/screen/search_screen',
            'res/prefabs/screen/result_screen',
            'res/prefabs/pf_play/pika_icon',
        ];

        if (sys.isNative) this._items = this._items.concat(soundDirs);

        this._items = this._items
            // .concat(soundDirs)
            .concat(imageDirs)
            .concat(prefabDirs)
            .concat(prefabs);

        this._setVersion(pika_Config.versionGame);
        this.audioPlay = this.node.getComponent(pika_PS_audioPlays);
    }
    private _setVersion(version: string) {
        this.lbVersion && (this.lbVersion.string = 'v' + version);
    }
    start() {
        this.btnGoHomeScreen && (this.btnGoHomeScreen.node.active = false);
        this.loadingProgress.progress = 0;

        let percent = 1.0 / (this._items.length + 1);
        sys.isBrowser && this._loadAudioWeb();
        this.checkGoHomeScreen();
    }
    show_playButton_label() {
        let label_playButton = this.btnGoHomeScreen.node.getChildByName('Label');
        let show_label = label_playButton.getComponent(Label);
        if (this.reconnect_state == reconectState.normalConnect) {
            show_label.string = "Go Home";
        }
        else if (this.reconnect_state == reconectState.reconnect) {
            show_label.string = "PlayGame";
        }
    }
    checkGoHomeScreen() {
        if (pika_Director.instance.getLoginState() === LOGIN_STATE.LOGIN_SUCCESS && pika_Director.instance.loadingSuccess) {
            this.loadingProgress && (this.loadingProgress.node.active = false);
            this.btnGoHomeScreen && (this.btnGoHomeScreen.node.active = true);
            if (pika_Director.instance.reconnect_state == RECONNECT_STATE.RECONNECT) {
                this.reconnect_state = reconectState.reconnect;
                this.show_playButton_label();
            }
            if (pika_Director.instance.reconnect_state == RECONNECT_STATE.NORMAL_CONNECT) {
                this.reconnect_state = reconectState.normalConnect;
                this.show_playButton_label();
            }
        }
        else {
            if (pika_Director.instance.getLoginState() === LOGIN_STATE.NO_LOGIN) {
                this._checkLogin();
            }
            if (!pika_Director.instance.loadingSuccess && !this._isLoading) {
                let percent = 1.0 / (this._items.length + 1);
                this._loadAsset(0, percent);
            }
        }
    }
    dangnhap_ID_game_Play() {
        const searchParams = new URLSearchParams(window.location.search);
        const id = searchParams.get("id");
        const token = searchParams.get("token");
        let ID_number = parseInt(id);
        let tocken_number = parseInt(token);
        pika_WaitingProgress.instance.show();
        pika_Director.instance.connectToGameServer(tocken_number, ID_number);
        if (pika_Director.instance.connect_state == connectState.success) {
            this.checkGoHomeScreen();
        }
    }
    private _checkLogin() {
        VDScreenManager.instance.assetBundle.load(pika_Path.NOTIFY_POPUP,
            (err, data) => {
                if (!err) {
                    this.doLogin();
                }
                else {
                    log("load error  " + err + " _checkLogin");
                    if (sys.isBrowser) {
                        alert(pika_Text.NO_CONNECT);
                    }
                }
            });
    }
    private doLogin() {
        if (this._isLoginning) return;
        this._isLoginning = true;
        pika_Director.instance.login(
            () => {
                log(`login is successful!`);
                this._isLoginning = false;
                this.checkGoHomeScreen();
            },
            () => {
                this._isLoginning = false;
                log(`login is failed!`);
            },
        )
        this.dangnhap_ID_game_Play();
    }
    private _loadAudioWeb() {
        let soundDirs = [
            'res/sounds/bgm/',
            'res/sounds/sfx/',
        ];
        soundDirs.forEach(soundsPath => {
            const sounds = VDScreenManager.instance.assetBundle.getDirWithPath(soundsPath, AudioClip);
            sounds.forEach(sound => {
                if (this._audios[`${sound.path}`]) return;
                const nativeUrl = assetManager.utils.getUrlWithUuid(sound.uuid, { isNative: true, nativeExt: '.mp3' });
                this._audios[`${sound.path}`] = nativeUrl;
            })
        });

        this._initAudio();
    }
    private _initAudio() {
        VDAudioManager.instance.init(this._audios);

        let isMuteMusic = VDLocalDataManager.getBoolean(VDAudioManager.ENABLE_MUSIC, false);
        let isMuteSfx = VDLocalDataManager.getBoolean(VDAudioManager.ENABLE_SFX, false);

        VDAudioManager.instance.isMutingMusic = isMuteMusic;
        VDAudioManager.instance.isMutingEffect = isMuteSfx;
    }
    private _loadAsset(index: number, totalPercent: number) {
        if (index >= this._items.length) {
            this.loadingProgress.progress = 1.0;
            this.convert_to_percentage(this.loadingProgress.progress);
            this._finishedLoading();
            return;
        }
        let path = this._items[index];
        log("_loadAsset  " + path);
        if (this._isDirectory(path)) {
            VDScreenManager.instance.assetBundle.loadDir(path,
                (finished, total) => {
                    let progress = index * totalPercent + finished / total * totalPercent;
                    if (progress > this.loadingProgress.progress) {
                        this.loadingProgress.progress = progress;
                        this.convert_to_percentage(this.loadingProgress.progress);
                    }
                },
                (err, data) => {
                    if (sys.isNative && (path.endsWith('/bgm/') || path.endsWith('/sfx/'))) {
                        let assets: Asset[] = data;
                        for (let as of assets) {
                            if (as instanceof AudioClip) {
                                this._audios[`${path}${as.name}`] = `${as._nativeAsset.url}`;
                            }
                        }

                        this._initAudio();
                    }

                    if (!err) {
                        this.scheduleOnce(() => {
                            this._loadAsset(index + 1, totalPercent);
                        }, 0);
                    } else {
                        log("load error  " + err + "    " + path);
                        if (sys.isBrowser) {
                            this.showPopupMessage(pika_Text.ERROR_LOADING_ASSETS);
                        }
                    }
                });
        }
        else {
            VDScreenManager.instance.assetBundle.load(path,
                (finished, total) => {
                    this.loadingProgress.progress = index * totalPercent + finished / total * totalPercent;
                    this.convert_to_percentage(this.loadingProgress.progress);
                },
                (err, data) => {
                    if (!err) {
                        this.scheduleOnce(() => {
                            this._loadAsset(index + 1, totalPercent);
                        }, 0);
                    }
                    else {
                        log("load error  " + err + "    " + path);
                        if (sys.isBrowser) {
                            this.showPopupMessage(pika_Text.ERROR_LOADING_ASSETS);
                        }
                    }
                });
        }
    }
    private _finishedLoading() {
        log(`LoadingScreen: _finishedLoading`);
        this._isLoading = false;
        pika_Director.instance.loadingSuccess = true;
        pika_WaitingProgress.instance.init();
        this.checkGoHomeScreen();
    }
    convert_to_percentage(progress_number: number) {
        let percentage_number = progress_number * 100;
        this.percentage = parseFloat(percentage_number.toFixed(2))
        this.show_percentage(this.percentage)
    }
    show_percentage(percent: number) {
        let percentage_number_node = this.loadingProgress.node.getChildByPath('show_loading_percentage/number');
        let Percentage = this.loadingProgress.node.getChildByPath('show_loading_percentage/percentage');
        let p_percentage = Percentage.getWorldPosition();
        let p_percentage_number = percentage_number_node.getWorldPosition();
        let percentage_number_label = percentage_number_node.getComponent(Label);
        percentage_number_label.string = `${percent}`;
        this.percentage_number_width = this.transform_contentSize_label();
        Percentage.setWorldPosition(p_percentage_number.x + this.percentage_number_width + 13, p_percentage_number.y, 0);
    }

    transform_contentSize_label(): number {
        let percentage_number_node = this.loadingProgress.node.getChildByPath('show_loading_percentage/number');
        let percentage_number_label = percentage_number_node.getComponent(Label);
        let uitransform = percentage_number_node.getComponent(UITransform);
        const ctx = document.createElement('canvas').getContext('2d');
        ctx.font = `${percentage_number_label.fontSize}px ${percentage_number_label.fontFamily}`;
        const contentSize = ctx.measureText(percentage_number_label.string);
        uitransform.contentSize = new Size(contentSize.width, percentage_number_label.fontSize);
        return uitransform.contentSize.width;
    }
    onClickBtn2MainGame() {
        tween(this.node)
            .delay(0.2)
            .call(() => {
                if (this.reconnect_state == reconectState.normalConnect) {
                    let home_screen = VDScreenManager.instance.assetBundle.get(pika_Path.HOME_SCREEN, Prefab)!;
                    VDScreenManager.instance.replaceScreenAtIndex(home_screen, 0, (screen: VDBaseScreen) => {
                        pika_Director.instance.gameStateFE = GAME_STATE_FE.HOME_SCREEN;
                        pika_Director.instance.homeScreen = screen as pika_homeScreen;
                    });
                }
                if (this.reconnect_state == reconectState.reconnect) {
                    let play_screen = VDScreenManager.instance.assetBundle.get(pika_Path.PLAY_SCREEN, Prefab)!;
                    VDScreenManager.instance.replaceScreenAtIndex(play_screen, 0, (screen: VDBaseScreen) => {
                        pika_Director.instance.gameStateFE = GAME_STATE_FE.PLAYING_SCREEN;
                        pika_Director.instance.playScreen = screen as pika_playScreen;
                        pika_Director.instance.reconnect_reload_playscreen = RECONNECT_RELOADING_PLAYSCREEN.RELOADING;
                    });
                }
            })
            .start();
    }
    private showPopupMessage(message: string) {
        VDScreenManager.instance.showPopupFromPrefabName(pika_Path.NOTIFY_POPUP, (popup: VDBasePopup) => {
            let popupDisplay = popup as pika_PopupNotify;
            popupDisplay.setupPopup(message, [
                () => {
                    VDScreenManager.instance.hidePopup(true);
                    let percent = 1.0 / (this._items.length + 1);
                    this._loadAsset(0, percent);
                },
                () => {
                    VDScreenManager.instance.hidePopup(true);
                }
            ]);
        }, true, true, false);
    }
    private _isDirectory(path: string | null): boolean {
        return path != null && typeof path == 'string' && path.length > 0 && path[path.length - 1] == '/';
    }
    onClick_soundEffect() {
        this.audioPlay.effect_clickButton();
    }
}


