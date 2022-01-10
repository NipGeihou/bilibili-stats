const axios = require('axios').default;
const prompt = require("prompt-sync")({sigint: true});

/**
 * 获取选集列表
 * @param bvid
 * @returns {Promise<any>}
 */
const getPageList = async (bvid) => {
    let res = await axios.get(`https://api.bilibili.com/x/player/pagelist?bvid=${bvid}&jsonp=jsonp`);
    return res.data.data;
};


/**
 * 入口函数
 */
(async () => {
    // // bv号（bvid）
    // let bvid = "BV19E411D78Q"
    // // 已观看的选集
    // let watchedPage = 19;

    let bvid = prompt("请输入BV号：");
    let watchedPage = prompt("请输入已观看的选集数：");

    // 选集列表
    let pageList = await getPageList(bvid);

    // 初始化总时长、已观看时长
    let totalDuration = 0
    let watchedDuration = 0;

    // 遍历每一个选集
    for (let page of pageList) {
        // 如果选集时已观看的选集范围内的，记录到已观看时长中
        if (page.page <= watchedPage) {
            watchedDuration += page.duration;
        }
        // 统计每一个选集时长
        totalDuration += page.duration;
    }

    // 格式化总时长
    let totalDurationMin = Math.round(totalDuration / 3600);
    let totalDurationSecond = Math.round(totalDuration % 3600 / 60);

    // 格式化已观看时长
    let watchedDurationMin = Math.round(watchedDuration / 3600);
    let watchedDurationSecond = Math.round(watchedDuration % 3600 / 60);

    // 进度率
    let schedulePercent = Math.round(watchedDuration / totalDuration * 100);

    console.log(`视频总时长为：${totalDurationMin}小时${totalDurationSecond}分钟`);
    console.log(`已观看时长为：${watchedDurationMin}小时${watchedDurationSecond}分钟`);
    console.log(`观看进度为：${schedulePercent}%`)
})();
