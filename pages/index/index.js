// index.js

const util = require("../../utils/util.js")
const app = getApp()

Page({
    data: {
        startingQRLogin: false
    },
    onShow() {
        this.setData({startingQRLogin: false})
    },
    startQRLogin() {
        const page = this;
        page.setData({ startingQRLogin: true })
        wx.showLoading({
            title: '请稍后',
        });
        app.request({
            path: "/startqrlogin",
            method: 'POST',
            onSuccess(res) {
                wx.navigateTo({
                  url: '/pages/scanqrcode/scanqrcode?url=' + encodeURIComponent(res.url),
                })
            },
            onFailure() {
                //util.showErrorDialog('登入失败')
            },
            onComplete() {
                wx.hideLoading();
                page.setData({ startingQRLogin: false });
            },
        })
    },
})