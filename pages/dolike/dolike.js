// pages/dolike/dolike.js
const util = require('../../utils/util.js')
const app = getApp();

const stepNames = {
    notices: '公告',
    moments: '左邻右舍',
    ccpposts: '党建园地',
    proposals: '议事厅项目'
};

Page({
    data: {
        showCommunities: true,
        gettingCommunities: false,
        likingFinished: false,
        // [{name, checked}]
        communities: [],
        // [{name, done, error, steps: [{ kind, name, numPostsLiked, error }]}]
        likeProgress: [],
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
        const self = this;
        this.setData({
            showCommunities: false,
            likeProgress: [],
            likingFinished: false
        });
        likeCommunity(0, () => {
            self.setData({
                likingFinished: true
            });
        });

        function setCurrentCommunity(i, onSuccess, onFailure) {
            app.request({
                path: "/setcurrentcommunity",
                data: {
                    current: i
                },
                method: "POST",
                onSuccess() {
                    console.log("set current community: " + self.data.communities[i].name);
                    self.currentCommunity = i;
                    onSuccess();
                },
                onFailure
            });
        }

        // like communities[i:]
        function likeCommunity(i, onSuccess) {
            if (i >= self.data.communities.length) {
                return onSuccess();
            }

            if (self.data.communities[i].checked) {
                // initialize the state for the community
                const state = {
                    name: self.data.communities[i].name
                };
                const stateIndex = self.data.likeProgress.length;
                self.setData({
                    [`likeProgress[${stateIndex}]`]: state
                });
                if (i !== self.currentCommunity) {
                    setCurrentCommunity(i, likePosts, () => {
                        state.done = true;
                        state.error = true;
                        self.setData({
                            [`likeProgress[${stateIndex}]`]: state
                        });
                        likeCommunity(i + 1, onSuccess);
                    });
                } else {
                    likePosts();
                }

                function likePosts() {
                    // initialize steps
                    state.steps = Object.entries(stepNames).map(([kind, name]) => {
                        return {
                            kind,
                            name,
                            numPostsLiked: -1
                        };
                    });
                    self.setData({
                        [`likeProgress[${stateIndex}]`]: state
                    });
                    doLikeStep(state.steps, stateIndex, 0, () => {
                        self.setData({
                            [`likeProgress[${stateIndex}].done`]: true
                        });
                        likeCommunity(i + 1, onSuccess);
                    });
                }
            } else {
                likeCommunity(i + 1, onSuccess);
            }
        }

        function doLikeStep(steps, ci, si, onComplete) {
            if (si >= steps.length) {
                return onComplete();
            }
            const step = steps[si];
            app.request({
                path: '/like' + step.kind,
                data: {
                    count: 10
                },
                method: 'POST',
                onSuccess(res) {
                    step.numPostsLiked = res.count;
                    updateStep();
                    nextStep(onComplete);
                },
                onFailure() {
                    step.error = true;
                    updateStep();
                    nextStep(onComplete);
                },
            });

            function updateStep() {
                self.setData({
                    [`likeProgress[${ci}].steps[${si}]`]: step
                });
            }

            function nextStep(onComplete) {
                doLikeStep(steps, ci, si + 1, onComplete);
            }
        }
    },
    showCommunities() {
        this.setData({
            showCommunities: true
        })
    },
    onCommunityChanged(event) {
        const changes = util.computeCheckBoxChanges(event.detail.value, 'name', this.data.communities, 'checked');
        for (let {index, checked} of changes) {
            this.data.communities[index].checked = checked;
        }
    }
})