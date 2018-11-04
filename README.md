# wxAppErrorMonitor

微信小程序错误日志上报SDK。
自动上报小程序运行错误，只需简单配置参数，即可对线上小程序进行监控，方便定位问题。

## 如何使用

1. 引入wxAppErrorMonitor.js
2. 在app.js中引入：
```
import errorMonitor from "./lib/wxAppErrorMonitor"；
```
3. 在app.js的onLaunch中
```
        //eg:
        errorMonitor.init({
            reqUrl: '',              //必填：上报url
            reportType: '', //选填：上报方式：sync（同步）/async（异步），默认为sync
            triggerNum: 2,          //选填：当reportType=async时有效，表示本地错误日志达到多少条时进行上报，默认为3
            extraData: this.globalData,         //选填：额外上报信息，function/object
            monitorKey: '0'         //选填：String，小程序后台运维中心-监控告警的监控id，默认为''，则不上报
        })
```

## 默认上报参数
- timeStamp：发生错误时间戳（ms）
- path：当前页面路径
- pageOptions：当前页面参数
- appOptions：小程序加载参数
- systemInfo：系统信息
- errorMsg：错误内容
