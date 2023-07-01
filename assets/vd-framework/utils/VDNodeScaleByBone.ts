import { _decorator, Component, sp, log } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('VDNodeScaleByBone')
export class VDNodeScaleByBone extends Component {

    private _skeleton: sp.Skeleton = null!;

    start() {
        this._skeleton = this.node.getComponent(sp.Skeleton);
    }

    update() {
        if (!this._skeleton) return;

        this._skeleton.sockets.forEach(socket => {
            let path = socket.path;
            let target = socket.target;

            let boneName = this._getBoneNameByPath(path);
            let scale = this._getAbsoluteScaleByPath(path);
            if (boneName && boneName != '') {
                target.setScale(scale, scale);
            }
        });
    }

    _getBoneNameByPath(path: string) {
        let boneName = '';
        let arr = path.split('/');
        if (arr.length > 0) {
            boneName = arr[arr.length - 1];
        }
        return boneName;
    }

    _getAbsoluteScaleByPath(path: string) {
        let scale = 1;
        let arrName = path.split('/');
        arrName.forEach(boneName => {
            let bone = this._skeleton.findBone(boneName);
            scale *= bone.scaleX;
        });
        return scale;
    }
}