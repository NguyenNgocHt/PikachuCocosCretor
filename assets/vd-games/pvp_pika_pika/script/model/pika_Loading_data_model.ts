export type pika_loading_data_full = {
    id: number;
    n: string; //ten nhan vat
    a: string; //link avatar
    S: number; //tien hien co
    b: string; //bets list
    v: number;// version game
}
export interface pika_PlayerInfoModel {
    playerId: number;
    displayName: string; // Nickname
    avatarLink: string;
    money: number;
    version: number;
}

export type pika_PlayerInfoShort = {
    id: number;// ma id nhan dang
    n: string; // ten nhan vat
    a: string; //link avatar
    S: number;// tien dang co
    v: number;

};
export interface pika_BetInfoModel {
    betAmount: number[];
}

export type pika_BetInfoData = {
    bA: number[];
};


