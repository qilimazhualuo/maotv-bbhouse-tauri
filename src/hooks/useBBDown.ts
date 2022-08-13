import {Command, open} from "@tauri-apps/api/shell"
import {message} from "@tauri-apps/api/dialog"

const BBDOWN_MAPS = {
    info: {
        command: ["-info"],
        desc: "info",
    },
    download: {
        command: ["--encoding-priority", "hevc,avc,av1", "--dfn-priority", "8K 超高清, 杜比视界, HDR 真彩, 4K 超清", "--use-aria2c"],
        desc: "download",
    },
}

const useBBDown = async (command: string[], runPath?: string, done?: () => void) => {
    // onProgress(1, `ffmpeg params：${command.join(" ")}`)
    console.log(command.join(" "))

    // const bbdown = Command.sidecar("BBDown", command)
    // const bbdown = new Command("bb", ["/c", "bbdown", ...command])
    // { "name": "BBDown", "args": true, "sidecar": true}, // 侧载二进制文件测试配置
    const bbdown = new Command("bb", command, {cwd: runPath})

    // 注册shell子进程关闭事件
    bbdown.on("close", async ({code}) => {
        if (code) {
            await message("运行失败, BBDown进程已关闭")
        } else {
            console.log("done")
            done?.()
        }
    })

    // 注册shell子进程异常事件
    bbdown.on("error", async (error) => {
        // await message("异常")
        console.error(`sys error: "${error}"`)
    })

    // 标准输出监听
    bbdown.stdout.on("data", (line) => console.log(`command stdout: "${line}"`))
    // 标准错误输出监听
    bbdown.stderr.on("data", (line) => {
        console.log(`command stderr: "${line}"`)
    })

    // 执行
    const child = await bbdown.execute()
    console.log("bbdown子对象", child)
}


export const useCMDBBDownDL = async (aid: string, runPath: string, done?: () => void) => {
    await useBBDown([...BBDOWN_MAPS.download.command, `av${aid}`], runPath, done)
}

export const useCMDBBDownInfo = async (aid: string) => {
    await useBBDown([...BBDOWN_MAPS.info.command, `av${aid}`])
}