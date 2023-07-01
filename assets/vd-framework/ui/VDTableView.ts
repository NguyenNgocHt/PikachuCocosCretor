import * as cc from 'cc';

import VDScrollView, { VDScrollViewDelegate, VDScrollDirection } from "./VDScrollView";
import VDTableCell from "./VDTableCell";

export enum VDTableViewFillOrder {
    LEFT_TO_RIGHT__TOP_TO_BOTTOM = 0,
    TOP_TO_BOTTOM__LEFT_TO_RIGHT = 1
}

export enum VDTableViewInteractionMode {
    NONE,
    CLICK,
    SINGLE_SELECTION,
    MULTIPLE_SELECTION
}

const { ccclass, property } = cc._decorator;

export interface VDTableViewDelegate extends VDScrollViewDelegate {
    tableCellClicked?(tableView: VDTableView, cell: cc.Node, idx: number): void;

    tableCellDidSelected?(tableView: VDTableView, idx: number): void;

    tableCellWillDeselected?(tableView: VDTableView, idx: number): void;

    tableCellWillRecycle?(tableView: VDTableView, cell: cc.Node, idx: number): void;

    tableCellShouldHighlight?(tableView: VDTableView, idx: number): boolean;

    tableCellDidUnhighlight?(tableView: VDTableView, idx: number): void;

    tableCellDidHighlight?(tableView: VDTableView, idx: number): void;

    tableCellShouldSelect?(tableView: VDTableView, idx: number): boolean;

    tableClickOnSelectedCell?(tableView: VDTableView, idx: number): void;
}

export interface VDTableViewDataSource {
    numberOfCellsInTableView(tableView: VDTableView): number;
    tableCellAtIndex(tableView: VDTableView, idx: number): cc.Node;
    tableCellSize?(tableView: VDTableView): cc.Size;
    tableCellAnchor?(tableView: VDTableView): cc.Vec2;
}

@ccclass
export default class VDTableView extends VDScrollView {
    @property({
        type: cc.Enum(VDTableViewFillOrder)
    })
    private fillOrder: VDTableViewFillOrder = VDTableViewFillOrder.LEFT_TO_RIGHT__TOP_TO_BOTTOM;

    @property({
        type: cc.Enum(VDTableViewInteractionMode)
    })
    private interactionMode: VDTableViewInteractionMode = VDTableViewInteractionMode.NONE;

    @property(cc.CCBoolean)
    cellPagingEnabled: Boolean = false;

    @property(cc.CCInteger)
    numberOfPagingCell: Number = 1;

    @property(cc.Prefab)
    tableCell: cc.Prefab = null!;

    public get cellSize(): cc.Size {
        return this._cellSize;
    }

    public set cellSize(value: cc.Size) {
        this._cellSize = value;
    }
    private _cellSize: cc.Size = cc.Size.ZERO;
    private _cellAnchor: cc.Vec2 = cc.v2(0.5, 0.5);
    private _indices: Set<number> = new Set<number>();
    private _cellsUsed: Array<cc.Node> = [];
    private _cellsFreed: cc.NodePool = null!;

    public get rows(): number {
        return this._rows;
    }
    private _rows: number = 0;

    public get cols(): number {
        return this._cols;
    }
    private _cols: number = 0;
    private _realContentSize: cc.Size = cc.Size.ZERO;

    private _lastestCellCount: number = 0;

    static _cellPoolCache: any = {};

    public get selectedIndex(): number {
        if (this._selectedIndices.length > 0) {
            return this._selectedIndices[this._selectedIndices.length - 1];
        } else {
            return - 1;
        }
    }

    public get selectedIndices(): Array<number> {
        return this._selectedIndices;
    }

    private _selectedIndices: Array<number> = [];

    public get delegate(): VDTableViewDelegate {
        return this._tableViewDelegate;
    }

    public set delegate(value: VDTableViewDelegate) {
        this._tableViewDelegate = value;
    }

    private _tableViewDelegate: VDTableViewDelegate = null!;

    public get dataSource(): VDTableViewDataSource {
        return this._dataSource;
    }

    public set dataSource(value: VDTableViewDataSource) {
        this._dataSource = value;
    }
    private _dataSource: VDTableViewDataSource = null!;

    private _isUsedCellsDirty: boolean = true;

    private _highlightedIndex: number = -1;
    private _touchingIndex: number = -1;
    private _highlightedTouchObj: cc.Touch | null = null;

    private _startIdx: number = 0;
    private _endIdx: number = 0;
    private _mouseWheelEventElapsedTime: number = 0;
    private _stopMouseWheel: boolean = false;

    // LIFE-CYCLE CALLBACKS:

    cellCacheKey(): string {
        return this.tableCell.data.name;
    }

    onLoad() {
        super.onLoad();
        if (!this.tableCell) {
            throw "TableView must have a cell prefab reference";
        }
        let cacheKey = this.cellCacheKey();
        let cache = VDTableView._cellPoolCache[cacheKey];
        if (!cache) {
            cache = VDTableView._cellPoolCache[cacheKey] = new cc.NodePool(cacheKey + "<TableCellPool>");
        }
        this._cellsFreed = cache;

        if (this._dataSource && this._dataSource.tableCellSize) {
            this._cellSize = this._dataSource.tableCellSize(this);
        } else {
            this._cellSize = cc.size(this.tableCell.data.getComponent(cc.UITransform)!.width * this.tableCell.data.getScale().x,
                this.tableCell.data.getComponent(cc.UITransform)!.height * this.tableCell.data.getScale().y);
        }

        if (this._dataSource && this._dataSource.tableCellAnchor) {
            this._cellAnchor = this._dataSource.tableCellAnchor(this);
        } else {
            this._cellAnchor = this.tableCell.data.getComponent(cc.UITransform)!.anchorPoint;
        }

        this.content.getComponent(cc.UITransform)!.anchorX = 0;
        this.content.getComponent(cc.UITransform)!.anchorY = 1;

        this.zoomScaleEnabled = false;
        if (this.direction == VDScrollDirection.BOTH) {
            this.direction = VDScrollDirection.VERTICAL;
        }
    }

    onEnable() {
        super.onEnable();
        if (this.interactionMode != VDTableViewInteractionMode.NONE) {
            this.content.on(cc.Node.EventType.TOUCH_START, this._onTableTouchBegan, this);
            this.content.on(cc.Node.EventType.TOUCH_MOVE, this._onTableTouchMove, this);
            this.content.on(cc.Node.EventType.TOUCH_END, this._onTableTouchEnded, this);
            this.content.on(cc.Node.EventType.TOUCH_CANCEL, this._onTableTouchCancelled, this);
            this.content.on(cc.Node.EventType.MOUSE_WHEEL, this._onMouseWheel, this, true);

        }

        this.node.on('size-changed', this._onViewSizeChanged, this);
        this._updateContentSize();
    }

    onDisable() {
        super.onDisable();
        if (this.interactionMode != VDTableViewInteractionMode.NONE) {
            this.content.off(cc.Node.EventType.TOUCH_START, this._onTableTouchBegan, this);
            this.content.off(cc.Node.EventType.TOUCH_MOVE, this._onTableTouchMove, this);
            this.content.off(cc.Node.EventType.TOUCH_END, this._onTableTouchEnded, this);
            this.content.off(cc.Node.EventType.TOUCH_CANCEL, this._onTableTouchCancelled, this);
            this.content.off(cc.Node.EventType.MOUSE_WHEEL, this._onMouseWheel, this, true);

        }
        this.node.off('size-changed', this._onViewSizeChanged, this);
    }

    protected _onShowGame() {
        super._onShowGame();
        this._handleCancelLogicForTableInteraction(null);
    }

    start() {
        let cellCount = this._dataSource.numberOfCellsInTableView(this);
        if (this._lastestCellCount != cellCount) {
            this.reloadData();
        } else if (!this.scrollToLeftTop(false)) {
            this.scrollViewDidScroll(this);
        }
    }

    protected _onMouseWheel(event: cc.EventMouse, captureListeners?: Node[]) {
        if (!this.enabledInHierarchy) {
            return;
        }

        if (this._hasNestedViewGroup(event, captureListeners)) {
            return;
        }

        const deltaMove = new cc.Vec2();
        const wheelPrecision = -0.1;
        const scrollY = event.getScrollY();
        // cc.log(`_onMouseWheel: y = ${scrollY}`);
        if (!this._stopMouseWheel && Math.abs(scrollY * wheelPrecision) < cc.EPSILON) {
            return;
        }
        if (this.direction == VDScrollDirection.VERTICAL) {
            deltaMove.set(0, scrollY * wheelPrecision);
        } else if (this.direction == VDScrollDirection.HORIZONTAL) {
            deltaMove.set(scrollY * wheelPrecision, 0);
        }

        let oldPosition = new cc.Vec2(this.content.position.x, this.content.position.y);
        let newPosition = new cc.Vec2(this.content.position.x + deltaMove.x, this.content.position.y + deltaMove.y);
        // cc.log(`[Tableview] _onMouseWheel: deltaY = ${scrollY} - ${oldPosition} - ${newPosition}`);
        if (this.setContentPosition(newPosition)) {
            if (!this._dragging) {
                this._dragging = true;
                this._dragBeganPosition = oldPosition;
                if (this._delegate && this._delegate.scrollViewWillBeginDragging) {
                    this._delegate.scrollViewWillBeginDragging(this);
                }
            }
        }
        this._gatherTouchMove(deltaMove);

        this._mouseWheelEventElapsedTime = 0;

        if (!this._stopMouseWheel) {
            this._clearAutoScrollData();
            this.schedule(this._checkMouseWheel, 1.0 / 60, NaN, 0);
            this._stopMouseWheel = true;
        }

        this._stopPropagationIfTargetIsMe(event);
    }

    protected _checkMouseWheel(dt: number) {
        const maxElapsedTime = 0.1;
        this._mouseWheelEventElapsedTime += dt;

        // mouse wheel event is ended
        if (this._mouseWheelEventElapsedTime > maxElapsedTime) {
            // cc.log(`[Tableview] _onMouseWheel: stopMouseWheel`);
            this.unschedule(this._checkMouseWheel);
            this._stopMouseWheel = false;
        }
    }

    private _onTableTouchBegan(event: cc.EventTouch) {
        // cc.log(`[TableView] _onTableTouchBegan ${event.touch?.getLocation()} - ${event.touch?.getLocationInView()} - ${event.touch?.getUILocation()}`);
        if (!this.enabledInHierarchy) return;
        event.touch && this._handlePressLogicForTableInteraction(event.touch);

        this.touchEnabled && event.stopPropagation();
    }

    private _onTableTouchMove(event: cc.EventTouch) {
        // cc.log(`[TableView] _onTableTouchMove `);
        if (!this.enabledInHierarchy) return;
        event.touch && this._handleMoveLogicForTableInteraction(event.touch);
        this.touchEnabled && event.stopPropagation();
    }

    private _onTableTouchEnded(event: cc.EventTouch) {
        // cc.log(`[TableView] _onTableTouchEnded ${event.touch?.getLocation()} - ${event.touch?.getLocationInView()} - ${event.touch?.getUILocation()}`);
        if (!this.enabledInHierarchy) return;
        event.touch && this._handleReleaseLogicForTableInteraction(event.touch);
        this.touchEnabled && event.stopPropagation();
    }

    private _onTableTouchCancelled(event: cc.EventTouch) {
        // cc.log(`[TableView] _onTableTouchCancelled `);
        if (!this.enabledInHierarchy) return;
        event.touch && this._handleCancelLogicForTableInteraction(event.touch);
        this.touchEnabled && event.stopPropagation();
    }

    // protected _hasNestedViewGroup(event, captureListeners: any[]) {
    //     if (this.interactionMode == BGTTableViewInteractionMode.CELL_DRAGGING) {
    //         return false;
    //     } else {
    //         return super._hasNestedViewGroup(event, captureListeners);
    //     }
    // }

    clearSelection() {
        this._selectedIndices.splice(0, this._selectedIndices.length);
    }

    protected _handlePressLogicForTableInteraction(touch: cc.Touch) {
        if (this.interactionMode == VDTableViewInteractionMode.NONE) {
            return;
        }
        if (this._highlightedTouchObj == null && this._highlightedIndex < 0) {
            let localTouch3D = this.content.getComponent(cc.UITransform)!.convertToNodeSpaceAR(cc.v3(touch.getUILocation().x, touch.getUILocation().y, 0));
            let localTouch = cc.v2(localTouch3D.x, -localTouch3D.y);
            // localTouch.y = this.content.getComponent(cc.UITransform)!.height - localTouch.y;
            let index = this._indexFromOffset(localTouch);
            if (index >= 0) {
                let cell = this.cellAtIndex(index);
                if (cell) {
                    let shouldHighlight = (this._tableViewDelegate && this._tableViewDelegate.tableCellShouldHighlight) ? this._tableViewDelegate.tableCellShouldHighlight(this, index) : true;
                    if (shouldHighlight) {
                        this._setHighlightedForCell(cell, true);
                    }
                }
                this._highlightedIndex = index;
                this._touchingIndex = index;
                this._highlightedTouchObj = touch;
            }
        }
        else {
            this._highlightedIndex = -1;
            this._highlightedTouchObj = null;
        }
    }

    protected _handleMoveLogicForTableInteraction(touch: cc.Touch) {
        if (this.interactionMode == VDTableViewInteractionMode.NONE) {
            return;
        }
        let contenPos = cc.v2(this.content.position.x, this.content.position.y);
        let deltaMove = contenPos.subtract(this._beginContentPosition);

        if (deltaMove.length() > 8) {
            if (this._highlightedIndex >= 0) {
                let index = this._highlightedIndex;
                let cell = this.cellAtIndex(index);
                if (cell) {
                    this._setHighlightedForCell(cell, false);
                }
                this._highlightedIndex = -1;
            }
            this._touchingIndex = -1;

        } else if (this._highlightedTouchObj == touch) {
            if (this._highlightedIndex >= 0) {
                let cell = this.cellAtIndex(this._highlightedIndex);
                if (cell) {
                    if (this.node.getComponent(cc.UITransform)!.getBoundingBoxToWorld().contains(touch.getLocation())) {
                        let localTouch3D = this.content.getComponent(cc.UITransform)!.convertToNodeSpaceAR(cc.v3(touch.getUILocation().x, touch.getUILocation().y, 0));
                        let localTouch = cc.v2(localTouch3D.x, -localTouch3D.y);
                        // localTouch.y = this.content.getComponent(cc.UITransform)!.height - localTouch.y;
                        let tIndex = this._indexFromOffset(localTouch);
                        if (tIndex != this._highlightedIndex) {
                            this._setHighlightedForCell(cell, false);
                            this._highlightedIndex = -1;
                        } else {
                            let shouldHighlight = (this._tableViewDelegate && this._tableViewDelegate.tableCellShouldHighlight) ? this._tableViewDelegate.tableCellShouldHighlight(this, this._highlightedIndex) : true;
                            if (shouldHighlight) {
                                this._setHighlightedForCell(cell, true);
                            }
                        }
                    } else {
                        this._setHighlightedForCell(cell, false);
                        this._highlightedIndex = -1;
                    }
                }
            } else if (this._touchingIndex >= 0) {
                let cell = this.cellAtIndex(this._touchingIndex);
                if (cell) {
                    if (this.node.getComponent(cc.UITransform)!.getBoundingBoxToWorld().contains(touch.getUILocation())) {
                        let localTouch3D = this.content.getComponent(cc.UITransform)!.convertToNodeSpaceAR(cc.v3(touch.getUILocation().x, touch.getUILocation().y, 0));
                        let localTouch = cc.v2(localTouch3D.x, -localTouch3D.y);
                        // localTouch.y = this.content.getComponent(cc.UITransform)!.height - localTouch.y;
                        let tIndex = this._indexFromOffset(localTouch);
                        if (tIndex == this._touchingIndex) {
                            let shouldHighlight = (this._tableViewDelegate && this._tableViewDelegate.tableCellShouldHighlight) ? this._tableViewDelegate.tableCellShouldHighlight(this, tIndex) : true;
                            if (shouldHighlight) {
                                this._highlightedIndex = this._touchingIndex;
                                this._setHighlightedForCell(cell, true);
                            }
                        }
                    }
                }
            }
        }
    }

    protected _handleReleaseLogicForTableInteraction(touch: cc.Touch) {
        if (this.interactionMode == VDTableViewInteractionMode.NONE) {
            return;
        }
        if (this._highlightedTouchObj == touch) {
            if (this._highlightedIndex >= 0) {
                let cell = this.cellAtIndex(this._highlightedIndex);
                if (cell) {
                    this._setHighlightedForCell(cell, false);
                }
                this._highlightedIndex = -1;
            }
            this._touchingIndex = -1;
            let delta = touch.getLocation().clone().subtract(touch.getStartLocation());
            if (delta.length() <= 8) {
                this._onContentClick(touch);
            }
            this._highlightedTouchObj = null;
        }
    }

    protected _handleCancelLogicForTableInteraction(touch: cc.Touch | null) {
        if (this.interactionMode == VDTableViewInteractionMode.NONE) {
            return;
        }
        if (touch == null || this._highlightedTouchObj == touch) {
            if (this._highlightedIndex >= 0) {
                let cell = this.cellAtIndex(this._highlightedIndex);
                if (cell) {
                    this._setHighlightedForCell(cell, false);
                }
                this._highlightedIndex = -1;
            }
            this._touchingIndex = -1;
            this._highlightedTouchObj = null;
        }
    }

    private _setSelectedForCell(cell: cc.Node, selected: boolean, forceSelected: boolean = false) {
        let cellComp = cell.getComponent(VDTableCell) as VDTableCell;
        if (cellComp && (forceSelected || cellComp.selected != selected)) {
            cellComp.setSelected(selected);
        }
    }

    private _setHighlightedForCell(cell: cc.Node, highlighted: boolean, forceHighlighted: boolean = false) {
        let cellComp = cell.getComponent(VDTableCell) as VDTableCell;
        if (cellComp && (forceHighlighted || cellComp.highlighted != highlighted)) {
            cellComp.setHighlighted(highlighted);
        }
    }

    public selectCellAtIndex(index: number) {
        if (index < 0 || index >= this._lastestCellCount) return;
        if (this.interactionMode == VDTableViewInteractionMode.NONE ||
            this.interactionMode == VDTableViewInteractionMode.CLICK ||
            this._selectedIndices.indexOf(index) >= 0) return;

        if (!this._tableViewDelegate || !this._tableViewDelegate.tableCellShouldSelect || this._tableViewDelegate.tableCellShouldSelect(this, index)) {

            if (this.interactionMode == VDTableViewInteractionMode.SINGLE_SELECTION) {
                if (this.selectedIndex != -1) {
                    this.deselectCellAtIndex(this.selectedIndex);
                }
            }

            this._selectedIndices.push(index);
            let cell = this.cellAtIndex(index);
            if (cell) { //cell is showing
                this._setSelectedForCell(cell, true);
            }
            if (this._tableViewDelegate && this._tableViewDelegate.tableCellDidSelected) {
                this._tableViewDelegate.tableCellDidSelected(this, index);
            }
        }
    }

    public deselectCellAtIndex(index: number) {
        if (this.interactionMode == VDTableViewInteractionMode.NONE ||
            this.interactionMode == VDTableViewInteractionMode.CLICK) return;

        let localIndex = this._selectedIndices.indexOf(index);
        if (localIndex < 0) return;
        this._selectedIndices.splice(localIndex, 1);
        if (this._tableViewDelegate && this._tableViewDelegate.tableCellWillDeselected) {
            this._tableViewDelegate.tableCellWillDeselected(this, index);
        }
        let cell = this.cellAtIndex(index);
        if (cell) { //cell is showing
            this._setSelectedForCell(cell, false);
        }
    }

    private _onContentClick(touch: cc.Touch) {
        // cc.log(`_onContentClick `);
        if (this.interactionMode != VDTableViewInteractionMode.NONE) {
            let localTouch3D = this.content.getComponent(cc.UITransform)!.convertToNodeSpaceAR(cc.v3(touch.getUILocation().x, touch.getUILocation().y, 0));
            let localTouch = cc.v2(localTouch3D.x, -localTouch3D.y);
            let index = this._indexFromOffset(localTouch);
            let cell = this.cellAtIndex(index);
            if (cell) {
                if (this.interactionMode == VDTableViewInteractionMode.CLICK) {
                    if (this._tableViewDelegate && this._tableViewDelegate.tableCellClicked) {
                        this._tableViewDelegate.tableCellClicked(this, cell, index);
                    }
                } else if (this.interactionMode == VDTableViewInteractionMode.SINGLE_SELECTION) {

                    if (this._selectedIndices.length == 0) {
                        if (!this._tableViewDelegate ||
                            !this._tableViewDelegate.tableCellShouldSelect ||
                            this._tableViewDelegate.tableCellShouldSelect(this, index)) {
                            this._selectedIndices.push(index);
                            this._setSelectedForCell(cell, true);
                            if (this._tableViewDelegate && this._tableViewDelegate.tableCellDidSelected) {
                                this._tableViewDelegate.tableCellDidSelected(this, index);
                            }
                        }

                    } else {
                        if (this._selectedIndices.length == 1) {
                            let curIndex = this._selectedIndices[0];
                            if (curIndex != index) {
                                if (!this._tableViewDelegate ||
                                    !this._tableViewDelegate.tableCellShouldSelect ||
                                    this._tableViewDelegate.tableCellShouldSelect(this, index)) {

                                    this._selectedIndices.pop();
                                    if (this._tableViewDelegate && this._tableViewDelegate.tableCellWillDeselected) {
                                        this._tableViewDelegate.tableCellWillDeselected(this, curIndex);
                                    }
                                    let curCell = this.cellAtIndex(curIndex);
                                    if (curCell) {
                                        this._setSelectedForCell(curCell, false);
                                    }

                                    this._selectedIndices.push(index);
                                    this._setSelectedForCell(cell, true);
                                    if (this._tableViewDelegate && this._tableViewDelegate.tableCellDidSelected) {
                                        this._tableViewDelegate.tableCellDidSelected(this, index);
                                    }
                                }
                            }
                            else {
                                this._tableViewDelegate &&
                                    this._tableViewDelegate.tableClickOnSelectedCell &&
                                    this._tableViewDelegate.tableClickOnSelectedCell(this, index);
                            }
                        } else {
                            throw "table view selection logic error";
                        }
                    }

                } else if (this.interactionMode == VDTableViewInteractionMode.MULTIPLE_SELECTION) {
                    if (this._selectedIndices.length == 0) {
                        if (!this._tableViewDelegate ||
                            !this._tableViewDelegate.tableCellShouldSelect ||
                            this._tableViewDelegate.tableCellShouldSelect(this, index)) {
                            this._selectedIndices.push(index);
                            this._setSelectedForCell(cell, true);
                            if (this._tableViewDelegate && this._tableViewDelegate.tableCellDidSelected) {
                                this._tableViewDelegate.tableCellDidSelected(this, index);
                            }
                        }
                    } else {
                        let localIndex = this._selectedIndices.indexOf(index);
                        if (localIndex >= 0) {
                            this._selectedIndices.splice(localIndex, 1);
                            if (this._tableViewDelegate && this._tableViewDelegate.tableCellWillDeselected) {
                                this._tableViewDelegate.tableCellWillDeselected(this, index);
                            }
                            this._setSelectedForCell(cell, false);

                        } else {
                            if (!this._tableViewDelegate ||
                                !this._tableViewDelegate.tableCellShouldSelect ||
                                this._tableViewDelegate.tableCellShouldSelect(this, index)) {
                                this._selectedIndices.push(index);
                                this._setSelectedForCell(cell, true);
                                if (this._tableViewDelegate && this._tableViewDelegate.tableCellDidSelected) {
                                    this._tableViewDelegate.tableCellDidSelected(this, index);
                                }
                            }
                        }
                    }
                }
            }
        }
    }

    public getStartIndex(): number {
        let startIdx = this._indexFromOffset(cc.v2(Math.abs(this.offsetMinX), Math.abs(this.offsetMaxY)));
        return startIdx;
    }

    public getEndIndex(): number {
        let dX = 0;
        let dY = 0;
        if (this.direction == VDScrollDirection.VERTICAL) {
            dX = this._cellSize.width - 0.1;
        } else if (this.direction == VDScrollDirection.HORIZONTAL) {
            dY = this._cellSize.height - 0.1;
        }
        let endIdx = this._indexFromOffset(cc.v2(Math.abs(this.offsetMinX) + this.node.getComponent(cc.UITransform)!.width - dX, Math.abs(this.offsetMaxY) + this.node.getComponent(cc.UITransform)!.height - dY));
        if (endIdx < 0 || endIdx > this._lastestCellCount - 1) {
            endIdx = this._lastestCellCount - 1;
        }
        return endIdx;
    }

    public scrollToIndex(index: number, animated: boolean = true) {
        let offset = this._offsetFromIndex(index);
        let x = - this.content.getComponent(cc.UITransform)!.anchorX * this.content.getComponent(cc.UITransform)!.width + offset.x + this.node.getComponent(cc.UITransform)!.anchorX * this.node.getComponent(cc.UITransform)!.width;
        let y = (1.0 - this.content.getComponent(cc.UITransform)!.anchorY) * this.content.getComponent(cc.UITransform)!.height - offset.y - (1.0 - this.node.getComponent(cc.UITransform)!.anchorY) * this.node.getComponent(cc.UITransform)!.height;
        this.scrollTo(cc.v2(x, y), animated);
    }

    private _updateCellCount(): number {
        this._lastestCellCount = this._dataSource.numberOfCellsInTableView(this);
        return this._lastestCellCount;
    }

    protected scrollViewDidScroll(scrollView: VDScrollView) {
        let countOfItems = this._lastestCellCount;
        if (countOfItems <= 0) {
            return;
        }

        this._startIdx = this.getStartIndex();
        this._endIdx = this.getEndIndex();

        if (this._isUsedCellsDirty) {
            this._isUsedCellsDirty = false;
            this._cellsUsed.sort(function (a: cc.Node, b: cc.Node): number {
                return parseInt(a.name) - parseInt(b.name);
            });
        }

        let maxIdx = countOfItems - 1;

        if (this._cellsUsed.length > 0) {
            let cell = this._cellsUsed[0];
            let idx = parseInt(cell.name);
            while (idx < this._startIdx) {
                this._moveCellOutOfSight(cell, 0);
                if (this._cellsUsed.length > 0) {
                    cell = this._cellsUsed[0];
                    idx = parseInt(cell.name);
                } else {
                    break;
                }
            }
        }
        if (this._cellsUsed.length > 0) {
            let cell = this._cellsUsed[this._cellsUsed.length - 1];
            let idx = parseInt(cell.name);

            while (idx <= maxIdx && idx > this._endIdx) {
                this._moveCellOutOfSight(cell, this._cellsUsed.length - 1);
                if (this._cellsUsed.length > 0) {
                    cell = this._cellsUsed[this._cellsUsed.length - 1];
                    idx = parseInt(cell.name);
                } else {
                    break;
                }
            }
        }

        for (let i = this._startIdx; i <= this._endIdx; i++) {
            if (this._indices.has(i)) {
                continue;
            }
            this.updateCellAtIndex(i);
        }

        if (this._tableViewDelegate && this._tableViewDelegate.scrollViewDidScroll) {
            this._tableViewDelegate.scrollViewDidScroll(this);
        }
    }

    updateCellAtIndex(idx: number) {
        if (idx < 0 || idx >= this._lastestCellCount) {
            return;
        }

        let cell = this.cellAtIndex(idx);
        if (cell) {
            this._moveCellOutOfSight(cell);
        }
        if (idx >= this._startIdx && idx <= this._endIdx) {
            cell = this._dataSource.tableCellAtIndex(this, idx);
            this._setIndexForCell(idx, cell);
            this._addCellIfNecessary(cell);
            switch (this.interactionMode) {
                case VDTableViewInteractionMode.SINGLE_SELECTION:
                case VDTableViewInteractionMode.MULTIPLE_SELECTION:
                    this._setSelectedForCell(cell, this._selectedIndices.indexOf(idx) >= 0, true)
                    break;
                default:
                    break;
            }
        }
    }

    private _addCellIfNecessary(cell: cc.Node) {
        if (cell.parent != this.content) {
            this.content.addChild(cell);
        }
        this._cellsUsed.push(cell);
        this._indices.add(parseInt(cell.name));
        this._isUsedCellsDirty = true;
    }

    cellAtIndex(idx: number): cc.Node | null {
        if (this._indices.has(idx)) {
            for (let cell of this._cellsUsed) {
                if (parseInt(cell.name) == idx) {
                    return cell;
                }
            }
        }

        return null;
    }

    reloadData() {
        if (!this._isOnLoadCalled) {
            return;
        }
        for (let cell of this._cellsUsed) {
            if (this._tableViewDelegate && this._tableViewDelegate.tableCellWillRecycle) {
                this._tableViewDelegate.tableCellWillRecycle(this, cell, parseInt(cell.name));
            }

            this._cellsFreed.put(cell);
            cell.name = "-1";
            if (cell.parent == this.content) {
                this.content.removeChild(cell);
            }
        }

        this._indices.clear();
        this._cellsUsed.splice(0, this._cellsUsed.length);
        this._isUsedCellsDirty = true;
        this._updateContentSize();

        this.scrollViewDidScroll(this);
    }

    dequeueCell(): cc.Node {
        let cell: cc.Node = null!;
        if (this._cellsFreed.size() == 0) {
            cell = cc.instantiate(this.tableCell) as cc.Node;
            cell.name = "-1";
        } else {
            cell = this._cellsFreed.get()!;
        }
        return cell;
    }

    private _indexFromOffset(offset: cc.Vec2) {
        if (offset.x < 0 || offset.x > this._realContentSize.width || offset.y < 0 || offset.y > this._realContentSize.height) {
            return -1;
        }
        let index = -1;
        let cellNum = this._lastestCellCount;
        let maxIdx = cellNum - 1;
        let size = this._cellSize;

        if (this.direction == VDScrollDirection.VERTICAL) {
            let idxX = Math.floor(offset.x / size.width);
            let idxY = Math.floor(offset.y / size.height);
            if (this.fillOrder == VDTableViewFillOrder.LEFT_TO_RIGHT__TOP_TO_BOTTOM) {
                if (idxX >= this._cols) {
                    return -1;
                }
                index = idxY * this._cols + idxX;
            } else {
                if (idxY >= this._rows) {
                    return -1;
                }
                index = idxX * this._rows + idxY;
            }
        } else if (this.direction == VDScrollDirection.HORIZONTAL) {
            let idxX = Math.floor(offset.x / size.width);
            let idxY = Math.floor(offset.y / size.height);
            if (this.fillOrder == VDTableViewFillOrder.LEFT_TO_RIGHT__TOP_TO_BOTTOM) {
                if (idxX >= this._cols) {
                    return -1;
                }
                index = idxY * this._cols + idxX;
            } else {
                if (idxY >= this._rows) {
                    return -1;
                }
                index = idxX * this._rows + idxY;
            }
        }
        if (index >= 0 && index <= maxIdx) {
            return index;
        } else {
            return -1;
        }
    }

    private _offsetFromIndex(index: number) {
        let offset = cc.v2(0, 0);// cc.Vec2.ZERO;
        let cellSize = this._cellSize;

        if (this.direction == VDScrollDirection.VERTICAL) {
            let idxX = 0;
            let idxY = 0;
            if (this.fillOrder == VDTableViewFillOrder.LEFT_TO_RIGHT__TOP_TO_BOTTOM) {
                idxY = Math.floor(index / this._cols);
                idxX = index % this._cols;
            } else {
                idxX = Math.floor(index / this._rows);
                idxY = index % this._rows;
            }
            offset = cc.v2(idxX * cellSize.width, idxY * cellSize.height);
        } else if (this.direction == VDScrollDirection.HORIZONTAL) {
            let idxX = 0;
            let idxY = 0;
            if (this.fillOrder == VDTableViewFillOrder.LEFT_TO_RIGHT__TOP_TO_BOTTOM) {
                idxY = Math.floor(index / this._cols);
                idxX = index % this._cols;
            } else {
                idxX = Math.floor(index / this._rows);
                idxY = index % this._rows;
            }
            offset = cc.v2(idxX * cellSize.width, idxY * cellSize.height);
        }
        return offset;
    }

    private _moveCellOutOfSight(cell: cc.Node, idx: number = -1) {
        if (this._tableViewDelegate && this._tableViewDelegate.tableCellWillRecycle) {
            this._tableViewDelegate.tableCellWillRecycle(this, cell, parseInt(cell.name));
        }

        this._cellsFreed.put(cell);
        if (idx >= 0) {
            this._cellsUsed.splice(idx, 1);
        } else {
            let localIndex = this._cellsUsed.indexOf(cell);
            if (localIndex >= 0) {
                this._cellsUsed.splice(localIndex, 1);
            }
        }

        this._isUsedCellsDirty = true;
        this._indices.delete(parseInt(cell.name));

        cell.name = "-1";

        if (cell.parent == this.content) {
            this.content.removeChild(cell);
        }
    }

    private _setIndexForCell(index: number, cell: cc.Node) {
        let offset = this._offsetFromIndex(index);
        let x = - this.content.getComponent(cc.UITransform)!.anchorX * this.content.getComponent(cc.UITransform)!.width + offset.x + this._cellAnchor.x * this._cellSize.width;
        let y = (1.0 - this.content.getComponent(cc.UITransform)!.anchorY) * this.content.getComponent(cc.UITransform)!.height - offset.y - (1.0 - this._cellAnchor.y) * this._cellSize.height;
        cell.setPosition(cc.v3(x, y, 0));
        cell.name = index.toString();
    }

    private _onViewSizeChanged() {
        this._updateContentSize();
        if (this._isOnLoadCalled && this.enabledInHierarchy) {
            this.reloadData();
        }
    }

    private _updateGridData(): void {
        this._updateCellCount();
        let cellsCount = this._lastestCellCount;
        if (cellsCount > 0) {
            switch (this.direction) {
                case VDScrollDirection.HORIZONTAL:
                    {
                        this._rows = Math.min(cellsCount, Math.floor((Math.max(this.node.getComponent(cc.UITransform)!.height, this._cellSize.height)) / this._cellSize.height));
                        this._cols = Math.ceil(cellsCount / this._rows);
                        this._realContentSize = cc.size(this._cols * this._cellSize.width, this._rows * this._cellSize.height);
                    }
                    break;
                case VDScrollDirection.VERTICAL:
                    {
                        this._cols = Math.min(cellsCount, Math.floor(Math.max(this.node.getComponent(cc.UITransform)!.width, this._cellSize.width) / this._cellSize.width));
                        this._rows = Math.ceil(cellsCount / this._cols);
                        this._realContentSize = cc.size(this._cols * this._cellSize.width, this._rows * this._cellSize.height);
                    }
                    break;
                default:
                    break;
            }
        } else {
            this._realContentSize = cc.Size.ZERO;
            this._rows = this._cols = 0;
        }
    }

    private _updateContentSize() {
        this._updateGridData();
        // var e = this._realContentSize;
        let maxWidth = Math.max(this.node.getComponent(cc.UITransform)!.width, this._realContentSize.width);
        let maxHeight = Math.max(this.node.getComponent(cc.UITransform)!.height, this._realContentSize.height);
        this._realContentSize = cc.size(maxWidth, maxHeight);
        this.content.getComponent(cc.UITransform)!.contentSize.equals(this._realContentSize) || (this.content.getComponent(cc.UITransform)!.setContentSize(this._realContentSize),
            this.enabledInHierarchy || this._recalculateBoundary());
        // cc.log(`contentSize: ${this.content.getComponent(cc.UITransform)!.contentSize}`);
        // cc.log(`_realContentSize: ${this._realContentSize}`);
        // cc.log(`node: ${this.node.getComponent(cc.UITransform)!.contentSize}`);
    }

}
