class Client {
    constructor(baseUrl) {
        this._baseUrl = baseUrl
        this._cookie = []
    }

    request({ path, method = "GET", header, success, ...rest }) {
        wx.request({
            url: this._baseUrl + path,
            method: method,
            header: {
                Cookie: this._cookie.join('; '),
                ...(header || {})
            },
            success: (res) => {
                if (res.cookies.length) {
                    this._cookie = res.cookies;
                }
                success?.(res)
            },
            ...rest
        })
    }
}

module.exports = {
    Client
}