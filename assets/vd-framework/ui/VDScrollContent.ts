import * as cc from 'cc';

import type VDScrollView from "./VDScrollView";

const { ccclass, property } = cc._decorator;

@ccclass
export default class VDScrollContent extends cc.Component {

	public get scrollView(): VDScrollView {
		return this._scrollView;
	}

	public set scrollView(value: VDScrollView) {
		this._scrollView = value;
	}
	private _scrollView: VDScrollView = null!;
}
