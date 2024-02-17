import { writeFileSync } from 'node:fs'
import { load } from 'cheerio'
import DouListSpider from '../DouListSpider'

class DouListDetailSpider extends DouListSpider {
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

  private async crawlMovieComments(limit: number = 1) {
    const dataList = this.getDataList()
    const pageList = dataList.map(({ movieCode }) => {
      return `https://movie.douban.com/subject/${movieCode}/comments?limit=${limit}&status=P&sort=new_score`
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

  public async analysisMovieDetail() {
    const dataList = this.getDataList()
    const htmlList = await this.crawlMovieDetail()
    const detailInfos: Record<number | string, { ratingInfo: string[], commentCounts: number }> = {}
    htmlList.forEach((pageHtml, index) => {
      const url = this.urlList[index]
      const curMovieCode = Number(/\d+/.exec(url)?.[0])
      console.log('curMovieCode', curMovieCode)
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

  private getCommentsSupports(html: string) {
    const $ = load(html)
    const target = $('.comment-vote .vote-count').text()
    return Number(/\d+/.exec(target)?.[0] ?? '0')
  }

  public async analysisMovieComments() {
    const dataList = this.getDataList()
    const htmlList = await this.crawlMovieComments()
    const maxCommentInfos: Record<number | string, number> = {}
    htmlList.forEach((pageHtml, index) => {
      const url = this.urlList[index]
      const curMovieCode = Number(/\d+/.exec(url)?.[0])
      if (!Number.isNaN(curMovieCode))
        maxCommentInfos[curMovieCode] = this.getCommentsSupports(pageHtml)
    })

    const finalList = dataList.map((item) => {
      const { movieCode } = item
      const maxCommentSupport = maxCommentInfos[movieCode]
      if (!maxCommentSupport && maxCommentSupport !== 0)
        return item
      return {
        ...item,
        maxCommentSupport,
      }
    })
    this.setDataList(finalList)
  }

  public writeData = (fileName: string = '') => {
    const dataList = this.getDataList()
    // 将数据转换为 CSV 格式的字符串
    const csvData = dataList
      .map((item) => {
        return `${item.orderId},${item.movieCode},${item.movieName},${item.rateValue},${item.ratePersonCount},${item.shortCommentsCount}, ${item.rating5}, ${item.rating4}, ${item.rating3}, ${item.rating2}, ${item.rating1},${item.maxCommentSupport},"${item.description}","${item.boxOffice}"`
      })

    // 将 CSV 数据连接成一个字符串
    const csvString = `orderId,movieCode,movieName,rateValue(x/10),评价人数,短评数量,5星占比,4星占比,3星占比,2星占比,1星占比,最热短评的支持人数,description,额外信息\n${csvData.join(
      '\n',
    )}`

    // 将 CSV 字符串写入到文件
    writeFileSync(`./data/data-${fileName}-${this.douListCode}.csv`, csvString, 'utf8')
  }
}

export default DouListDetailSpider
