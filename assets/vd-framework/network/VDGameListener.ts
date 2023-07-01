export interface VDGameListener {
    onSocketOpen();

    onSocketReconnect();

    onSocketMessage(cmd: number, data: string);

    onSocketError();

    onSocketClose();

    onSocketDisconnect();
}

