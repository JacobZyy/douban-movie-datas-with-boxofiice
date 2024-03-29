# 豆瓣List数据爬虫（以国内外电影票房榜单为主）

## 背景

女朋友是学统计的。毕业课题是这个方面的内容，查看了一下github上相关的爬虫项目，要么就是只带评分影评的，要么就是带了评分票房但是项目老到python3.6的。再加上本人python学艺不精，所以选择用ts+node重写一遍

## 相关库的选择：

1. x-crawl: https://github.com/coder-hxl/x-crawl.git 用于获取豆瓣对应的页面的html
2. cheerio：用于解析html，获取对应的数据
3. 数据来源：
   1. **世界电影榜单:** https://www.douban.com/doulist/1641439
   2. **国内电影榜单:** https://www.douban.com/doulist/110233943
   3. **redBoxOffice票房数据榜单:** http://www.boxofficecn.com/the-red-box-office

## 使用方式

### 安装依赖

```sh
npm install
```

### 运行

```sh
npm run dev
```

## 一些问题

1. Q: 为什么使用x-crawl

   A: 为了躲开豆瓣的反爬403，且x-crawl支持多页面请求、随机设备指纹等功能，相对于直接用https而言可以避免重复造轮子

2. Q: 为什么使用ts+eslint

   A: 个人习惯，eslint的配置使用的是antfu大佬的配置库，和我自身的习惯也比较相符合。且x-crawl有完善的ts类型提示，用起来比较爽

3. Q: 为什么不直接使用bun运行typescrit，而是选了了tsnode

   A: 似乎是因为bun并没有完全适配node相关库。我在使用bun进行html爬取的时候，得到的html是一个乱码的文件。查询相关文档发现bun未适配node下br加密相关的内容，而豆瓣的页面加密方式选择的恰是br加密。个人猜测是这个原因，未深究。

4. Q: 为什么要用oop来实现

   A: x-crawl是以oop来实现的。写这个东西的时候想着让他更具普遍适用性一点，比如创建spider实例的时候传入目标的html，以及相关的search参数来实现爬虫配置，所以采用了oop。后续维护的话可能会往这个方向考虑。

5. 已知问题：

   目前使用x-crawl加上随机UserAgent已经可以初步绕过豆瓣的403反爬了，但是在代码里没有加上错误重试、信息log以及403相关的处理。如果遇到输出数据为空等情况，可以打印拿到的html看看是不是返回403页面了。

## 更新日志

### 2024-2-15
1. 更新red-box-office上的中国电影票房数据
2. 修复eslint故障

### 2024-2-16
1. 抽离公共豆瓣List爬虫方案，支持传入doubanList编号，爬取list内对应内容
2. 增加spiderCHNMovies方法，用于爬取中国电影榜单
3. CHNMovie方法中，继承原spider方法，增加电影详情页面评分占比、短评数量功能
   1. 二开可基于此思路对短评内容(comments)、影评内容进行爬取(review)
4. 更新douList票房数据获取方案，使其适用范围更广

### 2024-2-17
1. 更新爬取comment功能， 获取comment热门短评中第一条评论的支持人数
