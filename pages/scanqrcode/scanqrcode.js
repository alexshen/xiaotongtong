// pages/scanqrcode/scanqrcode.js

const util = require('../../utils/util.js')
const app = getApp();

Page({
    data: {
        loading: true,
        url: ""
    },
    onLoad(options) {
        this.data.url = decodeURIComponent(options.url);
        this.setData(this.data);
    },
    onQRCodeLoaded() {
        this.data.loading = false;
        this.setData(this.data);
        const timerId = this.timerId = setInterval(() => {
            console.log("checking login state");
            app.request({
                path: "/isloggedin",
                onSuccess(res) {
                    if (res.loggedin) {
                        wx.redirectTo({
                            url: '/pages/dolike/dolike',
                        })
                        clearInterval(timerId);
                    }
                },
                onFailure(err) {
                    util.showErrorDialog(err);
                    clearInterval(timerId);
                }
            })
        }, 1000);
    },
    onUnload() {
        if (this.timerId) {
            clearInterval(this.timerId);
        }
    }
})