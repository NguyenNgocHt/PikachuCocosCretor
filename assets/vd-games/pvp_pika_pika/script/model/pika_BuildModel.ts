import { pika_searchingScreen } from "../screens/pika_searchingScreen";
import { pika_BetInfoData, pika_PlayerInfoModel, pika_loading_data_full, pika_PlayerInfoShort, pika_BetInfoModel } from "./pika_Loading_data_model";
import { pika_RECONNECTED_dataModel, pika_RECONNECTED_data_infoShort, pika_board_icon_dataInfoShort, pika_board_icon_dataModel, pika_endGame_dataModel, pika_endGame_data_infoShort, pika_pickChess_dataModel, pika_pickChess_data_infoShort, pika_timer_playGame_dataInfoShort, pika_timer_playGame_dataModel } from "./pika_play_data_model";
import { pika_searchingOpp_data_infoShort, pika_searchingOpp_data_model } from "./pika_searching_data_model";
export class pika_BuildModel {
    static buildPlayerModel(loadingDataFull: pika_loading_data_full): pika_PlayerInfoModel {
        const playerModel: pika_PlayerInfoModel = {
            playerId: loadingDataFull.id,
            displayName: loadingDataFull.n,
            avatarLink: loadingDataFull.a,
            money: loadingDataFull.S,
            version: loadingDataFull.v
        };
        return playerModel;
    }

    static builBetsModel(loadingDataFull: pika_loading_data_full): pika_BetInfoModel {
        const betsModel: pika_BetInfoModel = {
            betAmount: JSON.parse(loadingDataFull.b),
        };
        return betsModel;
    }

    static build_pickChess_model(pickChessData_infoShort: pika_pickChess_data_infoShort): pika_pickChess_dataModel {
        const pickChessModel: pika_pickChess_dataModel = {
            dataID: pickChessData_infoShort.id,
            isSelf: pickChessData_infoShort.i,
            status: pickChessData_infoShort.s,
            playerAdd: pickChessData_infoShort.pA,
            playerTotalPoint: pickChessData_infoShort.p,
            oppAdd: pickChessData_infoShort.opA,
            oppTotalPoint: pickChessData_infoShort.op,
            x: JSON.parse(pickChessData_infoShort.x),
            y: JSON.parse(pickChessData_infoShort.y),
            x1: pickChessData_infoShort.x1,
            y1: pickChessData_infoShort.y1,
            x2: pickChessData_infoShort.x2,
            y2: pickChessData_infoShort.y2,
        };
        return pickChessModel;
    }

    static build_searching_opp_model(searching_data_infoShort: pika_searchingOpp_data_infoShort): pika_searchingOpp_data_model {
        const searching_opp_model: pika_searchingOpp_data_model = {
            dataID: searching_data_infoShort.id,
            roomID: searching_data_infoShort.r,
            opp_name: searching_data_infoShort.n,
            bets: searching_data_infoShort.b,
            h: searching_data_infoShort.h,
            opp_avatar: searching_data_infoShort.a,
            token: searching_data_infoShort.t,
        };
        return searching_opp_model;
    }
    static build_timer_playGame_model(timer_playGame_infoShort: pika_timer_playGame_dataInfoShort): pika_timer_playGame_dataModel {
        const timer_playGame_model: pika_timer_playGame_dataModel = {
            dataID: timer_playGame_infoShort.id,
            time_count: timer_playGame_infoShort.c,
        };
        return timer_playGame_model;
    }
    static build_board_icon_data_model(boardICon_infoShort: pika_board_icon_dataInfoShort): pika_board_icon_dataModel {
        const board_icon_model: pika_board_icon_dataModel = {
            dataID: boardICon_infoShort.id,
            board: JSON.parse(boardICon_infoShort.board),
        };
        return board_icon_model;
    }
    static build_reconnectData_model(reconnectData_infoShort: pika_RECONNECTED_data_infoShort): pika_RECONNECTED_dataModel {
        const reconnectData_model: pika_RECONNECTED_dataModel = {
            dataID: reconnectData_infoShort.id,
            idRoom: reconnectData_infoShort.r,
            oppName: reconnectData_infoShort.n,
            bets: reconnectData_infoShort.b,
            h: reconnectData_infoShort.h,
            oppAvatar: reconnectData_infoShort.a,
            playerPoint: reconnectData_infoShort.mP,
            oppPoint: reconnectData_infoShort.oP,
            status: reconnectData_infoShort.s,
        };
        return reconnectData_model;
    }
    static build_endGameData_model(endGameData_infoShort: pika_endGame_data_infoShort): pika_endGame_dataModel {
        const endGameData_model: pika_endGame_dataModel = {
            dataID: endGameData_infoShort.id,
            coinWin: endGameData_infoShort.w,
        }
        return endGameData_model;
    };
}
