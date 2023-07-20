**鸣谢(Thanks a lot) dofafis**
rtsp-to-hls-stream(dofafis): https://github.com/dofafis/rtsp-to-hls-stream

**使用方法**
  1. 修改lives.js加入您相应的频道, 如果您抓取的是用Authentication.CTCSetConfig调用，可以直接复制到代码上，其他的可以自行修改，或者手动将频道加入到Authentication.list
  2. 修改lives.js，myIptvList 引用不懂的可以删除，这个是本人的频道信息，不往github更新
  3. 安装依赖 ```npm install```
  4. 启动 ```node start```
