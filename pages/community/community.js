// pages/community/community.js
const util = require('../../utils/util.js')
const app = getApp();

Page({
    data: {
        gettingCommunities: false,
        // [{name, checked}]
        communities: [],
    },
    currentCommunity: -1,
    onLoad() {
        this.getCommunities();
    },
    getCommunities() {
        this.setData({
            gettingCommunities: true
        });
        app.request({
            path: '/getcommunities',
            onSuccess: (res) => {
                const communities = res.names.map((e, i) => {
                    return {
                        value: i,
                        name: e,
                        checked: true
                    };
                })
                this.setData({
                    gettingCommunities: false,
                    communities
                });
                this.currentCommunity = res.current;
                console.log("current community: " + this.data.communities[this.currentCommunity].name);
            },
        });
    },
    doLike() {
        wx.navigateTo({
          url: '/pages/dolike/dolike?data='+JSON.stringify(this.getSelectionState()),
        })
    },
    getSelectionState() {
        const state = {
            communities: this.data.communities.filter(e => e.checked).map(e => e.name),
        };
        if (this.data.communities[this.currentCommunity].checked) {
            state.current = this.data.communities[this.currentCommunity].name;
        } else {
            state.current = "";
        }
        return state;
    },
    onCommunityChanged(event) {
        const changes = util.computeCheckBoxChanges(event.detail.value, 'name', this.data.communities, 'checked');
        for (let {index, checked} of changes) {
            this.data.communities[index].checked = checked;
        }
    }
})