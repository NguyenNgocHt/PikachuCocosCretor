
import { _decorator } from 'cc';

export abstract class VDAudio {

    public static FADE_DURATION = 0.2;
    public musicPath: string = 'res/sounds/bgm/';
    public effectPath: string = 'res/sounds/sfx/';

    protected _mutingMusic: boolean = false;
    get isMutingMusic(): boolean {
        return this._mutingMusic;
    }
    set isMutingMusic(value: boolean) {
        if (this._mutingMusic != value) {
            this._mutingMusic = value;
        }
        if (this._mutingMusic) {
            this.pauseBGM(false);
        }
        else {
            this.resumeBGM(false);
        }
    }

    protected _mutingEffect: boolean = false;
    get isMutingEffect(): boolean {
        return this._mutingEffect;
    }
    set isMutingEffect(value: boolean) {
        if (this._mutingEffect != value) {
            this._mutingEffect = value;
        }
        if (this._mutingEffect) {
            this.stopClip(false, null);
            this.stopAllEffects(false);
        }
    }

    protected _musicVolume = 1.0;
    get musicVolume() {
        return this._musicVolume;
    }
    set musicVolume(value) {
        if (this._musicVolume != value) {
            this._musicVolume = value;
        }
    }

    protected _effectVolume = 1;
    get effectVolume() {
        return this._effectVolume;
    }
    set effectVolume(value) {
        if (this._effectVolume != value) {
            this._effectVolume = value;
        }
    }

    abstract init(data: any): void;
    abstract playBGM(name: string, fade: boolean): void;
    abstract pauseBGM(fade: boolean): void;
    abstract resumeBGM(fade: boolean);

    abstract playClip(name: string, loop: boolean, resumeBGM: boolean, callback: VoidFunction | null);
    abstract stopClip(resumeBGM: boolean, callback: VoidFunction | null);

    abstract playEffect(name: string, loop: boolean, callback: VoidFunction | null): string | null;
    abstract stopEffect(sfxId: string, fade: boolean): boolean;
    abstract stopEffectByName(name: string, fade: boolean): boolean;
    abstract resumeEffect(sfxId: string, fade: boolean);
    abstract pauseEffect(sfxId: string, fade: boolean);

    abstract stopAllEffects(fade: boolean);
    abstract pauseAllEffects(fade: boolean);
    abstract resumeAllEffects(fade: boolean);

    abstract destroy();

}
