import { writeFileSync } from 'node:fs'
import xCrawl from 'x-crawl'
import type { Cheerio } from 'cheerio'
import { load } from 'cheerio'
import { getRandomHeader } from '../utils'

export interface DataListType {
  orderId: number
  movieCode: number
  movieName: string
  rateValue: number
  ratePersonCount: number
  description: string
  boxOffice: number | string
  rating5?: number
  rating4?: number
  rating3?: number
  rating2?: number
  rating1?: number
  shortCommentsCount?: number
}

class DouListSpider {
  private startPage: number
  private endPage: number
  private dataList: DataListType[]
  protected douListCode: number
  protected urlList: string[]
  constructor(startPage: number, endPage: number, douListCode: number) {
    this.startPage = startPage
    this.endPage = endPage
    this.dataList = []
    this.douListCode = douListCode
    this.urlList = []
  }

  public getDataList() {
    return this.dataList
  }

  public setDataList(dataList: DataListType[]) {
    this.dataList = dataList
  }

  protected async crawlHTMLInfos(pageList: string[]) {
    const urlList = pageList.map((url) => {
      const headerAgent = getRandomHeader()
      return {
        url,
        header: {
          'User-Agent': headerAgent,
        },
      }
    })
    const instance = xCrawl({
      mode: 'sync',
      intervalTime: { max: 3000, min: 1000 },
    })
    const resList = await instance.crawlHTML(urlList)
    return resList.map((res) => {
      const { data } = res ?? {}
      if (!data)
        throw new Error('no data')
      const { html: pageHtml } = data
      return pageHtml
    })
  }

  private operateDescription = (desc: string) => {
    return desc
      .split('\n')
      .map(line => line.trim())
      .filter(line => line)
      .join('\n')
  }

  private getRateValue = (element: Cheerio<any>) => {
    const rateValue = element.find('.rating').find('.rating_nums').text()
    return Number(rateValue)
  }

  private getRatePersonCount = (element: Cheerio<any>) => {
    const rateInfos = element.find('.rating').children().last().text()
    const regex = /\((\d+)人评价\)/
    const match = rateInfos.match(regex) ?? []
    return Number(match[1] ?? '0')
  }

  private getExtraFooterInfo = (element: Cheerio<any>) => {
    const extraInfo = element.find('.ft .content .comment').text()
    const boxInfo = /[\d{.|,}]+/.exec(extraInfo)?.[0] ?? '0'
    return boxInfo.split(',').join('')
  }

  private getMovieNames = (element: Cheerio<any>) => {
    const target = element.find('.title a')
    const { href = '' } = target.attr() ?? {}
    if (href)
      this.urlList.push(href)
    const movieCode = Number(/\d+/.exec(href)?.[0] || '0')
    return {
      movieName: target.text().trim(),
      movieCode,
    }
  }

  private getDatasFromHTML = async (curPageInfo: number | number[]) => {
    const currentPageList = (Array.isArray(curPageInfo) ? curPageInfo : [curPageInfo])
    const pageList = currentPageList.map((text) => {
      return `https://www.douban.com/doulist/${this.douListCode}/?start=${(text - 1) * 25}&sort=seq&playable=0&sub_type=`
    })

    const htmlList: string[] = await this.crawlHTMLInfos(pageList)
    htmlList.forEach((html, pageIdx) => {
      const curPage = pageList[0] + pageIdx

      const $ = load(html)
      const dataItems = $('.article .doulist-item')

      if (dataItems.length === 0)
        console.log(`page: ${curPage} get failed`)

      dataItems.each((idx, element) => {
        const orderId = $(element).find('.mod .hd .pos').text().trim() ?? idx + 1
        const movieSubject = $(element).find('.doulist-subject')

        const { movieCode, movieName } = this.getMovieNames(movieSubject)
        const rateValue = this.getRateValue(movieSubject)
        const ratePersonCount = this.getRatePersonCount(movieSubject)
        const description = this.operateDescription(movieSubject.find('.abstract').text())
        const boxOffice = this.getExtraFooterInfo($(element))

        const obj: DataListType = {
          orderId: Number(orderId),
          movieCode,
          movieName,
          rateValue: Number(rateValue),
          ratePersonCount,
          description,
          boxOffice,
        }
        this.dataList.push(obj)
      })
    })
  }

  public writeData = (fileName: string = '') => {
    // 将数据转换为 CSV 格式的字符串
    const csvData = this.dataList.map(item => `${item.orderId},${item.movieCode},${item.movieName},${item.rateValue},${item.ratePersonCount},"${item.description}",${item.boxOffice}`)

    // 将 CSV 数据连接成一个字符串
    const csvString = `orderId,shouldCurId,movieName,rateValue(x/10),ratePersonCount(评价人数),description,boxOffice(票房，万美元)\n${csvData.join(
      '\n',
    )}`

    // 将 CSV 字符串写入到文件
    writeFileSync(`./data/data-${fileName}-${this.douListCode}.csv`, csvString, 'utf8')
  }

  startCrawlPage = async () => {
    const pageList: number[] = Array.from({ length: this.endPage - this.startPage + 1 }, (_, idx) => idx + this.startPage)

    return this.getDatasFromHTML(pageList)
  }
}
export default DouListSpider
