// pages/scanqrcode/scanqrcode.js

const util = require('../../utils/util.js')
const app = getApp();

Page({
    data: {
        loading: true,
        url: ""
    },
    onLoad(options) {
        this.setData({
            url: decodeURIComponent(options.url)
        });
    },
    onQRCodeLoaded() {
        this.setData({
            loading: false
        });
        let isChecking;
        const timerId = this.timerId = setInterval(checkLoggedIn, 1000);

        function checkLoggedIn() {
            if (isChecking) {
                return;
            }
            isChecking = true;
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
                },
                onComplete() {
                    isChecking = false;
                }
            });
        }
    },
    onUnload() {
        if (this.timerId) {
            clearInterval(this.timerId);
        }
    }
})