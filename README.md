

众所周知，B站是个学习网站，每天都有人沉迷在B站中学习，有时候想看看现在看的这个课程/教程还有多久看完，而通过`已看P数/总P数`并不是那么准确，比较p的时长有长又短，最好的方法应该是`已看时长/总时长`，于是就有这个脚本。



## 环境

- NodeJS
- axios
- prompt-sync

## 寻找合适API

- 打开网页版B站的视频页面
- 通过浏览器的抓包工具，从页面加载开始抓取到页面的视频选集出现
- 通过搜索关键字，比如我这里搜索了第1p标题中的`概念`二字，就找到里对应的请求API

![](https://qiniupub.nip.cool/202201110118652.png)



## 接口分析



请求接口

```http
https://api.bilibili.com/x/player/pagelist?bvid=BV19E411D78Q&jsonp=jsonp
```

响应头（response_heads）

```sh
access-control-allow-credentials: true
access-control-allow-headers: Origin,No-Cache,X-Requested-With,If-Modified-Since,Pragma,Last-Modified,Cache-Control,Expires,Content-Type,Access-Control-Allow-Credentials,DNT,X-CustomHeader,Keep-Alive,User-Agent,X-Cache-Webcdn,x-bilibili-key-real-ip,x-backend-bili-real-ip,x-risk-header
access-control-allow-methods: GET,POST,PUT,DELETE
access-control-allow-origin: https://www.bilibili.com #跨域只允许https://www.bilibili.com发来的请求
```

响应体（response_body）

```json
{
    "code": 0,
    "message": "0",
    "ttl": 1,
    "data": [
        {
            "cid": 121579556,
            "page": 1,
            "from": "vupload",
            "part": "1.1.1 概念、组成、功能和分类",
            "duration": 1291,
            "vid": "",
            "weblink": "",
            "dimension": {
                "width": 1366,
                "height": 768,
                "rotate": 0
            }
        },
        {
            "cid": 121581144,
            "page": 2,
            "from": "vupload",
            "part": "1.1.2 标准化工作及相关组织",
            "duration": 481,
            "vid": "",
            "weblink": "",
            "dimension": {
                "width": 1366,
                "height": 768,
                "rotate": 0
            }
        }
    ]
}
```

经过对此接口的简单分析（也就是直接在浏览器打开），发现**无需令牌**即可打开，而请求参数中也只有一个`bvid`参数，而在响应的数据中`data[].duration`属性便是每个选集的时长，通过与页面时长的对比，可以肯定是以秒位单位存储，如`"duration": 1291`对应的就是`21分钟31秒`。



那么接下来的事情就很简单了，只需要**获取接口中的数据**，然后**遍历统计**即可。



## 编码

### 封装`getPageList(bvid)`方法

用于获取分p列表，因为对于方法调用者来讲，它关心的是`我传入一个bvid，你能返回一个对应的分p列表`，它不关系方法内部是通过来实现的。

```javascript
const axios = require('axios').default;

/**
 * 获取分p列表
 * @param bvid
 * @returns {Promise<any>}
 */
const getPageList = async (bvid) => {
    let res = await axios.get(`https://api.bilibili.com/x/player/pagelist?bvid=${bvid}&jsonp=jsonp`);
    return res.data.data;
};
```



### 统计时长

```json
(async () => {
    // bv号（bvid）
    let bvid = "BV19E411D78Q"
    // 已观看的选集
    let watchedPage = 10;

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
```



**至此**就可以在项目目录下使用命令行统计视频时长了：

```bash
PS C:\Users\NipGeihou\WebstormProjects\bilibili-stats> node index # idenx是我文件的名字
视频总时长为：21小时59分钟
已观看时长为：3小时38分钟
观看进度为：13%
```



### 优化：接收用户输入

刚刚的写法，是把bv号和已观看的选集数写死在代码里的，那么每次都要去改代码，这体验并不会，那么可以用一个`prompt-sync`库来接收用户输入的参数，动态的统计不同视频的观看时长情况。

```javascript
// // bv号（bvid）
// let bvid = "BV19E411D78Q"
// // 已观看的选集
// let watchedPage = 10;

let bvid = prompt("请输入BV号：");
let watchedPage = prompt("请输入已观看的选集数：");
```

```bash
PS C:\Users\NipGeihou\WebstormProjects\bilibili-stats> node index
请输入BV号：BV19E411D78Q
请输入已观看的选集数：10
视频总时长为：21小时59分钟
已观看时长为：3小时38分钟
观看进度为：13%
```

