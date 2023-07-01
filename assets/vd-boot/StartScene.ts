import { _decorator, Component, CCString, assetManager, log, director } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('StartScene')
export class StartScene extends Component {

    @property(CCString)
    bundleGameName: string = "";

    @property(CCString)
    sceneName: string = "";

    onLoad() {
        log("@ StartScene: onLoad  !!!");
        assetManager.loadBundle(this.bundleGameName, (err, bundle) => {
            if (err) {
                log("@@@ loadBundle error: " + this.bundleGameName);
            } else {
                bundle.loadScene(this.sceneName, (err, scene) => {
                    if (err) {
                        log("@@@ loadScene error: " + this.sceneName);
                    } else {
                        log("@@@ loadScene success: " + this.sceneName);
                        director.runScene(scene);
                    }
                });
            }
        });
    }
}

