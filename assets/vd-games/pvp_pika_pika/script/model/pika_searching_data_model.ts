export type pika_searchingOpp_data_model = {
    dataID: number;
    roomID: number;
    opp_name: string;
    bets: number;
    h: number;
    opp_avatar: string;
    token: number;
}
export type pika_searchingOpp_data_infoShort = {
    id: number;
    r: number;
    n: string;
    b: number;
    h: number;
    a: string;
    t: number,
};
//khong du tien cuoc output
export type noMoney_data_infoShort = {
    id: number;
}
export type pika_seaching_start_data = {
    seaching_avatar_name: string;
    searching_text: string;
};