import * as cc from 'cc';
import { tween, Tween, Vec3 } from 'cc';

export default class VDUtils {

    public static playAllVfx(rootNode: cc.Node, animName: string, loop: boolean = false) {
        let anim = rootNode.getComponentInChildren(cc.sp.Skeleton);
        anim?.setAnimation(0, animName, loop);
    }

    public static getAnimationName(spine: cc.sp.Skeleton, trackIndex: number = 0): string | null {
        let curAnimation = spine.getCurrent(trackIndex);
        if (!curAnimation) return null;
        return curAnimation.animation.name;
    }

    public static playAnimation(spineNode: cc.Node, name: string, loop: boolean = false, completedCallback: VoidFunction | null = null): boolean {
        if (!spineNode) return false;
        let spine = spineNode.getComponent(cc.sp.Skeleton);
        if (!spine) return false;
        let entry = spine.setAnimation(0, name, loop);
        if (!entry) return false;
        spine.setTrackCompleteListener(entry, () => {
            completedCallback && completedCallback();
        });
        return true;
    }

    public static setMix(spine: cc.sp.Skeleton, anim1: string, anim2: string, mixTime: number = 0.25) {
        spine?.setMix(anim1, anim2, mixTime);
        spine?.setMix(anim2, anim1, mixTime);
    }

    public static transitionBackgroundWeb(fromBgrName: string, toBrgName: string) {
        if (cc.sys.isBrowser) {
            const fromBg = document.getElementById(fromBgrName);
            fromBg && (fromBg.className = fromBg.className.replace('visible', 'hidden'));

            const toBg = document.getElementById(toBrgName);
            toBg && (toBg.className = fromBg.className.replace('hidden', 'visible'));
        }
    }

    public static formatTimestamp(ts: number | string, hasYear?: boolean) {
        const d = new Date(ts);
        const h = VDUtils.addZero(d.getHours());
        const m = VDUtils.addZero(d.getMinutes());
        const s = VDUtils.addZero(d.getSeconds());
        const t = VDUtils.addZero(d.getDate()) + '/' + VDUtils.addZero(d.getMonth() + 1) + (hasYear ? ('/' + d.getFullYear()) : '') + ' ' + h + ':' + m + ':' + s;
        return t;
    }

    public static addZero(i: any) {
        if (i < 10) {
            i = '0' + i;
        }
        return i;
    }

    /**
     * target scale will set with `startRate`, then scale to `scaleUpRate` during `duration`, then scale to `toRate` during `duration`, after all call `finishedCallback`
     */
    public static animateScaleUp(target: cc.Node, scaleUpRate: number, duration: number = 0.2, toRate: number = 1, startRate: number = 1,
        finishedCallback: VoidFunction | null = null) {
        let scale0 = { scale: new Vec3(startRate, startRate, startRate) };
        let scale1 = tween().to(duration, { scale: new Vec3(scaleUpRate, scaleUpRate, scaleUpRate) }, { easing: 'fade' });
        let scale2 = tween().to(duration, { scale: new Vec3(toRate, toRate, toRate) }, { easing: 'fade' });
        let func = tween().call(() => {
            finishedCallback && finishedCallback();
        })

        let animate = tween(target)
            .set(scale0)
            .then(scale1)
            .then(scale2)
            .then(func)
            .start();

        return animate;
    }

    public static equalsArray<T>(a: T[], b: T[]): boolean {
        return a.length === b.length &&
            a.every((v, i) => v === b[i]);
    }

    public static shakeEffect(node, duration, strength): Tween<any> {
        if (!node) return;
        if (node["tween_shake"]) node["tween_shake"].stop(); // stop if on tween;

        let backUpPos = node.getPosition();
        let lstMoveTweens: Tween<any>[] = [];

        let loopTime = Math.floor(duration / 0.01);
        for (let i = 0; i < loopTime; i++) {
            let rand_x = backUpPos.x + this.getRandomFloat(-strength, strength);
            let rand_y = backUpPos.y + this.getRandomFloat(-strength, strength);
            let moveTw = tween().to(0.01, { position: new Vec3(rand_x, rand_y, 1) });
            lstMoveTweens.push(moveTw);
        }

        let twShake = tween(node)
            .sequence(...lstMoveTweens)
            .call(() => {
                node.setPosition(backUpPos);
                node["tween_shake"] = null;
            })
            .start();
        node["tween_shake"] = twShake;
        return twShake;
    }

    public static getRandomFloat(min, max) {
        return Math.random() * (max - min) + min;
    };

    public static shuffleArray<T>(a: T[]): T[] {
        for (let i = a.length - 1; i >= 0; i--) {
            const randomIndex = Math.floor(Math.random() * (i + 1));
            const itemIndex = a[randomIndex];
            a[randomIndex] = a[i];
            a[i] = itemIndex;
        }
        return a;
    }

    public static clearArray<T>(a: T[]): T[] {
        return a.splice(0, a.length);
    }

    public static cloneArray<T>(a: T[]): T[] {
        return [...a];
    }
}