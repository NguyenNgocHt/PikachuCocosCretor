import * as cc from 'cc';
import { VDEventListener, VDEventListenerName } from '../common/VDEventListener';
import VDUtils from '../utils/VDUtils';
import VDBasePopup from './VDBasePopup';
import VDBaseScreen from './VDBaseScreen';
import VDControlEvent from './VDControlEvent';


const { ccclass } = cc._decorator;
export enum VD_SCREEN_IDS {
    LOBBY = 1,
    MAIN_TABLE = 2
}

export enum VD_GUI_TYPE {
    POPUP = 0,
    WINDOW = 1,
    SCREEN = 2
}

const VD_ANIMATED_TIME = 0.3;

export enum VD_ZINDEX {
    BACK_GROUND = 0,
    SCREEN = 1,
    NAVIGATOR = 32,
    CUSTOM_UI = 64,
    WINDOW = 128,
    POPUP = 256,
    EFFECT = 512,
    Z_ORDER_MAX = 1024,
    LOADING = 2048,
}

const VD_POPUP_NOTIFY_NAME = 'popup_notify';

@ccclass
export default class VDScreenManager extends cc.Component {

    private static _instance: VDScreenManager = null!;
    public static get instance(): VDScreenManager {
        if (!VDScreenManager._instance) {
            VDScreenManager._instance = cc.director.getScene()!.getComponentInChildren(VDScreenManager)!;
        }
        return VDScreenManager._instance;
    }

    // public static set instance(value) {
    //     VDScreenManager._instance = value;
    // }

    public assetBundle: cc.AssetManager.Bundle = cc.resources;

    private _canvas: cc.Node = null!;
    private _canvasSize: cc.Size = null!;
    get screenSize() {
        return cc.View.instance.getDesignResolutionSize();
    }
    public layerBackground: cc.Node = null!;
    private layerScreen: cc.Node = null!;
    private layerPopup: cc.Node = null!;
    private layerEffect: cc.Node = null!;
    private zOrderMax: cc.Node = null!;
    private popupBackground: cc.Node = null!;
    private _showedMaxOrderPopup: boolean = false;

    isPortrait() {
        let designResolutionSize = cc.View.instance.getDesignResolutionSize();
        return (designResolutionSize.width == 720);
    }

    onLoad() {
        // cc.log(`onLoad`);

        this._canvas = cc.find('Canvas')!;
        this._canvasSize = this._canvas.getComponent(cc.UITransform)!.contentSize;

        // VDScreenManager.instance = this._canvas.getComponent("VDScreenManager")! as VDScreenManager;       
        if (cc.sys.isBrowser) {
            let gameShell = document.getElementById('game-shell');
            let cvShadow = document.getElementById('canvas-shadow');
            if (!gameShell && !cvShadow) {
                this.createLayerGameBackground();
            }
        }
        else if (cc.sys.isMobile && cc.sys.isNative) {
            this.createLayerGameBackground();
        }
        this.layerScreen = this._createLayer(VD_ZINDEX.SCREEN);
        this.layerPopup = this._createLayer(VD_ZINDEX.POPUP);
        this.layerEffect = this._createLayer(VD_ZINDEX.EFFECT);
        this.zOrderMax = this._createLayer(VD_ZINDEX.Z_ORDER_MAX);

        this._createPopupBackground();

        let uiTransform = this.layerEffect.getComponent(cc.UITransform)!;
        if (this.isPortrait()) {
            uiTransform.setContentSize(720, 1560);
        }
        else {
            uiTransform.setContentSize(1560, 720);
        }
        let mask = this.layerEffect.addComponent(cc.Mask);
        this.layerEffect.active = false;

        this.zOrderMax.active = false;

        VDEventListener.on(VDEventListenerName.REMOVE_BASE_POPUP, this.removePopup, this);
        VDEventListener.on(VDEventListenerName.RESIZE_WINDOW_EVENT, this.resizeWindowAdapt, this);
    }

    resizeWindowAdapt() {
        let uiTransform = this.layerScreen.getComponent(cc.UITransform);

        const viewSize = cc.screen.windowSize;
        let windowWidth = viewSize.width;
        let windowHeight = viewSize.height;
        let windowRatio = windowWidth * 1.0 / windowHeight;
        const designRatio = cc.view.getDesignResolutionSize().width * 1.0 / cc.view.getDesignResolutionSize().height;
        if (windowRatio > designRatio) {
            let cWidth = Math.floor(windowRatio * cc.view.getDesignResolutionSize().height);
            uiTransform.setContentSize(cWidth, cc.view.getDesignResolutionSize().height);
        }
        else {
            let cHeight = Math.floor(cc.view.getDesignResolutionSize().width / windowRatio);
            uiTransform.setContentSize(cc.view.getDesignResolutionSize().width, cHeight);
        }
    }

    private _createLayer(zIndex: number) {
        let layer = new cc.Node("layer_" + zIndex);
        layer.name = 'ParentLayer';
        layer.layer = this.node.layer;
        this.node.addChild(layer);
        let uiTransform = layer.addComponent(cc.UITransform);
        uiTransform.anchorPoint = new cc.Vec2(0.5, 0.5);

        // const viewSize = cc.screen.windowSize;
        // let width = viewSize.width;
        // let height = cc.view.getDesignResolutionSize().width / width * viewSize.height;//viewSize.height;

        const viewSize = cc.screen.windowSize;
        let windowWidth = viewSize.width;
        let windowHeight = viewSize.height;
        let windowRatio = windowWidth * 1.0 / windowHeight;
        const designRatio = cc.view.getDesignResolutionSize().width * 1.0 / cc.view.getDesignResolutionSize().height;
        if (windowRatio > designRatio) {
            let cWidth = Math.floor(windowRatio * cc.view.getDesignResolutionSize().height);
            uiTransform.setContentSize(cWidth, cc.view.getDesignResolutionSize().height);
        }
        else {
            let cHeight = Math.floor(cc.view.getDesignResolutionSize().width / windowRatio);
            uiTransform.setContentSize(cc.view.getDesignResolutionSize().width, cHeight);
        }

        layer.setZIndex(zIndex);
        return layer;
    }

    public getLayer(zIndex: number) {
        switch (zIndex) {
            case VD_ZINDEX.BACK_GROUND:
                return this.layerBackground;

            case VD_ZINDEX.SCREEN:
                return this.layerScreen;

            case VD_ZINDEX.POPUP:
                return this.layerPopup;

            case VD_ZINDEX.EFFECT:
                return this.layerEffect;

            case VD_ZINDEX.Z_ORDER_MAX:
                return this.zOrderMax;

            default:
                return null;
        }
    }

    setupCommon() {
        cc.resources.load(`images/bgr/bg_popup/spriteFrame`, cc.SpriteFrame, (error, spriteFrame) => {
            // cc.log(`images/bg_popup`);
            if (spriteFrame) {
                let sprite = this.popupBackground.getComponent(cc.Sprite)!;
                sprite.spriteFrame = spriteFrame;
            }
            else {
                cc.log(`load popup background error: ${error}`);
            }
        });

        let canvasBorder = this._canvas.getChildByName('canvas_border');
        if (this.layerBackground) {
            // only for native app
            cc.resources.load(`images/bgr/default_sprite_splash/spriteFrame`, cc.SpriteFrame, (error, spriteFrame) => {
                // cc.log(`images/bg_popup`);
                if (spriteFrame) {
                    let sprite = this.layerBackground.getComponent(cc.Sprite)!;
                    sprite.spriteFrame = spriteFrame;
                }
                else {
                    cc.log(`load popup background error: ${error}`);
                }
            });
            canvasBorder && (canvasBorder.active = true);
        }
        else {
            // for web
            canvasBorder && (canvasBorder.active = false);
        }
    }

    public changeCanvasBackground(bgrSprite: cc.SpriteFrame) {
        if (bgrSprite && VDScreenManager.instance.layerBackground) {
            cc.log(`changeCanvasBackground `);
            let sprite = this.layerBackground.getComponent(cc.Sprite)!;
            sprite.spriteFrame = bgrSprite;
            sprite.color = cc.color(255, 255, 255, 255);

            let uiTransform = this.layerBackground.getComponent(cc.UITransform);
            sprite.getComponent(cc.UITransform).setContentSize(uiTransform.width, uiTransform.height);

            // let windowWidth = cc.screen.windowSize.width;
            // let windowHeight = cc.screen.windowSize.height;

            // let hAspect = windowHeight / bgrSprite.height;
            // let wAspect = windowWidth / bgrSprite.width;

            // if (hAspect > wAspect) {
            //     uiTransform.setContentSize(bgrSprite.width * hAspect, bgrSprite.height * hAspect);
            // }
            // else {
            //     uiTransform.setContentSize(bgrSprite.width * wAspect, bgrSprite.height * wAspect);
            // }
        }
    }

    public createLayerGameBackground() {
        if (this.layerBackground) return;
        this.layerBackground = this._createLayer(VD_ZINDEX.BACK_GROUND);
        let uiTransform = this.layerBackground.getComponent(cc.UITransform);

        let sprite = this.layerBackground.addComponent(cc.Sprite); // transparent background like dark fog
        sprite.type = 1; // SLICE
        sprite.color = cc.color(0, 0, 0, 255);
        sprite.sizeMode = 0;
        sprite.trim = true;

        const viewSize = cc.screen.windowSize;
        let windowWidth = viewSize.width;
        let windowHeight = viewSize.height;
        let windowRatio = windowWidth * 1.0 / windowHeight;

        const designRatio = cc.view.getDesignResolutionSize().width * 1.0 / cc.view.getDesignResolutionSize().height;
        if (windowRatio > designRatio) {
            let cWidth = Math.floor(windowRatio * cc.view.getDesignResolutionSize().height);
            uiTransform.setContentSize(cWidth, cc.view.getDesignResolutionSize().height);
            cc.log(`_setupLayerBackground 1: ${cWidth}, ${cc.view.getDesignResolutionSize().height}`);
        }
        else {
            let cHeight = Math.floor(cc.view.getDesignResolutionSize().width / windowRatio);
            uiTransform.setContentSize(cc.view.getDesignResolutionSize().width, cHeight);
            cc.log(`_setupLayerBackground 2: ${cc.view.getDesignResolutionSize().width}, ${cHeight}`);
        }
    }

    _createPopupBackground() {
        this.popupBackground = new cc.Node("popupBackground");

        this.layerPopup.addChild(this.popupBackground);
        this.popupBackground.layer = this.layerPopup.layer;
        this.popupBackground.active = false;

        let uiTransform = this.popupBackground.addComponent(cc.UITransform);
        uiTransform.anchorPoint = new cc.Vec2(0.5, 0.5);
        // uiTransform.contentSize = cc.View.instance.getDesignResolutionSize();
        if (this.isPortrait()) {
            uiTransform.setContentSize(720, 1560);
        }
        else {
            uiTransform.setContentSize(1560, 720);
        }
        // this.popupBackground.setZIndex(ZINDEX.POPUP);

        let sprite = this.popupBackground.addComponent(cc.Sprite); // transparent background like dark fog
        sprite.type = 1; // SLICE
        sprite.color = cc.color(0, 0, 0, 200);
        sprite.sizeMode = 0;
        sprite.trim = true;

        this.popupBackground.addComponent(cc.Button);
    }

    onEnable() {
        this._registerEvent();
    }

    onDisable() {
        this._unregisterEvent();
    }

    onDestroy() {
        cc.log("[VDScreenManager] onDestroy !");
        this._popUpStack.splice(0, this._popUpStack.length);
        // for (let screen of this._screenStack) {
        //     if (screen.node.parent) {
        //         screen.node.removeFromParent();
        //     }
        //     screen.destroy();
        // }
        this._screenStack.splice(0, this._screenStack.length);
        this.assetBundle.releaseAll();
        VDScreenManager._instance = null;
        VDEventListener.off(VDEventListenerName.REMOVE_BASE_POPUP, this.removePopup, this);
        VDEventListener.off(VDEventListenerName.RESIZE_WINDOW_EVENT, this.resizeWindowAdapt, this);
    }

    private _registerEvent() {
        this.zOrderMax?.on(cc.Node.EventType.TOUCH_START, this._onTouchBegan, this, true);
        this.zOrderMax?.on(cc.Node.EventType.TOUCH_MOVE, this._onTouchMoved, this, true);
        this.zOrderMax?.on(cc.Node.EventType.TOUCH_END, this._onTouchEnded, this, true);
        this.zOrderMax?.on(cc.Node.EventType.TOUCH_CANCEL, this._onTouchCancelled, this, true);

        this.popupBackground.on(cc.Button.EventType.CLICK, this.hidePopupOnBackgroundTouchIfNeed, this);
    }

    private _unregisterEvent() {
        this.zOrderMax?.off(cc.Node.EventType.TOUCH_START, this._onTouchBegan, this, true);
        this.zOrderMax?.off(cc.Node.EventType.TOUCH_MOVE, this._onTouchMoved, this, true);
        this.zOrderMax?.off(cc.Node.EventType.TOUCH_END, this._onTouchEnded, this, true);
        this.zOrderMax?.off(cc.Node.EventType.TOUCH_CANCEL, this._onTouchCancelled, this, true);

        this.popupBackground.off(cc.Button.EventType.CLICK, this.hidePopupOnBackgroundTouchIfNeed, this);
    }

    protected _onTouchBegan(event: cc.EventTouch) {
    }

    protected _onTouchMoved(event: cc.EventTouch) {
    }

    protected _onTouchEnded(event: cc.EventTouch) {
    }

    protected _onTouchCancelled(event: cc.EventTouch) {
    }

    public static reloadGame() {
        // Canvas.reloadGame(restart);
    }

    private _animating: boolean = false;

    public get curScreenID(): string | null {
        let screen = this._screenStack[this._screenStack.length - 1];
        if (screen)
            return screen.name;
        else
            return null;
    }

    public get curScreen(): VDBaseScreen {
        return this._screenStack[this._screenStack.length - 1];
    }

    private _popUpStack: Array<VDBasePopup> = [];

    public get screenStack(): Array<VDBaseScreen> {
        return this._screenStack;
    }
    private _screenStack: Array<VDBaseScreen> = [];

    // private _screenCached: any = {};

    get minScaleFactor(): number {
        return Math.min(this.screenSize.width / cc.View.instance.getDesignResolutionSize().width,
            this.screenSize.height / cc.View.instance.getDesignResolutionSize().height);
    }

    get maxScaleFactor(): number {
        return Math.max(this.screenSize.width / cc.View.instance.getDesignResolutionSize().width,
            this.screenSize.height / cc.View.instance.getDesignResolutionSize().height);
    }

    initWithRootScreen(screen: cc.Prefab, callback?: Function | null) {
        if (!screen || this._screenStack.length > 0) {
            throw "init root screen failed";
        }

        let self = this;

        this.loadScreen(screen, function (nextScreen: VDBaseScreen) {
            nextScreen.node.setPosition(0, 0);
            self._screenStack.push(nextScreen);

            nextScreen.node.setZIndex(VD_ZINDEX.SCREEN);
            nextScreen.node.setOpacity(255);

            self.layerScreen.addChild(nextScreen.node);
            self._screenWillAppear(nextScreen);
            self._screenDidAppear(nextScreen);
            callback && callback(nextScreen);
        });

    }

    pushScreen(screen: cc.Prefab, callback?: Function | null, animated: boolean = false, zIndex: number = VD_ZINDEX.SCREEN) {

        let self = this;
        if (this._screenStack.length != 0) {
            if (this._animating || !screen) return;

            this._canvas.emit(VDControlEvent.CanvasCancel);
            let animatedTime = animated ? VD_ANIMATED_TIME : 0.0;

            let curScreen = this._screenStack[this._screenStack.length - 1];
            this.loadScreen(screen, function (nextScreen: VDBaseScreen) {

                if (nextScreen.hideCurScreenOnShow) {
                    self.scheduleOnce(function () {
                        self._screenWillDisappear(curScreen);
                        if (animated) {
                            cc.tween(curScreen.node)
                                .by(animatedTime, { position: cc.v3(-self.screenSize.width, 0, 0) }, { easing: 'fade' })
                                .call(() => {
                                    self._screenDidDisappear(curScreen, animated);
                                    curScreen.node.removeFromParent();
                                })
                                .start();
                        } else {
                            self._screenDidDisappear(curScreen, animated);
                            curScreen.node.removeFromParent();
                        }
                    });
                }

                let touchHandler = nextScreen.getComponent(cc.Button) as cc.Button;
                if (!touchHandler) {
                    touchHandler = nextScreen.addComponent(cc.Button)!;
                }

                nextScreen.node.setPosition(0, 0);
                nextScreen.node.setZIndex(zIndex);

                self._screenStack.push(nextScreen);
                self.scheduleOnce(function () {
                    self.layerScreen.addChild(nextScreen.node);
                    self._screenWillAppear(nextScreen, animated);

                    if (animated) {
                        nextScreen.node.scale = new cc.Vec3(1.0, 1.0, 1.0);
                        nextScreen.node.setOpacity(255);

                        cc.tween(nextScreen.node)
                            .set({ position: cc.v3(self.screenSize.width, 0, 0) })
                            .by(animatedTime, { position: cc.v3(-self.screenSize.width, 0, 0) }, { easing: 'fade' })
                            .call(() => {
                                self._screenDidAppear(nextScreen, animated);
                            })
                            .start();
                    } else {
                        self._screenDidAppear(nextScreen, animated);
                    }
                });

                callback && callback(nextScreen);
            });
        } else {
            this.initWithRootScreen(screen, callback);
        }
    }

    popScreen(animated: boolean = false, showWaiting: boolean = true): VDBaseScreen | null {
        if (this._animating || this._screenStack.length <= 1) {
            return null;
        }

        let self = this;

        this._canvas.emit(VDControlEvent.CanvasCancel);
        let animatedTime = animated ? VD_ANIMATED_TIME : 0.0;

        let curScreen = this._screenStack.pop()!;
        let nextScreen = this._screenStack[this._screenStack.length - 1];
        nextScreen.node.setPosition(0, 0);

        this.scheduleOnce(function () {
            self._screenWillDisappear(curScreen, animated);
            if (animated) {
                cc.tween(curScreen.node)
                    .by(animatedTime, { position: cc.v3(self.screenSize.width, 0, 0) }, { easing: 'fade' })
                    .call(() => {
                        self._screenDidDisappear(curScreen, animated);

                        curScreen.node.removeFromParent();
                        curScreen.node.destroy();
                    })
                    .start();
            } else {
                self._screenDidDisappear(curScreen, animated);

                curScreen.node.removeFromParent();
                curScreen.destroy();
            }
        });

        nextScreen.node.setOpacity(255);
        nextScreen.node.scale = cc.v3(1.0, 1.0, 1.0);
        if (!nextScreen.node.parent) {
            this.scheduleOnce(function () {
                self.layerScreen.addChild(nextScreen.node);
                self._screenWillAppear(nextScreen);

                if (animated) {
                    cc.tween(nextScreen.node)
                        .set({ position: cc.v3(-self.screenSize.width, nextScreen.node.position.y, 0) })
                        .by(animatedTime, { position: cc.v3(self.screenSize.width, 0, 0), }, { easing: 'fade' })
                        .call(() => {
                            self._screenDidAppear(nextScreen);
                        })
                        .start();
                }
                else {
                    self._screenDidAppear(nextScreen);
                }
            });
        }
        return curScreen;
    }

    public popToRootScreen(animated: boolean = false) {
        this.popToScreenAtIndex(0, animated);
    }

    public getCurrentScreen(): VDBaseScreen | null {
        if (this._screenStack.length) {
            return this._screenStack[this._screenStack.length - 1];
        }
        return null;
    }

    public hasScreen(classNameOrComponent: any): boolean {
        for (let i = this._screenStack.length - 1; 0 <= i; i--) {
            if (this._screenStack[i].node.getComponent(classNameOrComponent))
                return true;
        }
        return false;
    }

    public findScreen(classNameOrComponent: any): VDBaseScreen | null {
        for (let i = this._screenStack.length - 1; i >= 0; i--) {
            let screen = this._screenStack[i];
            if (screen.node.getComponent(classNameOrComponent)) {
                return screen;
            }
        }
        return null;
    }

    public popToScreen(classNameOrComponent: any, animated: boolean = false): VDBaseScreen | null {
        let screenIdx = -1;
        for (let i = this._screenStack.length - 1; i >= 0; i--) {
            if (this._screenStack[i].node.getComponent(classNameOrComponent)) {
                screenIdx = i;
                break;
            }
        }
        return this.popToScreenAtIndex(screenIdx, animated);
    }

    public popToScreenAtIndex(screenIdx: number, animated: boolean = false, showWaiting: boolean = true): VDBaseScreen | null {
        if (this._animating || this._screenStack.length <= 1) {
            return null;
        }
        if (screenIdx < 0 || screenIdx > this._screenStack.length - 1) {
            return null;
        }

        let self = this;

        this._canvas.emit(VDControlEvent.CanvasCancel);
        let animatedTime = animated ? VD_ANIMATED_TIME : 0.0;

        let curScreen = this._screenStack.pop()!;
        let nextScreen = this._screenStack[screenIdx];
        nextScreen.node.setPosition(0, 0);

        this.scheduleOnce(function () {
            self._screenWillDisappear(curScreen, animated);
            if (animated) {
                cc.tween(curScreen.node)
                    .by(animatedTime, { position: cc.v3(self.screenSize.width, 0, 0) }, { easing: 'fade' })
                    .call(() => {
                        self._screenDidDisappear(curScreen, animated);

                        curScreen.node.removeFromParent();
                        curScreen.destroy();
                    })
                    .start();
            } else {
                self._screenDidDisappear(curScreen, animated);

                curScreen.node.removeFromParent();
                curScreen.destroy();
            }
            if (self._screenStack.length > screenIdx + 1) {
                for (let i = screenIdx + 1; i < self._screenStack.length; i++) {
                    let screen = self._screenStack[i];
                    if (screen.node.parent) {
                        screen.node.emit(VDControlEvent.ScreenDidPop);
                        screen.node.removeFromParent();
                        screen.node.destroy();
                    } else {
                        screen.node.destroy();
                    }
                }
                self._screenStack.splice(screenIdx + 1, self._screenStack.length - screenIdx - 1);
            }
        });
        nextScreen.node.setOpacity(255);
        nextScreen.node.scale = cc.v3(1.0, 1.0, 1.0);
        if (!nextScreen.node.parent) {
            this.scheduleOnce(function () {
                self.layerScreen.addChild(nextScreen.node);
                self._screenWillAppear(nextScreen);

                if (animated) {
                    cc.tween(nextScreen.node)
                        .set({ position: cc.v3(-self.screenSize.width, nextScreen.node.position.y, 0) })
                        .by(animatedTime, { position: cc.v3(self.screenSize.width, 0, 0), }, { easing: 'fade' })
                        .call(() => {
                            self._screenDidAppear(nextScreen);
                        })
                        .start();
                }
                else {
                    self._screenDidAppear(nextScreen);
                }
            });
        }
        return curScreen;
    }

    public replaceScreenAtIndex(screen: cc.Prefab, screenIdx: number, callback?: Function | null, animated: boolean = false, zIndex: number = VD_ZINDEX.SCREEN, showWaiting: boolean = true): VDBaseScreen | null {
        if (this._animating || this._screenStack.length <= 0) {
            return null;
        }
        if (screenIdx < 0 || screenIdx > this._screenStack.length - 1) {
            return null;
        }

        let self = this;

        this._canvas.emit(VDControlEvent.CanvasCancel);
        let animatedTime = animated ? VD_ANIMATED_TIME : 0.0;

        let oldScreen = this._screenStack[screenIdx];
        let isCurScreen = (screenIdx == this._screenStack.length - 1);

        this.loadScreen(screen, function (nextScreen: VDBaseScreen) {

            if (nextScreen.hideCurScreenOnShow && isCurScreen) {
                self.scheduleOnce(function () {
                    self._screenWillDisappear(oldScreen);
                    if (animated) {
                        cc.tween(oldScreen.node)
                            .by(animatedTime, { position: cc.v3(-self.screenSize.width, 0, 0) }, { easing: 'fade' })
                            .call(() => {
                                self._screenDidDisappear(oldScreen, animated);
                                oldScreen.node.removeFromParent();
                                oldScreen.destroy();
                            })
                            .start();
                    } else {
                        self._screenDidDisappear(oldScreen, animated);
                        oldScreen.node.removeFromParent();
                        oldScreen.destroy();
                    }
                });
            }
            else {
                oldScreen.destroy();
            }

            let touchHandler = nextScreen.getComponent(cc.Button) as cc.Button;
            if (!touchHandler) {
                touchHandler = nextScreen.addComponent(cc.Button)!;
            }

            nextScreen.node.setPosition(0, 0);
            nextScreen.node.setZIndex(zIndex);
            nextScreen.node.scale = new cc.Vec3(1.0, 1.0, 1.0);

            // self._screenStack.push(nextScreen);
            self._screenStack[screenIdx] = nextScreen;

            if (isCurScreen) {
                self.scheduleOnce(function () {
                    self.layerScreen.addChild(nextScreen.node);
                    self._screenWillAppear(nextScreen, animated);

                    if (animated) {
                        nextScreen.node.setOpacity(255);

                        cc.tween(nextScreen.node)
                            .set({ position: cc.v3(self.screenSize.width, 0, 0) })
                            .by(animatedTime, { position: cc.v3(-self.screenSize.width, 0, 0) }, { easing: 'fade' })
                            .call(() => {
                                self._screenDidAppear(nextScreen, animated);
                            })
                            .start();
                    } else {
                        self._screenDidAppear(nextScreen, animated);
                    }
                });
            }
            callback && callback(nextScreen);
        });

        return oldScreen;
    }

    // preloadCachedScreen(screen: cc.Prefab, callback: Function) {
    //     let self = this;
    //     if (!this._screenCached[screen.data.name]) {
    //         this.loadScreen(screen, function (node: VDBaseScreen) {
    //             self._screenCached[screen.data.name] = node;
    //             callback(node);
    //         }.bind(this));
    //     } else {
    //         callback(this._screenCached[screen.data.name]);
    //     }
    // }

    public hasPopUp(def: any): boolean {
        for (let pop of this._popUpStack) {
            if (pop.node.getComponent(def))
                return true;
        }
        return false;

    }

    getCurrentPopup(): VDBasePopup | null {
        if (this._popUpStack.length) {
            return this._popUpStack[this._popUpStack.length - 1];
        }
        return null;
    }

    removePopupNode(node: cc.Node, animated: boolean = true) {
        if (node.getComponent(VDBasePopup)) {
            this.removePopup(node.getComponent(VDBasePopup)!, animated);
        }
    }

    removePopup(popup: VDBasePopup, animated: boolean = true) {
        let localIndex = this._popUpStack.indexOf(popup);
        if (localIndex >= 0) {
            if (localIndex == this._popUpStack.length - 1) {
                this.hidePopup(animated);
            } else {
                this._popUpStack.splice(localIndex, 1);
                if (this._popUpStack.length == 0) {
                    this.popupBackground.active = false;
                }
                // this.popupBackground.setZIndex(VD_ZINDEX.POPUP + this._popUpStack.length * 2);
                popup.node.emit(VDControlEvent.PopupWillDisappear);
                popup.node.emit(VDControlEvent.PopupDidDisappear);
                popup.node.removeFromParent();
                popup.node.destroy();
            }
        }
    }

    hidePopup(animated: boolean = true) {
        if (this._popUpStack.length > 0) {
            let popup = this._popUpStack.pop()!;
            popup.node.emit(VDControlEvent.PopupWillDisappear);
            if (animated) {
                popup.node.setOpacity(255);
                let uiOpacity = popup.node.getComponent(cc.UIOpacity);
                cc.tween(uiOpacity)
                    .to(0.25, { opacity: 0 }, {
                        easing: 'fade',
                        onUpdate: (target?: object, ratio?: number) => {
                            popup.node.walk(child => {
                                let spine: cc.sp.Skeleton = child.getComponent(cc.sp.Skeleton);
                                if (spine) {
                                    let color: cc.Color = cc.Color.clone(spine.color);
                                    color.a = uiOpacity.opacity;
                                    spine.color = color;
                                }
                            });
                        }
                    })
                    .call(() => {
                        popup.node.emit(VDControlEvent.PopupDidDisappear);
                        popup.node.removeFromParent();
                        popup.node.destroy();
                    })
                    .start();
            } else {
                popup.node.emit(VDControlEvent.PopupDidDisappear);
                popup.node.removeFromParent();
                popup.node.destroy();
            }

            if (this._popUpStack.length > 0) {
                let nextPopup = this._popUpStack[this._popUpStack.length - 1];
                if (nextPopup.name === VD_POPUP_NOTIFY_NAME) {
                    nextPopup.node.setOpacity(255);
                    nextPopup.node.active = true;
                    this.popupBackground.setZIndex(VD_ZINDEX.POPUP + this._popUpStack.length * 2);
                    nextPopup.node.setZIndex(VD_ZINDEX.POPUP + this._popUpStack.length * 2 + 1);
                } else {
                    let zIndexNextPopUp = this.popupBackground.getZIndex();
                    nextPopup.node.setZIndex(zIndexNextPopUp + 1);
                }
            } else {
                this.popupBackground.setZIndex(VD_ZINDEX.POPUP);
                this.popupBackground.active = false;
            }
        }
    }

    showPopupFromPrefabName(resPath: string, callback: Function | null = null,
        hideWhenTouchOnBackground: boolean = true, animated: boolean = true, showBackgroundLayer: boolean = true) {

        if (this._showedMaxOrderPopup) return;
        let prefab = this.assetBundle.get(resPath, cc.Prefab);
        if (prefab) {
            this.showPopupFromPrefab(prefab, callback, hideWhenTouchOnBackground, animated, showBackgroundLayer);
        } else {
            this.assetBundle.load(resPath, cc.Prefab, (error, prefab) => {
                if (prefab) {
                    this.showPopupFromPrefab(prefab, callback, hideWhenTouchOnBackground, animated, showBackgroundLayer);
                }
                else {
                    cc.log(`showPopupFromPrefabName ERROR: ${error}`);
                }
            });
        }
    }

    showPopupFromPrefab(prefab: cc.Prefab, callback: Function | null = null,
        hideWhenTouchOnBackground: boolean = true, animated: boolean = true, showBackgroundLayer: boolean = true) {
        if (!prefab) {
            return;
        }

        let node = cc.instantiate(prefab) as cc.Node;
        this.showPopupFromNode(node, callback, hideWhenTouchOnBackground, animated, showBackgroundLayer);
    }

    showPopupFromNode(nodePopup: cc.Node, callback: Function | null = null,
        hideWhenTouchOnBackground: boolean = true, animated: boolean = true, showBackgroundLayer: boolean = true) {
        if (!nodePopup) {
            return;
        }
        let self = this;

        if (this._popUpStack.length == 0) {
            this.popupBackground.active = true;
        }
        else {
            let prevPopup = this._popUpStack[this._popUpStack.length - 1];
            if (prevPopup.name === VD_POPUP_NOTIFY_NAME && nodePopup.name === VD_POPUP_NOTIFY_NAME) {
                prevPopup.node.setOpacity(0);
                prevPopup.node.active = false;
                // console.log(`VDScreenManager - showPopupFromNode - currentPopup: ${prevPopup.name}`);
            }
        }
        this.popupBackground.setZIndex(VD_ZINDEX.POPUP + this._popUpStack.length * 2);

        // console.log(`VDScreenManager - showPopupFromNode - newPopup: ${nodePopup.name}`);
        let popComp = nodePopup.getComponent(VDBasePopup) as VDBasePopup;
        if (!popComp) {
            popComp = nodePopup.addComponent(VDBasePopup) as VDBasePopup;
        }

        popComp.hideWhenTouchOnBackground = hideWhenTouchOnBackground;

        this._popUpStack.push(popComp);
        this.layerPopup.addChild(nodePopup);
        nodePopup.setZIndex(VD_ZINDEX.POPUP + this._popUpStack.length * 2 + 1);

        if (this.popupBackground.active) {
            this.popupBackground.getComponent(cc.Sprite)!.enabled = showBackgroundLayer;
        }

        this.scheduleOnce(function () {
            self._canvas.emit(VDControlEvent.CanvasCancel);
        });

        nodePopup.emit(VDControlEvent.PopupWillAppear);

        if (animated) {
            nodePopup.setOpacity(0);
            let uiOpacity = nodePopup.getComponent(cc.UIOpacity);
            cc.tween(uiOpacity)
                .to(0.25, { opacity: 255 }, { easing: 'fade' })
                .call(() => {
                    nodePopup.emit(VDControlEvent.PopupDidAppear);
                })
                .start();

        } else {
            nodePopup.emit(VDControlEvent.PopupDidAppear);
        }

        callback && callback(popComp);

        return nodePopup;
    }

    hidePopupOnBackgroundTouchIfNeed() {
        // cc.log("hidePopupOnBackgroundTouchIfNeed");
        if (this._popUpStack.length <= 0) return;
        let comp = this._popUpStack[this._popUpStack.length - 1];
        if (comp.hideWhenTouchOnBackground) {
            this.hidePopup();
        }
    }

    hidePopupBackground() {
        this.popupBackground.getComponent(cc.Sprite)!.enabled = false;
    }

    showPopupBackground() {
        this.popupBackground.getComponent(cc.Sprite)!.enabled = true;
    }

    _screenWillAppear(screen: VDBaseScreen, animated?: boolean) {
        this._animating = true;
        screen.node.emit(VDControlEvent.ScreenWillAppear, screen);
    }

    _screenDidAppear(screen: VDBaseScreen, animated?: boolean) {
        this._animating = false;
        screen.node.emit(VDControlEvent.ScreenDidAppear, screen);
    }

    _screenWillDisappear(screen: VDBaseScreen, animated?: boolean) {
        this._animating = true;
        screen.node.emit(VDControlEvent.ScreenWillDisappear, screen);
    }

    _screenDidDisappear(screen: VDBaseScreen, animated?: boolean) {
        this._animating = false;
        screen.node.emit(VDControlEvent.ScreenDidDisappear, screen);
    }

    loadScreen(screen: cc.Prefab, callback: Function) {
        if (screen) {
            let node = cc.instantiate(screen);
            var comp = node.getComponent(VDBaseScreen);
            if (!comp)
                comp = node.addComponent(VDBaseScreen);
            callback && callback(comp);
        } else
            callback && callback(null);
    }

    alignView() {
        cc.view.setResizeCallback(this.alignView);
        // cc.Canvas.instance.fitHeight = true;
        // cc.Canvas.instance.alignWithScreen();
    }

    showEffect(fxNode: cc.Node, animationName: string = "", completedCallback: VoidFunction | null = null) {
        !this.layerEffect.active && (this.layerEffect.active = true);
        this.layerEffect.addChild(fxNode);
        if (animationName.length) {
            VDUtils.playAnimation(fxNode, animationName, false, () => {
                // console.log(`showEffect: finished`);
                completedCallback && completedCallback();
                this.layerEffect.removeChild(fxNode);
                fxNode.destroy();
                (this.layerEffect.children.length == 0) && (this.layerEffect.active = false);
            });
        }
    }

    removeAllEffects() {
        this.layerEffect.removeAllChildren();
        this.layerEffect.active = false;
    }

    setShowedMaxOrderPopup(showed: boolean) {
        this._showedMaxOrderPopup = showed;
    }

    getShowedMaxOrderPopup() {
        return this._showedMaxOrderPopup;
    }
}
