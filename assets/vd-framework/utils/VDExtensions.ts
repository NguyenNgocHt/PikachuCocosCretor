import { math, Node, EventTouch, UITransform, UIOpacity, VERSION, log } from "cc";

declare module 'cc' {
    interface EventTouch {
        stopPropagation(): void;
    }

    interface Node {
        getZIndex(): number;
        setZIndex(zIndex: number): void;

        getOpacity(): number;
        setOpacity(opacity: number): void;

        setPositionX(x: number): void;

        setPositionY(y: number): void;

        setPositionZ(z: number): void;

        changePositionX(x: number): void;

        changePositionY(y: number): void;

        changePositionZ(z: number): void;

        setScaleX(x: number): void;

        setScaleY(y: number): void;

        setScaleZ(z: number): void;
    }
}

EventTouch.prototype.stopPropagation = function () {
    this.propagationStopped = true;
    this.propagationImmediateStopped = true;
}

Node.prototype.setZIndex = function (zIndex: number) {
    if (VERSION < "3.1.0") {
        let uiTrans = this.getComponent(UITransform) as UITransform;
        if (uiTrans) {
            uiTrans.priority = zIndex;
        }
        else {
            uiTrans = this.addComponent(UITransform);
            uiTrans.priority = zIndex;
        }
    }
    else {
        this.setSiblingIndex(zIndex);
    }
}

Node.prototype.getZIndex = function () {
    if (VERSION < "3.1.0") {
        let uiTrans = this.getComponent(UITransform) as UITransform;
        if (uiTrans) {
            return uiTrans.priority;
        }
    }
    else {
        return this.getSiblingIndex();
    }
}

Node.prototype.setOpacity = function (opacity: number) {
    let uiOpacity = this.getComponent(UIOpacity) as UIOpacity;
    if (uiOpacity) {
        uiOpacity.opacity = opacity;
    }
    else {
        uiOpacity = this.addComponent(UIOpacity);
        uiOpacity.opacity = opacity;
    }
}

Node.prototype.getOpacity = function () {
    let uiOpacity = this.getComponent(UIOpacity) as UIOpacity;
    if (uiOpacity) {
        return uiOpacity.opacity;
    }
    return 0;
}

Node.prototype.setPositionX = function (x: number): void {
    this.position = new math.Vec3(x, this.position.y, this.position.z);
}

Node.prototype.setPositionY = function (y: number): void {
    this.position = new math.Vec3(this.position.x, y, this.position.z);
}

Node.prototype.setPositionZ = function (z: number): void {
    this.position = new math.Vec3(this.position.x, this.position.y, z);
}

Node.prototype.changePositionX = function (x: number): void {
    this.position = new math.Vec3(this.position.x + x, this.position.y, this.position.z);
}

Node.prototype.changePositionY = function (y: number): void {
    this.position = new math.Vec3(this.position.x, this.position.y + y, this.position.z);
}

Node.prototype.changePositionZ = function (z: number): void {
    this.position = new math.Vec3(this.position.x, this.position.y, this.position.z + z);
}

Node.prototype.setScaleX = function (x: number): void {
    this.scale = new math.Vec3(x, this.scale.y, this.scale.z);
}

Node.prototype.setScaleY = function (y: number): void {
    this.scale = new math.Vec3(this.scale.x, y, this.scale.z);
}

Node.prototype.setScaleZ = function (z: number): void {
    this.scale = new math.Vec3(this.scale.x, this.scale.y, z);
}