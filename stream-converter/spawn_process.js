const { spawn } = require('child_process')
const moment = require('moment');
module.exports =  function(command, isDebug, options) {
    return new Promise((resolve, reject) => {
        var isCallBacked = false;
        const ffmpeg = spawn(command, options, {stdio: ['ipc']})

        ffmpeg.on('error', (err) => {
            console.error(moment().format("HH:mm"),'ffmpeg', err)
            if(!isCallBacked)
            reject(err)
        })
        
        ffmpeg.on('close', (code) => {
            console.log(moment().format("HH:mm"),'ffmpeg', 'closed', code)
            if(!isCallBacked)
            reject("closed");
        })

        ffmpeg.stderr.on('data', (data) => {
            let msg = data.toString();
            if(!isCallBacked && msg.indexOf("for writing") > -1){
                isCallBacked = true;
                resolve(ffmpeg) 
            }
            if(isDebug)
                console.log(moment().format("HH:mm"), "ffmpeg", data.toString());
            // resolve(ffmpeg)
        })
        // resolve(ffmpeg)
    })
}