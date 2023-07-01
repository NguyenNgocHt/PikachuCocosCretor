import { CCBoolean } from 'cc';
import { _decorator, Component, log, assetManager, Prefab } from 'cc';
import VDAsyncTaskMgr from '../../../vd-framework/async-task/VDAsyncTaskMgr';
import { VDAudioManager } from '../../../vd-framework/audio/VDAudioManager';
import VDScreenManager from '../../../vd-framework/ui/VDScreenManager';
import { pika_Config } from './common/pika_config';
import { pika_Path } from './common/pika_Define';
import { pika_Director } from './core/pika_Director';
import { pika_loadingScreen } from './screens/pika_loadingScreen';
const { ccclass, property } = _decorator;

@ccclass('pika_Scene')
export class pika_Scene extends Component {
    @property(CCBoolean)
    public runTestScreen: boolean = false;
    onLoad() {
        log("@ cf_Scene: onLoad  bundle " + pika_Config.GAME_NAME);
        let bundle = assetManager.getBundle("bundle_" + pika_Config.GAME_NAME);
        if (bundle) {
            console.log('**************pika pika*************');
            this.node.addComponent(VDScreenManager);

            VDScreenManager.instance.assetBundle = bundle;
            VDScreenManager.instance.setupCommon();

            let pathScreen = pika_Path.LOADING_SCREEN;
            if (this.runTestScreen) pathScreen = pika_Path.TEST_NETWORK_SCREEN;

            bundle.load(pathScreen, Prefab, (error, prefab) => {
                if (error) {
                    log(`bundle.load: ${error}`);
                }
                else {
                    log("load loading sucess")
                    // VDScreenManager.instance.initWithRootScreen(prefab);
                    VDScreenManager.instance.initWithRootScreen(prefab, (screen) => {
                        log('initWithRootScreen ' + screen.name + ' success!');
                    });
                }
            })
        }
    }
    onDestroy() {
        pika_Director.instance.offEvents();
        VDAudioManager.instance.destroy();
        VDAsyncTaskMgr.instance.stop();
    }
}


