import { FileSystem } from "FileSystem/FileSystem"
import { SafeReadFromFile } from "./UtilFuncs"

export class Timer {
    private static all_timers: Timer[] = []

    private timer_id: string
    private path: string[]
    private timer_end_key: string
    private timer_current_key: string

    constructor(timer_id: string) {
        this.timer_id = timer_id
        this.path = ['timers', this.timer_id]
        this.timer_end_key = "timer_limit"
        this.timer_current_key = "timer_start"

        if (!Timer.all_timers.includes(this)) {
            Timer.all_timers.push(this)
        }
    }

    public static AdvanceAllTimers() {
        for (let timer of this.all_timers) {
            timer.TickTimer()
        }
        this.all_timers = []
    }

    private TickTimer() {
        const FILE = FileSystem.GetFileSystem().GetExistingFile(this.path)
        if (FILE == null) { return }

        const CUR_TIME = Number(SafeReadFromFile(FILE, this.timer_current_key))
        const MAX_TIME = Number(SafeReadFromFile(FILE, this.timer_end_key))

        if (CUR_TIME >= MAX_TIME) {
            FileSystem.GetFileSystem().DeleteFile(this.path)
            return
        }

        FILE.WriteToFile(this.timer_current_key, CUR_TIME + 1)
    }

    public StartTimer(tick_time: number) {
        const FILE_SYSTEM = FileSystem.GetFileSystem()
        if (!FILE_SYSTEM.DoesFileExist(this.path)) {
            const FILE = FileSystem.GetFileSystem().GetFile(this.path)
            FILE.WriteToFile(this.timer_end_key, tick_time)
            FILE.WriteToFile(this.timer_current_key, 0)
        }
        else {
            const FILE = FileSystem.GetFileSystem().GetFile(this.path)
            FILE.WriteToFile(this.timer_end_key, tick_time)
        }
    }

    public IsTimerDone() {
        const FILE = FileSystem.GetFileSystem().GetExistingFile(this.path)
        if (FILE == null) { return false }

        const TIME_LIMIT = Number(SafeReadFromFile(FILE, this.timer_end_key))
        const CUR_TIME = Number(SafeReadFromFile(FILE, this.timer_current_key))

        return CUR_TIME >= TIME_LIMIT
    }
}
