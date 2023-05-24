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
        likingFinished: false,
        // [{name, done, error, steps: [{ kind, name, numPostsLiked, error }]}]
        likeProgress: [],
    },
    onLoad(options) {
        const data = JSON.parse(options.data);
        this.communities = data.communities;
        this.currentCommunity = data.communities.indexOf(data.current);
        this.doLike();
    },
    doLike() {
        const self = this;
        this.setData({
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
                    name: self.communities[i]
                },
                method: "POST",
                onSuccess() {
                    console.log("set current community: " + self.communities[i]);
                    self.currentCommunity = i;
                    onSuccess();
                },
                onFailure
            });
        }

        // like communities[i:]
        function likeCommunity(i, onSuccess) {
            if (i >= self.communities.length) {
                return onSuccess();
            }

            // initialize the state for the community
            const state = {
                name: self.communities[i]
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
})