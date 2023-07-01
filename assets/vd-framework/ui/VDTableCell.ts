import * as cc from 'cc';

const { ccclass, property } = cc._decorator;

@ccclass
export default class VDTableCell extends cc.Component {
	public get selected(): boolean {
		return this._selected;
	}

	public setSelected(value: boolean) {
		this._selected = value;
	}

	private _selected: boolean = false;


	public get highlighted(): boolean {
		return this._highlighted;
	}

	public setHighlighted(value: boolean) {
		this._highlighted = value;
	}
	private _highlighted: boolean = false;
}
