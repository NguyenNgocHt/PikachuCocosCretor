import * as cc from 'cc';
import VDControlEvent from "./VDControlEvent";

const { ccclass, property } = cc._decorator;

@ccclass
export default class VDTabbarItem extends cc.Component {

    @property(cc.CCString)
    title: string = "";

    @property(cc.SpriteFrame)
    selectedSprite: cc.SpriteFrame = null!;

    @property(cc.SpriteFrame)
    deselectedSprite: cc.SpriteFrame = null!;

    @property(cc.Prefab)
    prefab: cc.Prefab = null!;

    @property(cc.Node)
    nodeContent: cc.Node = null!;

    private _icon: cc.Sprite | null = null;
    private _label: cc.Label | null = null;

    private _content: cc.Node = null!;
    public get content(): cc.Node {
        if (!this._content) {
            if (this.prefab) {
                this._content = cc.instantiate(this.prefab);
            } else if (this.nodeContent) {
                this._content = this.nodeContent;
            }
        }
        return this._content;
    }

    private _selected: boolean = false;
    public get selected(): boolean {
        return this._selected;
    }

    public setSelected(value: boolean) {
        this._selected = value;
        this.content && (this.content.active = value);
        if (this._selected) {
            this._icon && (this._icon.spriteFrame = this.selectedSprite);
        }
        else {
            this._icon && (this._icon.spriteFrame = this.deselectedSprite);
        }

        let touchHandler = this.node.getComponent(cc.Button) as cc.Button;
        touchHandler.interactable = !value;
    }

    onLoad() {
        this._icon = this.node.getComponentInChildren(cc.Sprite);
        this._label = this.node.getComponentInChildren(cc.Label);
        if (this._selected) {
            this._icon && (this._icon.spriteFrame = this.selectedSprite);
        }
        else {
            this._icon && (this._icon.spriteFrame = this.deselectedSprite);
        }
        this._label && this.title && (this._label.string = this.title);
    }


    start() {

    }
}
