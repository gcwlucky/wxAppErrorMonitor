//wxAppErrorMonitor.js
//Create by gcwlucky,2018.11.03

let appOptions,                  //小程序加载参数
    systemInfo,                  //系统信息
    _config = {                  //上报相关配置
        reqUrl: '',              //必填：上报url
        reportType: '',          //选填：上报方式：sync（同步）/async（异步），默认为sync
        triggerNum: '',          //选填：当reportType=async时有效，表示本地错误日志达到多少条时进行上报，默认为3
        extraData: null,         //选填：额外上报信息，function/object，默认为null
        monitorKey: ''         //选填：String，小程序后台运维中心-监控告警的监控id，默认为''，则不上报
    },
    initSuccess = false          //是否初始化成功

const rKey = '_wxapp_error_monitor_key_';

/**
 * 初始化配置
 * @param config
 */
function init(config) {
    if (!config) {
        console.log("配置必填项不能为空");
        return;
    }
    _config.reqUrl = config.reqUrl || '';
    _config.reportType = config.reportType || 'sync';
    _config.triggerNum = config.triggerNum || 3;
    _config.extraData = config.extraData || null;
    _config.monitorKey = config.monitorKey || '';
    if (!_config.reqUrl) {
        console.log("上报url不能为空");
        return;
    }
    //初始化成功
    initSuccess = true;
}

/**
 * 获取需要上报的data
 */
function _getReportData(msg) {
    return new Promise((resolve, reject) => {
        try {
            let timeStamp = new Date().valueOf(),        //时间戳(ms)
                pages = getCurrentPages(),               //页面栈
                curPage = pages[pages.length - 1],       //当前页面
                path,                                    //当前页面路径
                pageOptions,                             //当前页面参数
                errorMsg,                                //错误内容
                extraData;                               //额外需要上报的内容
            path = curPage.route
            pageOptions = curPage.options
            appOptions = appOptions ? appOptions : getApp().globalData.options
            systemInfo = systemInfo ? systemInfo : wx.getSystemInfoSync()
            errorMsg = msg
            if (typeof _config.extraData === "function") {
                extraData = _config.extraData();
            } else {
                extraData = _config.extraData;
            }
            let reqObj = {
                timeStamp: timeStamp,
                path: path,
                pageOptions: pageOptions,
                appOptions: appOptions,
                systemInfo: systemInfo,
                errorMsg: errorMsg,
                extraData: extraData
            }
            console.info('reqObj:%o', reqObj)
            resolve(reqObj);
        } catch (e) {
            reject(e);
        }
    })
}

function _handleReport(msg) {
    if(_config.monitorKey) {
        wx.reportMonitor(_config.monitorKey, 1)
    }
    if (!initSuccess) {
        console.log('handleReport error: 初始化配置失败')
        return;
    }
    _getReportData(msg).then((data) => {
        let logs = wx.getStorageSync(rKey);
        //防止reportType中途变更导致缓存中的log被丢弃：场景——起初是async，后变成了sync，会导致缓存中的log被清除
        data = logs.concat([data]);
        //同步上报
        if (_config.reportType === 'sync') {
            _request(data)
        } else {
            //异步上报
            if (data.length >= _config.triggerNum) {
                _request(data);
            } else {
                wx.setStorageSync(rKey, data);
            }
        }
    });
}

function _request(data) {
    wx.request({
        url: _config.reqUrl,
        method: "POST",
        data: data,
        success: () => {
            wx.setStorageSync(rKey, []);
        },
        fail: e => {
            console.log("request error:%o", e);
        },
    })
}

(function monitorError() {
    let _error = console.error
    console.error = function () {
        _error.apply(_error, arguments)
        _handleReport(arguments[0])
    }
})()

module.exports = {
    init
};
