// pages/community/community.js
const util = require('../../utils/util.js')
const app = getApp();
const KEY_IGNORED_COMMUNITIES = 'community_ignored';

Page({
    data: {
        gettingCommunities: false,
        // [{name, checked}]
        communities: [],
    },
    current: "",
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
                const ignored = wx.getStorageSync(KEY_IGNORED_COMMUNITIES) || [];
                const communities = getCommunityData(false).concat(getCommunityData(true));
                function getCommunityData(isIgnored) {
                    return res.names.filter(e => ignored.includes(e) === isIgnored).map(e => {
                        return { name: e, value: e, checked: !isIgnored};
                    })
                }
                this.setData({
                    gettingCommunities: false,
                    communities
                });
                this.current = this.data.communities[res.current].name;
                console.log("current community: " + this.current);
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
            current: this.current
        };
        return state;
    },
    onCommunityChanged(event) {
        const changes = util.computeCheckBoxChanges(event.detail.value, 'name', this.data.communities, 'checked');
        for (let {index, checked} of changes) {
            this.data.communities[index].checked = checked;
        }
        const ignored = this.data.communities.filter(e => !e.checked);
        const sorted = this.data.communities.filter(e => e.checked).concat(ignored);
        wx.setStorageSync(KEY_IGNORED_COMMUNITIES, ignored.map(e => e.name));
        this.setData({
            communities: sorted
        });
    }
})