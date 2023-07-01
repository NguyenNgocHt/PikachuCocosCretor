import { EPSILON } from "cc";

export type pika_icon_list = {
    icon_list: number[][];
}
//pick chess output
export type pika_pickChess_dataModel = {
    dataID: number;
    isSelf: boolean;
    status: boolean;
    playerAdd: number;
    playerTotalPoint: number;
    oppAdd: number;
    oppTotalPoint: number;
    x: number[];
    y: number[];
    x1: number;
    y1: number;
    x2: number;
    y2: number;
}

export type pika_pickChess_data_infoShort = {
    id: number;
    i: boolean;
    s: boolean;
    pA: number;
    p: number;
    opA: number;
    op: number;
    x: string;
    y: string;
    x1: number;
    y1: number;
    x2: number;
    y2: number;
}
//end game output
export type pika_endGame_dataModel = {
    dataID: number;
    coinWin: number;
}
export type pika_endGame_data_infoShort = {
    id: number;
    w: number;
}
//out game data
export type pika_outGame_infoShort = {
    id: number;
}
export type pika_disconnected_infoShort = {
    id: number;
}
export type pika_reconnected_infoShort = {
    id: number;
}
//reconnect
export type pika_RECONNECTED_dataModel = {
    dataID: number;
    idRoom: number;
    oppName: string;
    bets: number;
    h: number;
    oppAvatar: string;
    playerPoint: number;
    oppPoint: number;
    status: boolean;
}
export type pika_RECONNECTED_data_infoShort = {
    id: number;
    r: number;
    n: string;
    b: number;
    h: number;
    a: string;
    mP: number;
    oP: number;
    s: boolean;
}
//end stage output
export type pika_endStage_dataModel = {
    dataID: number;
    isSelf: boolean;
    roomID: number;
}
export type pika_endStage_data_infoShort = {
    id: number;
    i: boolean;
    r: number;
}
export type pika_timer_playGame_dataModel = {
    dataID: number,
    time_count: number,
}
export type pika_timer_playGame_dataInfoShort = {
    id: number,
    c: number,
}
//board data
export type pika_board_icon_dataModel = {
    dataID: number,
    board: any,
}
export type pika_board_icon_dataInfoShort = {
    id: number,
    board: string,
}
export type pika_hint_pick_gamePlay_dataModel = {
    id: number,
    x1: number,
    y1: number,
    x2: number,
    y2: number,
};


