const formatTime = date => {
  const year = date.getFullYear()
  const month = date.getMonth() + 1
  const day = date.getDate()
  const hour = date.getHours()
  const minute = date.getMinutes()
  const second = date.getSeconds()

  return `${[year, month, day].map(formatNumber).join('/')} ${[hour, minute, second].map(formatNumber).join(':')}`
}

const formatNumber = n => {
  n = n.toString()
  return n[1] ? n : `0${n}`
}


function showOkDialog({ title, content, showCancel=false, complete}) {
    wx.showModal({
      title: title,
      content: content,
      showCancel: showCancel,
      complete,
    })
}

function showErrorDialog({ content, complete }) {
    showOkDialog({
        title: "错误",
        content,
        complete
    })
}

function computeCheckBoxChanges(checkValues, key, checkBoxItems, checkedKey) {
    const changes = [];
    for (let i = 0; i < checkBoxItems.length; ++i) {
        const isChecked = checkValues.some(e => e === checkBoxItems[i][key]);
        if (isChecked !== checkBoxItems[i][checkedKey]) {
            changes.push({ index: i, checked: isChecked });
        }
    }
    return changes;
}

module.exports = {
    formatTime,
    showOkDialog,
    showErrorDialog,
    computeCheckBoxChanges,
}
