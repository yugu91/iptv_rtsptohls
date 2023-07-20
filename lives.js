/**
 * Parse china telecom iptv
 * 中国电信直播频道转换
 * 请按自己抓取的列表页面数据进行转换，转换后添加到line里面
 * 不会转换的可以手动修改line对象
 * 例子: line: {
    频道名称1：播放地址,
    频道名称2：播放地址,
    频道名称3：播放地址
   }
**/
const Authentication = {
    line: {},
    CTCSetConfig(_, params){
        var name, url;
        let arv = params.split("\",");
        arv.forEach(c=>{
            let k = c.replace(/\"/g,"").replace("=","||");
            let arr = k.split("||");
            let key = arr[0];
            let val = arr[1];
            if(key == "ChannelName")
                name = val.replace("高清","").replace("超清","").replace("-测试","").replace("测试","");
            else if(key == "ChannelURL")
                url = val
            if(name != null && url != null)
                return;
        });
        this.line[name] = url;
    }
}

//由电信iptv抓取获取例子
//Authentication.CTCSetConfig('Channel','ChannelID="8766",ChannelName="CCTV-1超清",UserChannelID="2511",ChannelURL="rtsp://*********** */.smil?rrsip=&zoneoffset=480&icpid=1111116&accounttype=1&limitflux=-1&limitdur=-1"');

/**
 * 此处需要您自己处理，不需要可删除
 */
const myIptvList = require('./myIptvList');
myIptvList(Authentication);

module.exports = Authentication.line;