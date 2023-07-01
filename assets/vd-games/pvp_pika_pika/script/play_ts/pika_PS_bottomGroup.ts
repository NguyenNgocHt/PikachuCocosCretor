import { _decorator, Component, Node } from 'cc';
import { pika_Director } from '../core/pika_Director';
import { pika_hintPick_inputData_toSever, pika_swapIcon_inputData_toSever } from '../model/pika_input_to_sever_data';
import { pika_searchingOpp_data_model } from '../model/pika_searching_data_model';
import { pika_CommandID_IP } from '../network/pika_NetworkDefine';
const { ccclass, property } = _decorator;

@ccclass('pika_PS_bottomGroup')
export class pika_PS_bottomGroup extends Component {
    @property(Node)
    swap_icon_player: Node = null;
    @property(Node)
    hint_pick_player: Node = null;
    @property(Node)
    show_swap_icon_opp: Node = null;
    @property(Node)
    show_hintPick_opp: Node = null;
    private IP_swapIconData: pika_swapIcon_inputData_toSever = null;
    private IP_hintPickIconData: pika_hintPick_inputData_toSever = null;
    private OP_searchingDataOpp_dataModel: pika_searchingOpp_data_model = null;
    private count_onClickButton_swapIcon: number = 0;
    private count_onClickButton_hintPick: number = 0;
    start() {
        this.OP_searchingDataOpp_dataModel = pika_Director.instance.OP_searching_OPP_data_model
    }
    onClick_button_swap_icon_player() {
        this.count_onClickButton_swapIcon = this.count_onClickButton_swapIcon + 1;
        if (this.count_onClickButton_swapIcon == 1) {
            this.IP_swapIconData = {
                id: pika_CommandID_IP.SWAP_ICON,
                r: this.OP_searchingDataOpp_dataModel.roomID,
            };
            pika_Director.instance.send_swapIconData_toSever(this.IP_swapIconData);
        } else {
            //khoa
        }
    }
    onClick_button_hind_player() {
        this.count_onClickButton_hintPick = this.count_onClickButton_hintPick + 1;
        if (this.count_onClickButton_hintPick == 1) {
            this.IP_hintPickIconData = {
                id: pika_CommandID_IP.HINT_PICK,
                r: this.OP_searchingDataOpp_dataModel.roomID,
            };
            pika_Director.instance.send_hintPickIconData_toSever(this.IP_hintPickIconData);
        } else {
            //khoa
        }
    }
    show_swapIcon_opp() {

    }
    show_hint_Pick_opp() {

    }
    update(deltaTime: number) {

    }
}


