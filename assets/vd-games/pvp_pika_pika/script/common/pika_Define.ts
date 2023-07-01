import { DEFAULT_WORLD_MAX_POS } from "cc";

export const pika_Text = {
    ERROR_LOADING_ASSETS: 'Đã có lỗi tải tài nguyên, vui lòng thử lại',
    NO_MONEY: 'Số dư trong ví không đủ,\nvui lòng nạp thêm để chơi tiếp.',
    ANOTHER_ACCOUNT: 'Tài khoản của bạn đã\nđăng nhập từ thiết bị khác.',
    AUTHEN_FAILED: 'Xác thực tài khoản thất bại.',
    MISMATCH_DATA: 'Dữ liệu không đồng bộ với máy chủ,\nvui lòng thử lại.',
    SYSTEM_ERROR: 'Có lỗi xảy ra,\nvui lòng thử lại.',
    NETWORK_WARNING: 'Đường truyền mạng yếu!',
    NO_CONNECT: 'Không có kết nối, vui lòng thử lại',
    ERROR_CONNECT: 'Kết nối thất bại. \n Vui lòng thử lại ...',
    LOST_CONNECT: 'Bạn đã bị mất kết nối. \n Vui lòng thử lại ...',
    DISCONNECT: 'Bị mất kết nối tới máy chủ\n Đang kết nối lại.',
    NO_PLAYSESSION: 'Hệ thống không tìm thấy phiên chơi.',
    GROUP_MAINTAIN: 'Hệ thống đang bảo trì.\nVui lòng quay lại sau.',
    IN_PROGRESSING: 'Mạng chậm vui lòng đợi trong \ngiây lát để hoàn thành\nlượt quay hoặc bấm xác nhận \nđể tải lại game.',
    ACCOUNT_BLOCKED: 'Tài khoản của bạn đã bị khoá,\nvui lòng liên hệ admin.',
    EVENT_NOT_AVAILABLE: 'Sự kiện không hợp lệ,\nvui lòng thử lại.'
}

export const pika_Path = {
    LOADING_SCREEN: 'res/prefabs/screen/loading_screen',
    PLAY_SCREEN: 'res/prefabs/screen/play_screen',
    HOME_SCREEN: 'res/prefabs/screen/home_screen',
    SEARCH_SCREEN: 'res/prefabs/screen/search_screen',
    RESULT_SCREEN: 'res/prefabs/screen/result_screen',
    TEST_NETWORK_SCREEN: 'res/prefabs/screen/test_network_screen',
    ICON_PIKA: 'res/prefabs/pf_play/pika_icon',

    NOTIFY_POPUP: 'res/prefabs/popup_common/popup_notify',
    SETTING_POPUP: 'res/prefabs/popup_common/popup_setting',
    HOME_SETTING_POPUP_CUSTOMIZE: 'res/prefabs/popup_common/home_screen_popup_customize',
    PLAY_SCREEN_POPUP: 'res/prefabs/popup_common/play_screen_popup',
    WATING_PROGRESS: 'res/prefabs/popup_common/waiting_progress',
    TEXTURE_ATLAS_ADD: 'res/images/texturePackage/pika_TP_1',
    TEXTURE_ATLAS_ADD_2: 'res/images/texturePackage/pika_TP_2',
};
export const pika_seaching_avatar = {
    AVATAR_NAME: 'avatar_wait',
    SEARCHING_TEXT: 'Đang tìm kiếm',
};
export enum ON_OFF_STATE {
    NOT_STATE = 0,
    ON = 1,
    OFF = 2
};
export enum RECONNECT_STATE {
    NO_STATE = 0,
    NORMAL_CONNECT = 1,
    RECONNECT = 2,
};
export enum CONNECT_STATE {
    NO_STATE = 0,
    CONNECT = 1,
    DISCONNECT = 2,
};
export enum RECONNECT_RELOADING_PLAYSCREEN {
    NO_STATE = 0,
    RELOADING = 1,
    PLAYSCREEN = 2,
};
export type pika_chess_icon_properties = {
    name: string;
    cot: number;
    hang: number;
    status_vanhdai: boolean// true: vanh dai , false: khong phai vanh dai
    status_icon: boolean//false: icon.active = false_ true: icon.active = true;
    pos_X: number;
    pos_Y: number;
    width: number;
    height: number;
    hollow: boolean,
    moving_status: ICON_MOVING_STATUS,
    movingNext_status: MOVINGNEXT_STATUS,
};
export const pika_seaching_avatar_waiting = {
    AVATAR_NAME: 'avatar_wait',
    SEARCHING_TEXT: 'Đang tìm kiếm',
};
export enum PIKA_SEND_PICK_ICON_TOSEVER_STATE {
    NO_STATE = 0,
    WAITING = 1,
    READY_TO_SEND = 2,
};
export enum GAME_LEVEL {
    NO_STATE = 0,
    LEVER_EASY = 1,
    LEVER_NOMAL = 2,
    LEVER_HARD = 3,
};
export enum ICON_MOVING_STATUS {
    NO_STATUS = 0,
    MOVING_UP = 1,
    MOVING_DOWN = 2,
    STOP = 3,
};
export enum DELAY_SET_ICON_STATUS {
    NO_STATUS = 0,
    IN_DELAY = 1,
    OUT_DELAY = 2,
};
export enum ICON_OLD_NEW_STATUS {
    NO_STATUS = 0,
    OLD = 1,
    NEW = 2,
};
export enum IN_OUT_SWAP_ICON_STATUS {
    NO_STATUS = 0,
    IN_SWAP_ICON = 1,
    OUT_SWAP_ICON = 2,
};
export enum PICK_ICON_STATUS {
    NO_STATUS = 0,
    PICK_CORRECT = 1,
    PICK_FALSE = 2,
}
export enum MOVINGNEXT_STATUS {
    NO_STATUS = 0,
    DOWN_NEXT = 1,
    UP_NEXT = 2,
}
export enum UPNEXT_STATUS {
    NO_STATUS = 0,
    UP_NEXT = 1,
    STOP = 2,
}
export enum MONITER_STATUS {
    NO_STATUS = 0,
    MONITER_START = 1,
    MONOTER_END = 2,
}
export enum SEARCHING_STATUS {
    NO_STATUS = 0,
    SEARCHING = 1,
    FIND_A_OPP = 2.
}
export enum WIN_LOSE_DRAW_STATUS {
    NO_STATUS = 0,
    WIN = 1,
    LOSE = 2,
    DRAW = 3,
}
export enum SEARCHING_COMEBACK_STATUS {
    NO_STATUS = 0,
    SEARCHING_NOMAL = 1,
    SEARCHING_COMEBACK = 2,
};

