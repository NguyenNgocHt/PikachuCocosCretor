import * as cc from 'cc';

import VDControlEvent from "./VDControlEvent";
import VDTabbarItem from './VDTabbarItem';

const { ccclass, property } = cc._decorator;

export interface VDTabbarDelegate {
    tabbarShouldSelectItemAtIndex?(idx: number): boolean;
    tabbarSelectedAtIndex?(idx: number): void;
}

@ccclass
export default class VDTabbar extends cc.Component {

    @property(cc.Node)
    tabbar: cc.Node = null!;

    @property(cc.Node)
    content: cc.Node = null!;

    @property(cc.CCInteger)
    public startIndex: number = 0;

    private _items: VDTabbarItem[] = [];

    get items(): VDTabbarItem[] {
        return this._items;
    }

    private _delegate: VDTabbarDelegate = null!;
    public get delegate(): VDTabbarDelegate {
        return this._delegate;
    }

    public set delegate(value: VDTabbarDelegate) {
        this._delegate = value;
    }

    public get curSelectedIndex(): number {
        return this._curSelectedIndex;
    }
    private _curSelectedIndex: number = -1;

    onLoad() {
        if (!this.content || !this.tabbar) {
            throw "tab bar or content view not found";
        }
        for (let child of this.tabbar.children) {
            if (child.active) {
                let com = child.getComponent(VDTabbarItem) as VDTabbarItem;
                if (com) {
                    let t = child.getComponent(cc.Button);
                    if (!t) {
                        t = child.addComponent(cc.Button);
                    }
                    t.interactable = true;
                    this._items.push(com);
                }
            }
        }

        let itemIdx = 0;
        for (let item of this._items) {
            item.node.name = itemIdx.toString();
            itemIdx++;
        }
        this.selectItemAtIndex(0);
    }

    start() {
        this.selectItemAtIndex(this.startIndex.valueOf())
    }

    onEnable() {
        for (let item of this._items) {
            item.node.on(VDControlEvent.Click, this.onItemClick, this);
        }
    }

    onDisable() {
        for (let item of this._items) {
            item.node.off(VDControlEvent.Click, this.onItemClick, this);
        }
    }

    onItemClick(event: cc.EventTouch) {
        let node = event.target as cc.Node;
        this.selectItemAtIndex(parseInt(node.name));
    }

    selectItemAtIndex(idx: number): boolean {
        if (!(idx >= 0 && idx <= this._items.length - 1)) {
            throw "tab idx not in range";
        }
        if (this._delegate && this._delegate.tabbarShouldSelectItemAtIndex && !this._delegate.tabbarShouldSelectItemAtIndex(idx)) {
            return false;
        }
        if (this._curSelectedIndex != idx) {
            if (this._curSelectedIndex >= 0 && this._curSelectedIndex <= this._items.length - 1) {
                let unSelItem = this._items[this._curSelectedIndex];
                unSelItem.setSelected(false);
                this.content.removeChild(unSelItem.content);
            }
            this._curSelectedIndex = idx;
            let selectedItem = this._items[idx];
            selectedItem.setSelected(true);
            if (selectedItem.content && selectedItem.content.parent) {
                if (selectedItem.content.parent != this.content) {
                    selectedItem.content.removeFromParent();
                    this.content.addChild(selectedItem.content);
                }
            } else if (selectedItem.content) {
                this.content.addChild(selectedItem.content);
                let widget = selectedItem.content.getComponent(cc.Widget);
                widget && widget.updateAlignment();
            }
            if (this._delegate && this._delegate.tabbarSelectedAtIndex) {
                this._delegate.tabbarSelectedAtIndex(idx);
            }
            this.node.emit(VDControlEvent.TabbarItemSelected, this._curSelectedIndex);
            return true;
        }
        return false;
    }


}
