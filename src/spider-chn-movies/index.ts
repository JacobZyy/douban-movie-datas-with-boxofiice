import { readFileSync, writeFileSync } from 'node:fs'
import xCrawl from 'x-crawl'
import { Cheerio, load } from 'cheerio'
import type { DataListType } from '../DouListSpider'
import DouListSpider from '../DouListSpider'
import { getRandomHeader } from '../utils'

const cachedDetailList = [
  'https://movie.douban.com/subject/25845392/',
  'https://movie.douban.com/subject/26363254/',
  'https://movie.douban.com/subject/34841067/',
  'https://movie.douban.com/subject/26794435/',
  'https://movie.douban.com/subject/26266893/',
  'https://movie.douban.com/subject/35766491/',
  'https://movie.douban.com/subject/27619748/',
  'https://movie.douban.com/subject/26100958/',
  'https://movie.douban.com/subject/35613853/',
  'https://movie.douban.com/subject/35267208/',
  'https://movie.douban.com/subject/35267224/',
  'https://movie.douban.com/subject/26861685/',
  'https://movie.douban.com/subject/35660795/',
  'https://movie.douban.com/subject/26698897/',
  'https://movie.douban.com/subject/19944106/',
  'https://movie.douban.com/subject/32659890/',
  'https://movie.douban.com/subject/26754233/',
  'https://movie.douban.com/subject/35183042/',
  'https://movie.douban.com/subject/26752088/',
  'https://movie.douban.com/subject/30295905/',
  'https://movie.douban.com/subject/35051512/',
  'https://movie.douban.com/subject/26260853/',
  'https://movie.douban.com/subject/10604086/',
  'https://movie.douban.com/subject/35505100/',
  'https://movie.douban.com/subject/27605698/',
  'https://movie.douban.com/subject/25723907/',
  'https://movie.douban.com/subject/23761370/',
  'https://movie.douban.com/subject/24773958/',
  'https://movie.douban.com/subject/26575103/',
  'https://movie.douban.com/subject/27038183/',
  'https://movie.douban.com/subject/25986662/',
  'https://movie.douban.com/subject/35765480/',
  'https://movie.douban.com/subject/3878007/',
  'https://movie.douban.com/subject/7054604/',
  'https://movie.douban.com/subject/26662193/',
  'https://movie.douban.com/subject/3168101/',
  'https://movie.douban.com/subject/36035676/',
  'https://movie.douban.com/subject/26182910/',
  'https://movie.douban.com/subject/30163509/',
  'https://movie.douban.com/subject/1652587/',
  'https://movie.douban.com/subject/35460157/',
  'https://movie.douban.com/subject/30221757/',
  'https://movie.douban.com/subject/4811774/',
  'https://movie.douban.com/subject/26416062/',
  'https://movie.douban.com/subject/3077412/',
  'https://movie.douban.com/subject/25801066/',
  'https://movie.douban.com/subject/25710912/',
  'https://movie.douban.com/subject/25907124/',
  'https://movie.douban.com/subject/26654184/',
  'https://movie.douban.com/subject/30166972/',
  'https://movie.douban.com/subject/25824686/',
  'https://movie.douban.com/subject/25662329/',
  'https://movie.douban.com/subject/36123159/',
  'https://movie.douban.com/subject/35294995/',
  'https://movie.douban.com/subject/2131940/',
  'https://movie.douban.com/subject/10741834/',
  'https://movie.douban.com/subject/25964071/',
  'https://movie.douban.com/subject/27163278/',
  'https://movie.douban.com/subject/35096844/',
  'https://movie.douban.com/subject/26862829/',
  'https://movie.douban.com/subject/10440138/',
  'https://movie.douban.com/subject/26931786/',
  'https://movie.douban.com/subject/4920389/',
  'https://movie.douban.com/subject/25728006/',
  'https://movie.douban.com/subject/35312437/',
  'https://movie.douban.com/subject/26683723/',
  'https://movie.douban.com/subject/26985127/',
  'https://movie.douban.com/subject/33447633/',
  'https://movie.douban.com/subject/1292722/',
  'https://movie.douban.com/subject/30176393/',
  'https://movie.douban.com/subject/30174085/',
  'https://movie.douban.com/subject/35087699/',
  'https://movie.douban.com/subject/30171424/',
  'https://movie.douban.com/subject/30171425/',
  'https://movie.douban.com/subject/26387939/',
  'https://movie.douban.com/subject/26425063/',
  'https://movie.douban.com/subject/10574622/',
  'https://movie.douban.com/subject/5308265/',
  'https://movie.douban.com/subject/26336252/',
  'https://movie.douban.com/subject/25820460/',
  'https://movie.douban.com/subject/26613692/',
  'https://movie.douban.com/subject/20495023/',
  'https://movie.douban.com/subject/25827963/',
  'https://movie.douban.com/subject/32493124/',
  'https://movie.douban.com/subject/25815034/',
  'https://movie.douban.com/subject/35653205/',
  'https://movie.douban.com/subject/26885074/',
  'https://movie.douban.com/subject/6311303/',
  'https://movie.douban.com/subject/6982558/',
  'https://movie.douban.com/subject/25717233/',
  'https://movie.douban.com/subject/25895276/',
  'https://movie.douban.com/subject/26309788/',
  'https://movie.douban.com/subject/35725869/',
  'https://movie.douban.com/subject/26394152/',
  'https://movie.douban.com/subject/35155748/',
  'https://movie.douban.com/subject/3230115/',
  'https://movie.douban.com/subject/35068653/',
  'https://movie.douban.com/subject/36081094/',
  'https://movie.douban.com/subject/36369452/',
  'https://movie.douban.com/subject/36438166/',
]

class CHNDouListSpider extends DouListSpider {
  constructor(start: number, end: number, code: number) {
    super(start, end, code)
  }

  private async crawlMovieDetail() {
    const dataList = this.getDataList()
    const pageList = dataList.map(({ movieCode }) => {
      return `https://movie.douban.com/subject/${movieCode}/`
    })

    // const subPageList = ['https://movie.douban.com/subject/25845392/']
    return this.crawlHTMLInfos(pageList)
  }

  private getRatingInfos(html: string) {
    const $ = load(html)
    const target = $('#interest_sectl')
    const ratingStepList: string[] = []
    target.find('.ratings-on-weight').children().each((index, element) => {
      const value = $(element).find('.rating_per').text().trim()
      ratingStepList.push(value)
    })

    return ratingStepList
  }

  private getShortCommentCounts(html: string) {
    const $ = load(html)
    const target = $('#comments-section .mod-hd .pl a')
    const targetText = target.text().trim()
    const commentCounts = Number(/\d+/.exec(targetText)?.[0] || '0')
    return commentCounts
  }

  public async analysisMovieDetail(pageList: string[]) {
    const dataList = this.getDataList()
    const htmlList = await this.crawlMovieDetail()
    const detailInfos: Record<number | string, { ratingInfo: string[], commentCounts: number }> = {}
    htmlList.forEach((pageHtml, index) => {
      const url = pageList[index]
      const curMovieCode = Number(/\d+/.exec(url)?.[0])
      if (!Number.isNaN(curMovieCode)) {
        const ratingInfo = this.getRatingInfos(pageHtml)
        const commentCounts = this.getShortCommentCounts(pageHtml)
        detailInfos[curMovieCode] = {
          ratingInfo,
          commentCounts,
        }
      }
    })

    const finalList = dataList.map((item) => {
      const { movieCode } = item
      const detailInfoItem = detailInfos[movieCode]
      if (!detailInfoItem)
        return item

      const { ratingInfo, commentCounts = 0 } = detailInfoItem
      const ratingWeight = ratingInfo.reduce((prev, item, idx) => {
        const target = 5 - idx
        if (target <= 0)
          return prev
        return {
          ...prev,
          [`rating${target}`]: item,
        }
      }, {})
      console.log(ratingInfo, ratingWeight)
      return {
        ...item,
        shortCommentsCount: commentCounts,
        ...ratingWeight,
      }
    })
    this.setDataList(finalList)
  }

  public writeData = (fileName: string = '') => {
    const dataList = this.getDataList()
    // 将数据转换为 CSV 格式的字符串
    const csvData = dataList
      .sort((prev, cur) => prev.orderId - cur.orderId)
      .map((item) => {
        return `${item.orderId},${item.movieCode},${item.movieName},${item.rateValue},${item.ratePersonCount},${item.shortCommentsCount}, ${item.rating5}, ${item.rating4}, ${item.rating3}, ${item.rating2}, ${item.rating1},"${item.description}","${item.boxOffice}"`
      })

    // 将 CSV 数据连接成一个字符串
    const csvString = `orderId,shouldCurId,movieName,rateValue(x/10),评价人数,短评数量,5星占比,4星占比,3星占比,2星占比,1星占比,description,额外信息\n${csvData.join(
      '\n',
    )}`

    // 将 CSV 字符串写入到文件
    writeFileSync(`./data/data-${fileName}-${this.douListCode}.csv`, csvString, 'utf8')
  }
}

async function main() {
  const spider = new CHNDouListSpider(1, 4, 110233943)
  await spider.startCrawlPage()
  await spider.analysisMovieDetail(cachedDetailList)
  spider.writeData('chn-list')
  console.log('finish')
}

export default main
