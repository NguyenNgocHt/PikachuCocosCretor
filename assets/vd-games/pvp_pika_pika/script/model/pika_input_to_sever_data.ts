import { ExtrapolationMode } from "cc";

export type pika_playStart_inputData_toSever = {
    id: number;
    r: number;
}
export type pika_bets_inputData_toSever = {
    id: number;
    b: number;
}
export type pika_pickChess_inputData_toSever = {
    id: number;
    r: number;
    x1: number;
    y1: number;
    x2: number;
    y2: number;
}
export type pika_leaveGame_inputData_toSever = {
    id: number;
    r: number;
}
export type pika_update_money_inputData_toSever = {
    id: number;
}
export type pika_swapIcon_inputData_toSever = {
    id: number,
    r: number,
};
export type pika_hintPick_inputData_toSever = {
    id: number,
    r: number,
}
export type pika_reconnectReady_inputData_toSever = {
    id: number,
    r: number,
};
export type pika_stopSearchingOpp_inputData_ToSever = {
    id: number,
    b: number,
}

