import VDBaseTask from "./VDBaseTask";

export default class VDTaskContainer {
    public _delay: number = 0;
    public _key: string = "";
    public _listTask: any[] = [];
    public completedTask: number = 0;

    isDone(): boolean {
        return this._listTask.length == 0;
    }

    pushTask(task: VDBaseTask) {
        if (task) {
            this._listTask.push(task);
        }
    }

    update(dt: number) {
        // override me
    }

    cleanUp() {
        for (var i = 0; i < this._listTask.length; ++i) {
            this._listTask[i].cleanUp();
        }
        this._listTask.splice(0, this._listTask.length);
    }

    setKey(key: string) {
        this._key = key;
    }

    getKey(): string {
        return this._key;
    }

}
