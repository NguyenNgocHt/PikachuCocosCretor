import { _decorator, log, game, Game } from 'cc';
import { VDAudio } from './VDAudio';
import Audio from '../plugins/howler.min.js';

export class VDAudioWebManager extends VDAudio {

    public audios: { [key: string]: any } = {};

    private _webBgm: any = null;
    private _webClip: any = null;
    private _sfx: { [name: string]: any } = {};
    private _isActive: boolean = true;

    constructor() {
        super();
        Audio.Howler.autoSuspend = false;
        Audio.Howler.autoUnlock = true;
        game.on(Game.EVENT_HIDE, this._onHideGame, this);
        game.on(Game.EVENT_SHOW, this._onShowGame, this);
    }

    destroy() {
        game.off(Game.EVENT_HIDE, this._onHideGame, this);
        game.off(Game.EVENT_SHOW, this._onShowGame, this);

        if (this._webBgm) {
            this._webBgm.howl.stop();
            this._webBgm = null;
        }
        this.stopClip();
        this.stopAllEffects();

        this.audios = {};
        this._sfx.length = 0;
    }

    private _onHideGame() {
        this._isActive = false;
        if (!this._mutingMusic) {
            this.pauseBGM();
        }
        if (!this._mutingEffect) {
            this.pauseClip();
            this.pauseAllEffects();
        }
    }

    private _onShowGame() {
        this._isActive = true;
        if (!this._mutingMusic) {
            this.resumeBGM();
        }
        if (!this._mutingEffect) {
            this.resumeClip();
            this.resumeAllEffects();
        }
    }

    init(audioList: any) {
        log(`initWebAudio`);

        for (let key in audioList) {
            let h = new Audio.Howl({ src: audioList[key] });
            let data = {
                path: audioList[key],
                howl: h,
            };
            this.audios[key] = data;
        }
    }

    playBGM(name: string, fade: boolean = false) {
        if (!this._isActive) return;

        let path = this.musicPath + name;
        if (this._webBgm) {
            this._webBgm.howl.stop();
            this._webBgm = null;
        }
        let data = this.audios[path];
        if (data && data.howl) {
            data.howl.loop(true);
            if (!this.isMutingMusic) {
                data.howl.play();
                if (fade) {
                    data.howl.volume(0);
                    data.howl.fade(0, this._musicVolume, VDAudio.FADE_DURATION * 1000);
                }
                else {
                    data.howl.volume(this.musicVolume);
                }
            }
            this._webBgm = data;
        }
    }

    pauseBGM(fade = true) {
        log("pauseBGM   Web");
        if (this._webBgm && this._webBgm.howl.playing()) {
            if (!fade) {
                this._webBgm.howl.pause();
            }
            else {
                this._webBgm.howl.fade(this.musicVolume, 0, VDAudio.FADE_DURATION * 1000);
                let howl = this._webBgm.howl;
                howl.once('fade', (sId) => {
                    howl.pause();
                });
            }
        }
    }

    resumeBGM(fade = true) {
        if (this.isMutingMusic) return;
        log("resumeBGM   Web");
        if (this._webBgm && !this._webBgm.howl.playing()) {
            if (!fade) {
                this._webBgm.howl.volume(this._musicVolume);
                this._webBgm.howl.play();
            }
            else {
                this._webBgm.howl.play();
                this._webBgm.howl.fade(0, this._musicVolume, VDAudio.FADE_DURATION * 1000);
            }
        }
    }

    playClip(name: string, loop: boolean = false, resumeBGM: boolean = true, callback: VoidFunction | null = null) {
        if (!this._isActive) return;
        if (this.isMutingEffect) return;

        let path = this.musicPath + name;
        if (this._webClip) {
            this._webClip.howl.stop();
            this._webClip = null;
        }
        let data = this.audios[path];
        if (data && data.howl && !data.howl.playing()) {
            this.pauseBGM();

            data.howl.loop(loop);
            data.howl.volume(this._effectVolume);
            data.howl.play();
            this._webClip = data;

            !loop && this._webClip.howl.once('end', (sId) => {
                if (resumeBGM) this.resumeBGM();
                if (!loop && callback) callback();
                this._webClip = null;
            });
        }
    }

    stopClip(resumeBGM: boolean = true, callback: VoidFunction | null = null) {
        // let path = this.musicPath + name;
        if (this._webClip && this._webClip.howl && this._webClip.howl.playing()) {
            this._webClip.howl.fade(this._effectVolume, 0, VDAudio.FADE_DURATION * 1000);
            let howl = this._webClip.howl;
            howl.once('fade', (sId) => {
                howl.stop();
                this._webClip = null;
                callback && callback();
            });
        }
        if (resumeBGM) {
            this.resumeBGM();
        }
    }

    pauseClip(fade: boolean = false) {
        if (this._webClip && this._webClip.howl && this._webClip.howl.playing()) {
            if (!fade) {
                this._webClip.howl.pause();
            }
            else {
                this._webClip.howl.fade(this._effectVolume, 0, VDAudio.FADE_DURATION * 1000);
                this._webClip.howl.once('fade', (sId) => {
                    this._webClip.howl.pause();
                });
            }
        }
    }

    resumeClip(fade: boolean = false) {
        if (!this._isActive) return;
        if (this._webClip && this._webClip.howl && !this._webClip.howl.playing()) {
            if (!fade) {
                this._webClip.howl.volume(this._effectVolume);
                this._webClip.howl.play();
            }
            else {
                this._webClip.howl.fade(0, this._effectVolume, VDAudio.FADE_DURATION * 1000);
                this._webClip.howl.once('fade', (sId) => {
                    this._webClip.howl.pause();
                });
            }
        }
    }

    playEffect(name: string, loop: boolean = false, callback: VoidFunction | null = null): string | null {
        if (!this._isActive) return;
        if (this.isMutingEffect) return;

        let path = this.effectPath + name;
        let data = this.audios[path];
        if (data && data.howl) {
            data.howl.loop(loop);
            data.howl.volume(this._effectVolume);
            let sfxId = '' + data.howl.play();
            this._sfx[sfxId] = data;
            log(`playEffect Web start: ${path} - ${loop} - ${sfxId}`);

            if (!loop) {
                data.howl.once('end', (sId) => {
                    log(`playEffect Web end : ${path}`);
                    callback && callback();
                    delete this._sfx[sfxId];
                });
            }
            return sfxId;
        }
        return null;
    }

    stopEffect(sfxId: string, fade: boolean = false): boolean {
        log(`Audio Web Manager stopEffect: ${sfxId}`);
        let data = this._sfx[sfxId];
        if (data && data.howl && data.howl.playing(parseInt(sfxId))) {
            if (!fade) {
                data.howl.stop(parseInt(sfxId));
                delete this._sfx[sfxId];
            }
            else {
                data.howl.fade(this._effectVolume, 0, VDAudio.FADE_DURATION * 1000, parseInt(sfxId));
                data.howl.once('fade', (sId) => {
                    data.howl.stop(parseInt(sfxId));
                    delete this._sfx[sfxId];
                })
            }
            return true;
        }
        return false;
    }

    stopEffectByName(name: string, fade: boolean = false): boolean {
        let path = this.effectPath + name;
        let data = this.audios[path];
        log(`stopEffectByName: ${path}`);
        if (data && data.howl && data.howl.playing()) {
            if (!fade) {
                data.howl.stop();
            }
            else {
                data.howl.fade(this._effectVolume, 0, VDAudio.FADE_DURATION * 1000);
                data.howl.once('fade', (sId) => {
                    data.howl.stop();
                });
            }
            let soundIds = data.howl._getSoundIds();
            for (let sId of soundIds) {
                delete this._sfx[sId + ''];
            }
            return true;
        }
        return false;
    }

    pauseEffect(sfxId: string, fade: boolean = false) {
        log(`Audio Web Manager pauseEffect ${sfxId}`);
        let data = this._sfx[sfxId];
        if (data && data.howl && data.howl.playing(parseInt(sfxId))) {
            log(`Audio Web Manager pauseEffect 222 ${sfxId}`);
            if (!fade) {
                data.howl.pause(parseInt(sfxId));
            }
            else {
                data.howl.fade(this._effectVolume, 0, VDAudio.FADE_DURATION * 1000, parseInt(sfxId));
                data.howl.once('fade', (sId) => {
                    data.howl.pause(parseInt(sfxId));
                });
            }
        }
    }

    resumeEffect(sfxId: string, fade: boolean = false) {
        log(`Audio Manager resumeEffect ${sfxId}`);
        let data = this._sfx[sfxId];
        if (data && data.howl && !data.howl.playing(parseInt(sfxId))) {
            if (!fade) {
                data.howl.volume(this._effectVolume, parseInt(sfxId));
                data.howl.play(parseInt(sfxId));
            }
            else {
                data.howl.play(parseInt(sfxId));
                data.howl.fade(0, this._effectVolume, VDAudio.FADE_DURATION * 1000, parseInt(sfxId));
            }
        }
    }

    stopAllEffects(fade: boolean = false) {
        let playingSoundIds = Object.keys(this._sfx);
        playingSoundIds.forEach(idSfx => {
            this.stopEffect(idSfx, fade);
        });
    }

    pauseAllEffects(fade: boolean = false) {
        let playingSoundIds = Object.keys(this._sfx);
        playingSoundIds.forEach(idSfx => {
            this.pauseEffect(idSfx, fade);
        });
    }

    resumeAllEffects(fade: boolean = false) {
        let playingSoundIds = Object.keys(this._sfx);
        playingSoundIds.forEach(idSfx => {
            this.resumeEffect(idSfx, fade);
        });
    }

}