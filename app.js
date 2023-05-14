// app.js
const request = require("./utils/request.js")
const util = require("./utils/util.js")

App({
    onLaunch() {
        this.client = new request.Client(this.config.server);
    },
    config: {
      //server: "http://localhost:8080",
      server: "http://52.194.255.26:8080",
    },
    request({ path, method = "GET", data, onSuccess, onFailure, onComplete, showErrorTip=true }) {
        this.client.request({
            path: path,
            method: method,
            data: data,
            success: (res) => {
                if (res.statusCode >= 300) {
                    util.showErrorDialog({
                        content: '请重新登入',
                        complete() {
                            if (getCurrentPages().length > 0) {
                                wx.navigateBack(getCurrentPages().length - 1)
                            }
                        }
                    });
                } else if (res.statusCode === 200) {
                    if (res.data.success) {
                        onSuccess?.(res.data.data);
                    } else {
                        if (showErrorTip) {
                            this.showErrorTip(res.data.err);
                        }
                        onFailure?.(res.data.err);
                    }
                } else {
                    console.log(res);
                }
            },
            fail: (res) => {
                console.error(res);
                if (showErrorTip) {
                    this.showErrorTip(res.errMsg);
                }
                onFailure?.(res.errMsg);
            },
            complete: onComplete,
        })
    },
    showErrorTip(msg) {
        const pages = getCurrentPages();
        const errortip = pages[pages.length - 1].selectComponent("#errortip");
        if (errortip) {
            const toppage = pages[pages.length - 1];
            toppage.data._showErrorTip = true;
            toppage.data._errorTipMsg = msg;
            toppage.setData(toppage.data);
        }
    }
})
