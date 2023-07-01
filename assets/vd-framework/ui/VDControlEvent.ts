import * as cc from 'cc';

const { ccclass, property } = cc._decorator;

@ccclass
export default class VDControlEvent {
    static Click: string = 'click';
    static ClickByTouchHandler: string = 'click-by-touch-handler';
    static ShowTooltip: string = 'show-tooltip';
    static LongClick: string = 'long-click';
    static TouchDown: string = 'touch-down';
    static TouchDragInside: string = 'touch-drag-inside';
    static TouchDragOutside: string = 'touch-drag-outside';
    static TouchDragEnter: string = 'touch-drag-enter';
    static TouchDragExit: string = 'touch-drag-exit';
    static TouchUpInside: string = 'touch-up-inside';
    static TouchUpOutside: string = 'touch-up-outside';
    static TouchCancel: string = 'touch-cancel';

    static DragBegan: string = 'drag-began';
    static DragMoved: string = 'drag-moved';
    static DragEnded: string = 'drag-ended';
    static DragCancelled: string = 'drag-cancelled';

    static CanvasCancel: string = 'canvas-cancelled';

    static TutorialNextStep: string = 'tutorial-next-step';
    static TutorialNextConversation: string = 'tutorial-next-conversation';
    static TutorialFinishConversation: string = 'tutorial-finish-conversation';
    static TutorialStartConversation: string = 'tutorial-start-conversation';
    static TutorialFinished: string = 'tutorial-finished';
    static TabbarItemSelected: string = 'tabbar-item-selected';

    static ScreenWillAppear: string = "ScreenWillAppear";
    static ScreenDidAppear: string = "ScreenDidAppear";
    static ScreenWillDisappear: string = "ScreenWillDisappear";
    static ScreenDidDisappear: string = "ScreenDidDisappear";

    static PopupWillAppear: string = "PopupWillAppear";
    static PopupDidAppear: string = "PopupDidAppear";
    static PopupWillDisappear: string = "PopupWillDisappear";
    static PopupDidDisappear: string = "PopupDidDisappear";

    static WindowWillAppear: string = "WindowWillAppear";
    static WindowDidAppear: string = "WindowDidAppear";
    static WindowWillDisappear: string = "WindowWillDisappear";
    static WindowDidDisappear: string = "WindowDidDisappear";

    static ScreenDidPush: string = "ScreenDidPush";
    static ScreenDidPop: string = "ScreenDidPop";

    static SymbolClick: string = 'symbol-click';
    static SpinButtonClick: string = 'spin-clicked';
    static SpinButtonTapAndHold: string = 'spin-tap-and-hold';
};
