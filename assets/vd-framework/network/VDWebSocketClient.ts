import * as cc from 'cc';
import { log } from 'cc';

export enum WEBSOCKET_GAME_STATE {
    NOT_CONNECTED = 0,
    CONNECTING = 1,
    CONNECTED = 2,
    RECONNECTING = 3,
    ERROR = 4,
    DISCONNECT = 5,
    CLOSE = 6
}

export default class VDWebSocketClient {
    private _ws: WebSocket | null = null;
    private _wsUrl: string = '';
    private _listener: any = null;

    private _timer: number = 0;
    private _idPingPong: number = 0;
    private _countWaitingPong: number = 0;
    private _isWaitingPong: boolean = false;

    private _lastTime: number = 0;

    private _isClosed: boolean = false;
    private _isReconnect: boolean = true;
    private _reconnectCount: number = 0;

    public wsGameState: WEBSOCKET_GAME_STATE = WEBSOCKET_GAME_STATE.NOT_CONNECTED;

    private ID_PING_PONG: number = 2;

    constructor() {
        this._wsUrl = '';
        this._timer = 0;
        this._lastTime = 0;
        this._reconnectCount = 0;
        this._countWaitingPong = 0;
        this._idPingPong = this.ID_PING_PONG;

        this._isClosed = false;
        this._isReconnect = true;

        this._ws = null;
        this._listener = null;

        this.wsGameState = WEBSOCKET_GAME_STATE.NOT_CONNECTED;
    }

    connect(host, port, isSsl, userID, listenner, token) {
        if (this._ws) return;

        this._listener = listenner;

        if (port > 0) {
            this._wsUrl = "ws" + (isSsl ? "s" : "") + "://" + host + ":" + port + "/ws/pk";
        } else {
            this._wsUrl = "ws" + (isSsl ? "s" : "") + "://" + host + "/ws/pk";
        }

        this._wsUrl += "?id=" + userID + "&token=" + token;

        this._listener = listenner;
        this.wsGameState = WEBSOCKET_GAME_STATE.CONNECTING;
        this.connectWS(this._wsUrl);
    }

    connectWS(url) {
        log('@ connectWS with url = ' + url);
        // if (this._ws && this.wsGameState == WEBSOCKET_GAME_STATE.CONNECTED) {
        if (this._ws) {
            this.closeSocket();
            return;
        }
        if (this._isClosed) return;

        clearInterval(this._timer);
        this._countWaitingPong = 0;

        cc.log("[VDWebSocketClient] init websocket: url = " + this._wsUrl);
        this._ws = new WebSocket(this._wsUrl);
        this._ws.onopen = this.onSocketOpen.bind(this);
        this._ws.onmessage = this.onSocketMessage.bind(this);
        this._ws.onerror = this.onSocketError.bind(this);
        this._ws.onclose = this.onSocketClose.bind(this);

        this._idPingPong = this.ID_PING_PONG;
    }

    reconnect() {
        log('@ reconnect');
        if (this._isClosed) return;
        if (this.wsGameState == WEBSOCKET_GAME_STATE.CONNECTED || this.wsGameState == WEBSOCKET_GAME_STATE.RECONNECTING) return;
        this._isReconnect = false;
        this._lastTime = (new Date()).getTime();
        this.wsGameState = WEBSOCKET_GAME_STATE.RECONNECTING;
        this.connectWS(this._wsUrl);
    }

    onSocketOpen() {
        if (this.wsGameState == WEBSOCKET_GAME_STATE.CONNECTED) return;

        this.wsGameState = WEBSOCKET_GAME_STATE.CONNECTED;
        this._lastTime = 0;
        this._isClosed = false;
        this._isReconnect = true;
        this._timer = setInterval(function () {
            this.pingpong();
        }.bind(this), 2 * 1000);
        // this._idPingPong++;
        this._listener.target = this;

        if (this._listener && this._listener.onSocketOpen) {
            if (this._reconnectCount == 0)
                this._listener.onSocketOpen.call(this._listener);
            else
                this._listener.onSocketReconnect.call(this._listener);

            this._reconnectCount = 0;
        }
    }

    onSocketMessage(event) {
        if (this._isClosed) return;

        if (this._listener && this._listener.onSocketMessage) {
            // cc.log("@@@ [VDWebSocketClient] onSocketMessage event = " + JSON.stringify(event)
            //     + ', data = ' + event.data);

            let commandID = JSON.parse(event.data)['id'];
            if (commandID && commandID == this.ID_PING_PONG) {
                log('@ pong received!');
                this._isWaitingPong = false;
                this._countWaitingPong = 0;
            }
            this._listener.onSocketMessage.call(this._listener, 0, event.data);
        }
    }
    onSocketError() {
        cc.log("@@@ [VDWebSocketClient] onSocketError");
        if (this._isClosed) return;
        if (this.wsGameState == WEBSOCKET_GAME_STATE.RECONNECTING && this._reconnectCount > 0) return;

        this.wsGameState = WEBSOCKET_GAME_STATE.ERROR;

        if (this._listener && this._listener.onSocketError) {
            this._listener.target = this;
            this._listener.onSocketError.call(this._listener);
        }
    }

    onSocketClose() {
        cc.log("@@@ [VDWebSocketClient] onSocketClose");
        if (this._isClosed) {
            this._isClosed = false;
            return;
        }

        if (this.wsGameState == WEBSOCKET_GAME_STATE.ERROR) return;

        this.wsGameState = WEBSOCKET_GAME_STATE.CLOSE;

        this._ws.onopen = null;
        this._ws.onmessage = null;
        this._ws.onerror = null;
        this._ws.onclose = null;
        this._ws = null;

        setTimeout(function () {
            // log('@ --- callTimeout 500-- wsGameState = ' + this.wsGameState);
            if (this.wsGameState == WEBSOCKET_GAME_STATE.CLOSE) {
                if (this._listener && this._listener.onSocketClose) {
                    this._listener.target = this;
                    this._listener.onSocketClose.call(this._listener);
                }
            }
        }.bind(this), 500);

        if (this._isReconnect) {
            this._reconnectCount++;
            if (this._reconnectCount < 5) {
                setTimeout(function () {
                    cc.log('reconnecting: ...count = ' + this._reconnectCount);
                    this.wsGameState = WEBSOCKET_GAME_STATE.RECONNECTING;
                    this.connectWS(this._wsUrl);
                }.bind(this), 3 * 1000);
            } else {
                this.wsGameState = WEBSOCKET_GAME_STATE.DISCONNECT;
                if (this._listener && this._listener.onSocketDisconnect) {
                    this._listener.target = this;
                    this._listener.onSocketDisconnect.call(this._listener);
                }
            }
        } else {
            this.wsGameState = WEBSOCKET_GAME_STATE.DISCONNECT;
            if (this._listener && this._listener.onSocketDisconnect) {
                this._listener.target = this;
                this._listener.onSocketDisconnect.call(this._listener);
            }
        }
    }

    pingpong() {
        log('@ pingpong');
        if (this.wsGameState == WEBSOCKET_GAME_STATE.DISCONNECT) {
            this._idPingPong = this.ID_PING_PONG;
            clearInterval(this._timer);
            this._countWaitingPong = 0;
            return;
        }

        // log('@ pingpong: this._lastTime = ' + this._lastTime);
        if (this._lastTime > 0) {
            if ((new Date()).getTime() - this._lastTime >= 10 * 1000) {
                // log('@ pingpong: TIME OUT => this.wsGameState = ' + this.wsGameState);
                if (this.wsGameState != WEBSOCKET_GAME_STATE.CONNECTED) {
                    this._lastTime = 0;
                    this.wsGameState = WEBSOCKET_GAME_STATE.DISCONNECT;
                    if (this._listener && this._listener.onSocketDisconnect) {
                        this._listener.target = this;
                        this._listener.onSocketDisconnect.call(this._listener);
                    }
                    return;
                }
            }
        }
        // this._idPingPong++;
        let msg = JSON.stringify({ id: this._idPingPong });
        if (this._isWaitingPong) this._countWaitingPong++;
        if (this._countWaitingPong >= 3) {
            clearInterval(this._timer);
            this._countWaitingPong = 0;
            cc.log("@@@ TIME OUT --- PING PONG!");
            this.onSocketClose();
            return;
        }

        this._isWaitingPong = true;
        cc.log('@ ping: _countWaitingPong = ' + this._countWaitingPong);
        this.send(msg);
    }

    public send(msg: string) {
        if (!this._ws || this.wsGameState != WEBSOCKET_GAME_STATE.CONNECTED) return;

        cc.log('@ [VDWebSocketClient] send msg = ' + msg);
        this._ws.send(msg);
        this._lastTime = (new Date()).getTime();
    }

    public closeSocket() {
        cc.log('@ [VDWebSocketClient] closeSocket ');

        clearInterval(this._timer);
        this._countWaitingPong = 0;

        this._idPingPong = this.ID_PING_PONG;
        this._reconnectCount = 0;
        this._isClosed = true;
        this._isReconnect = false;

        this.wsGameState = WEBSOCKET_GAME_STATE.CLOSE;
        this._ws && this._ws.close();
        this._ws = null;
        this._listener = null;
    }
} 