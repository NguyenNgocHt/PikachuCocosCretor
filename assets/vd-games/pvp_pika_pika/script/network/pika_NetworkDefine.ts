export const pika_NETWORK_STATE_EVENT = {
    ERROR: 'dm-network-error',
    DISCONNECT: 'dm-network-disconnect',
}
export const pika_GAME_STATE_EVENT = {
    LOGIN_SUCCESS: 'dm-login-success',
    SEARCHING_OPP_DATA_MODEL: 'searching-opp-data-model',
    PLAYING_PICK_CHESS_DATA_MODEL: 'playing-pick_chess-data-model',
    NEXT_STAGE_DATA_MODEL: 'next-stage-data-model',
    PLAYING_ENDGAME_DATA_MODEL: 'playing-end-game-data-model',
    END_GAME_DATA_MODEL: 'end-game-data-model',
    RECONNECT_DATA_MODEL: 'reconnect-data-model',
    END_STAGE_DATA_MODEL: 'end-stage-data-model',
    WIN_LOSE_ROUND_END: 'win-lose-round-end',
    DISCONNECT_OPP: 'disconnect-opp',
    NO_MONEY_DATA: 'no-money-data',
    TIMER_PLAYGAME_DATA_MODEL: 'timer-playgame-data-model',
    BOARD_ICON_DATA_MODEL: 'board-icon-data-model',
    SWAP_ICON_DATA: 'swap-icon-data-model',
    HINT_PICK_DATA: 'hint-pick-data-model',
    //button setting
    MOVE_BUTTON_POSITION: 'move-button-position',
    BUTTON_MOVING_STATE: 'button-moving-state',
    SEND_TAP_LEFT_RIGHT_STATE_PLAYER: 'send-tap-left-right-state-player',
    SEND_TAP_LEFT_RIGHT_STATE_OPP: 'send-tap-left-right-state-opp',
    //start effect end
    START_EFFECT_END: 'start-effect-end',
    //texture package add
    //icon_chess_properties
    ICON_CHESS_PROPERTIES_1: 'icon-chess-properties_1',
    ICON_CHESS_PROPERTIES_2: 'icon-chess-properties_2',
    ICON_MOVING_END: 'icon-moving-end',
    IN_OUT_SWAP_ICON: 'in-out-swap-icon',
}
export let pika_CommandID_IP = {
    PLAY_READY_IP: 3010,
    BETS_IP: 3001,
    PLAYING_PICK_CHESS_IP: 3004,
    DISCONNECT_IP: 3007,
    PLAYING_LEAVE_GAME_IP: 3003,
    STOP_MACHING_IP: 3005,
    RECONNECT_IP: 3006,
    UPDATE_MONEY: 3013,
    SWAP_ICON: 3002,
    HINT_PICK: 3007,
    RECONNECT_PLAYREADY: 3008,

}
export let pika_CommandID_OP = {
    LOGIN_RETURN_OP: 3999,
    SEARCHING_DATA_OPP: 3501,// output from sever tra ve goi tin nguoi choi va doi thu trong man searching
    PICK_CHESS_OP: 3504,
    END_GAME_OP: 3510,
    RECONNECT_OP: 3506,
    ENDSTAGE_OP: 3507,
    DISCONNECT_OPP: 3511,
    TIMER_OP: 3006,
    BOARD_DATA_OP: 3502,
    HINT_PICK_DATA_OP: 3507,
}
export const pika_LOCAL_STORAGE = {
    SEARCHING_DATA_MODEL: 'SEARCHING_DATA_MODEL',
    PLAYER_DATA_MODEL: 'PLAYER-DATA-MODEL',
    NEXT_STAGE_DATA_MODEL: 'NEXT_STAGE_DATA_MODEL',
    ARR_BUTTON_LEFT_RIGHT: 'arr-button-left-right',
}