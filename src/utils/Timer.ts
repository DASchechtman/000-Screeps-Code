import { FileSystem } from "FileSystem/FileSystem"

export class Timer {
    private static all_timers: Timer[] = []

    private timer_id: string
    private path: string[]

    constructor(timer_id: string) {
        this.timer_id = timer_id
        this.path = ['timers', this.timer_id]

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
        try {
            const FILE = FileSystem.GetFileSystem().GetExistingFile(this.path)
            const CUR_TIME = Number(FILE?.ReadFromFile('timer_start'))
            const MAX_TIME = Number(FILE?.ReadFromFile('timer_limit'))
            if (CUR_TIME >= MAX_TIME) {
                
                FileSystem.GetFileSystem().DeleteFile(this.path)
                return
            }
            FILE?.WriteToFile('timer_start', Number(CUR_TIME) + 1)
        }
        catch {
            FileSystem.GetFileSystem().DeleteFile(this.path)
        }
    }

    public StartTimer(tick_time: number) {
        const FILE_SYSTEM = FileSystem.GetFileSystem()
        if (!FILE_SYSTEM.DoesFileExist(this.path)) {
            const FILE = FileSystem.GetFileSystem().GetFile(this.path)
            FILE.WriteToFile('timer_limit', tick_time)
            FILE.WriteToFile('timer_start', 0)
        }
    }

    public IsTimerDone() {
        const FILE = FileSystem.GetFileSystem().GetExistingFile(this.path)

        try {
            const TIME_LIMIT = FILE?.ReadFromFile('timer_limit')
            const CUR_TIME = FILE?.ReadFromFile('timer_start')
            const DONE = Number(CUR_TIME) >= Number(TIME_LIMIT)
            return DONE
        }
        catch {
            FileSystem.GetFileSystem().DeleteFile(this.path)
            return true
        }
    }
}
