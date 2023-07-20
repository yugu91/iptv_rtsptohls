const router = require('express').Router()
const spaw_process = require('./spawn_process')
const fs = require('fs')
const moment = require('moment');
const pathcli = require("path");
const glob = require('glob')
const lives = require("../lives")
// Recording process list
var process = {};
// How many ts file are in M3U8 play list
const tsNum = 10;
// How many longer on each ts file
const tsTime = 5;
// RTSP's type, HTTP/UDP/TCP
const RTSPType = "tcp"
const isDebug = false;
/**
 * Parse the IPTV lives list to M3U8 play list
 * @param {String} host host name
 * @returns 
 */
function getTVB(host){
    var num = 0;
    str = "#EXTM3U\n";
    for(a in lives){
        num += 1;
        str += "#EXTINF:-" + num + "," + a + "\n";
        str += `http://${host}:8085/streams/create?name=${encodeURIComponent(a)}\n`;
    }
    return str;
}

/**
 * Get the IPTV M3U8 play list
 */
router.get("/m3u8", (req, res)=>{
    res.send(getTVB(req.hostname));
})

/**
 * Create Process for the channel and get to Play
 */
router.get("/create", async (req, res) => {
    let processName = req.query.name;
    let rtspUrl = lives[processName];
    if(rtspUrl == null){
        res.json({error: "No channel: " + processName})
        return;
    }
    let path = `${__dirname}/../streams/${processName}.m3u8`;
    if(process[processName] != null){
        process[processName].updateTime = moment().valueOf();
        res.sendFile(pathcli.resolve(process[processName].path));
        return;
    }
    try {
        console.log("Process call begin:", processName);
        ffmpeg = await spaw_process('ffmpeg', isDebug, [
            '-rtsp_transport', RTSPType,
            // '-thread_queue_size', '32768',
            // '-n',
            // '-t', '18000',
            '-i', rtspUrl,
            // '-crf', '24',
            '-preset', 'superfast',
            '-f', 'hls',
            '-hls_time', tsTime.toString(),
            '-vcodec', 'copy',
            '-acodec', 'copy',
            // '-r', '15',
            '-hls_list_size', tsNum.toString(),
            '-hls_flags', 'split_by_time',
            '-hls_allow_cache', '1',
            // '-sc_threshold', '0',
            '-hls_init_time', '1',
            // '-b:v', '500k',
            // '-c:a', 'copy',
            // '-c:v', 'libx264',
            // '-start_number', '0',
            '-y', pathcli.resolve(path),
        ]);       
        console.log("Porcess class end:",processName) 
    } catch (error) {
        console.error(error);
        res.json({error: error});
        return;
    }

    setTimeout(() => {
        process[processName] = {
            path, ffmpeg, updateTime: moment().valueOf() + 1000,
        }
        res.sendFile(pathcli.resolve(process[processName].path));
    }, 1000);
})

setInterval(() => {
    let keys = Object.keys(process);
    keys.forEach((key)=>{
        let value = process[key];
        // Process is going to be kill if update time out of 20s
        if(moment().valueOf() - value.updateTime > 1000 * 20 * 1){
            console.log(`Process ${key} must to be kill`);
            value.ffmpeg.kill('SIGINT')
            const path = process[key].path;
            delete process[key];
            setTimeout(() => {
                glob(path.replace(".m3u8", "*"), (err, files)=> {
                    if(err === null){
                        for (let file of files) {
                            fs.unlink(file, (err)=>{
                                if(err != null)
                                    console.error(err);
                            })
                        }
                    }else
                        console.error(err);
                })
            }, 1000);
        }
    });

    glob(`${__dirname}/../streams/*.ts`, (err, files) => {
        if(err != null){
            console.error("ts file list error", err)
            return;
        }
        for (let file of files) {
            let stat = fs.statSync(file);
            // TS file is going to be kill if create time out of 55s
            if(moment().valueOf() - moment(stat.ctime).valueOf() > 1000 * (tsTime * (tsNum + 1))){
                fs.unlink(file, (err)=>{})
            }
        }
    })
},1000 * 10);


module.exports = router;