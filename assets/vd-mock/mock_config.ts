
import { log, random } from 'cc';
import { pika_CommandID_OP } from '../vd-games/pvp_pika_pika/script/network/pika_NetworkDefine';
import { pika_Director } from '../vd-games/pvp_pika_pika/script/core/pika_Director';
log('mock_config', '1.0.0');

export let mock_config = {
    API_URL: "https://api.vietdefi.com/",
    SOCKET_URL: "wss://sock.api.vietdefi.com",
    LOGIN_USE_TOKEN: true,
    LOGIN_IFRAME: true,
    URL_TOKEN: 'token',
    URL_CODE: 'code',
    USER_TOKEN: "user_token",
    ENABLE_SFX: "enableSound",
    ENABLE_BGM: "enableBackgroundMusic",
    USER_NAME: "user_name_1",
    MONEY_FOR_PLAYER: 9999999,
    AVATAR_FOR_PLAYER: 1,
    BEST_LIST: [50, 100, 150, 200, 250, 300],
    USER_NAME_COMP: "user_name_2",
    AVATAR_COMP: 2,
    AVATAR_WAIT: "avatar_wait",
    STRING_WAIT_SEARCHING: "searching",
    fish_lis: ["Ca_Bom", "Ca_Do", "Ca_Lam", "Ca_Luc", "Ca_Thiu", "Ca_Thuong", "Ca_Vang"],
    point_player: 9,
    point_opp: 30,
    round_level: 5,
}
export let avatar = {
    avatar: [1, 2],
}
export let user_name = {
    user_name: ["user_name_1", "user_name_2"],
}
export let money_for_player = {
    moneyForPlayer: [9999999, 9999999],
}
export let fish_lis = {
    fish_lis: ["Ca_Bom", "Ca_Do", "Ca_Lam", "Ca_Luc", "Ca_Thiu", "Ca_Thuong", "Ca_Vang"],
}
export let best_list = {
    BEST_LIST: [500, 1000, 2000, 3000, 4000, 5000],
}
export let random_number = {
    random_number_fish_list: Math.floor(Math.random() * 6) + 0,
    random_number_hand_moving_start_comp: (Math.floor(Math.random() * 10) + 1) / 10,
}
export let round_list = {
    ROUND_LIST: [1, 2, 3, 4, 5]
}
export let game_win_lose = {
    win_lose: [0, 1]
}
export let player_tapData_fake = {
    id: 1504,
    i: 0,
    s: 1,
    pA: 1,
    p: 8,
    opA: 0,
    op: 7,
    uid: 100,
    oid: 101,
}
export let nex_stage_Data_fake = {

}