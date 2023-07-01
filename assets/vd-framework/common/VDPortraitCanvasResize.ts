import { _decorator, Component, sys, view, log } from 'cc';
import { DEV } from 'cc/env';
import { VDEventListener, VDEventListenerName } from './VDEventListener';
const { ccclass, property } = _decorator;

@ccclass('VDPotraitCanvasResize')
export class VDPotraitCanvasResize extends Component {
    _thisOnResized: any;

    onLoad() {
        if (!DEV && sys.isBrowser) {
            this._thisOnResized = this.onScreenResized.bind(this);
            window.addEventListener('resize', this._thisOnResized);
            this.updateCanvasAttributes();
        }
        if (!DEV && sys.isBrowser && sys.isMobile) {
            // console.warn('iOS safari browser ');
            view.on('canvas-resize', this.updateCanvasSize);
            this.updateCanvasSize();
        }
    }

    updateCanvasSize() {
        // console.warn('updateCanvasSize');
        // console.warn('iOS safari browser ');
        window.scrollTo(0, 0);
    }

    updateCanvasAttributes() {
        // const viewSize = view.getFrameSize();
        // log('===================================');
        // log(`window size original: ${window.innerWidth} - ${window.innerHeight}`);
        // log(`view.getDevicePixelRatio: ${view.getDevicePixelRatio()} `);
        // log(`window.getDevicePixelRatio: ${window.devicePixelRatio} `);

        // let ratio = 1; //window.devicePixelRatio;
        let windowWidth = window.innerWidth;
        let windowHeight = window.innerHeight;
        // log(`window size * ratio: ${windowWidth} - ${windowHeight}`);

        // log(`view size: ${viewSize.width} - ${viewSize.height}`);
        // log(`canvas size: ${view.getCanvasSize().width} - ${view.getCanvasSize().height}`);
        // log(`visible size: ${view.getVisibleSize().width} - ${view.getVisibleSize().height}`);

        // log(`design size: ${view.getDesignResolutionSize().width} - ${view.getDesignResolutionSize().height}`);
        // log(`sys.windowPixelResolution : ${sys.windowPixelResolution.width} - ${sys.windowPixelResolution.height}`);

        let windowRatio = windowWidth * 1.0 / windowHeight;
        let designRatio = view.getDesignResolutionSize().width * 1.0 / view.getDesignResolutionSize().height;

        let cvShadow = document.getElementById('canvas-shadow');
        if (windowRatio > designRatio) {
            if (view.getDesignResolutionSize().width == 1280) {
                designRatio = 1600.0 / 720;
            }
            let cWidth = Math.floor(designRatio * windowHeight);
            let padding = Math.floor((windowWidth - cWidth) / 2);
            // game.canvas?.setAttribute('width', `${cWidth}px`);
            // game.canvas?.setAttribute('height', `${windowHeight}px`);
            // game.canvas?.setAttribute('style', `width: ${cWidth}px; height: ${windowHeight}px;`);
            // const containerStyle = game.container?.style;
            // if (containerStyle) {
            //     containerStyle.paddingLeft = `${padding}px`;
            //     containerStyle.paddingRight = `${padding}px`;
            //     containerStyle.paddingTop = `0px`;
            //     containerStyle.paddingBottom = `0px`;
            // }
            // document.body.style.width = `${windowWidth}px`;
            // document.body.style.height = `${windowHeight}px`;

            // view.emit("canvas-resize");
            // view._resizeCallback && view._resizeCallback();

            if (cvShadow) {
                cvShadow.setAttribute('style', `visibility: visible;height: ${windowHeight - 1}px;width: ${cWidth}px;left: ${padding}px;top: 0px;transform: rotate(0deg);`)
            }
            // game.canvas?.style && (game.canvas.style.visibility = 'hidden');
            // game.canvas?.style && (game.canvas.style.visibility = 'visible');
            // director.reset();
            // game.container?.setAttribute('style', `transform: rotate(0deg); width: ${cWidth}px; height: ${windowHeight}px; margin: 0px; padding: 0px ${padding}px;`);
            // view.setDesignResolutionSize(
            //     view.getDesignResolutionSize().width,
            //     view.getDesignResolutionSize().height,
            //     ResolutionPolicy.SHOW_ALL
            // );
        }
        else {
            if (view.getDesignResolutionSize().width == 720) {
                designRatio = 720 / 1560.0;
            }
            let cHeight = Math.floor(windowWidth / designRatio);
            // game.canvas?.setAttribute('width', `${windowWidth}px`);
            // game.canvas?.setAttribute('height', `${cHeight}px`);
            // game.canvas?.setAttribute('style', `width: ${windowWidth}px; height: ${cHeight}px;`);
            let padding = Math.floor((windowHeight - cHeight) / 2);
            if (cvShadow) {
                cvShadow.setAttribute('style', `visibility: visible;height: ${cHeight}px;width: ${windowWidth - 1}px;left: 0px;top: ${padding}px;transform: rotate(0deg);`)
            }
            // game.container?.setAttribute('style', `transform: rotate(0deg); width: ${windowWidth}px; height: ${cHeight}px; margin: 0px; padding: ${padding}px 0px;`);

            // view.setCanvasSize(windowWidth, cHeight);
            // view.setDesignResolutionSize(
            //     view.getDesignResolutionSize().width,
            //     view.getDesignResolutionSize().height,
            //     ResolutionPolicy.SHOW_ALL
            // );
        }
    }

    onScreenResized() {
        this.updateCanvasAttributes();
        VDEventListener.dispatchEvent(VDEventListenerName.RESIZE_WINDOW_EVENT, this);
    }

    onDestroy() {
        if (!DEV && sys.isBrowser) {
            window.removeEventListener('resize', this._thisOnResized);
        }
        if (!DEV && sys.isBrowser && sys.isMobile) {
            view.off('canvas-resize', this.updateCanvasSize);
        }
    }
}

