// http://www.boxofficecn.com/the-red-box-office

import { writeFileSync } from 'node:fs'
import { load } from 'cheerio'
import xCrawl from 'x-crawl'
import dayjs from 'dayjs'
import { getRandomHeader } from '../spider/utils'

async function getBoxOfficeData() {
  const instance = xCrawl()
  const [result] = await instance.crawlData<string>({
    targets: [{
      url: 'http://www.boxofficecn.com/the-red-box-office',
      headers: {
        'User-Agent': getRandomHeader(),
      },
    }],
  })

  const { data: resultData } = result
  const { data } = resultData ?? {}
  if (!data)
    throw new Error('no data')

  const outputData = JSON.stringify({
    expireTime: dayjs().add(1, 'day'),
    pageData: data,
  })

  writeFileSync('./src/spider-red-box-office/pageDataInfos.json', outputData, 'utf-8')
  return data
}

function handleBoxOfficeHTMLData(data: string) {
  const $ = load(data)
  const rows = $('.row-hover > tr')
  const movieList: [year: string, name: string, director: string, boxOffice: string][] = []
  rows.each((idx, element) => {
    const item = $(element)

    const movieInfos = [1, 2, 3, 4].map((idx) => {
      return item.find(`.column-${idx}`).text().trim()
    }) as [year: string, name: string, director: string, boxOffice: string]

    movieList.push(movieInfos)
  })
  return movieList
}

export async function main() {
  const data = await getBoxOfficeData()
  const movieList = handleBoxOfficeHTMLData(data)

  const csvData = movieList.map((movieItem, idx) => {
    const [year, name, director, boxOffice] = movieItem
    const boxOfficeData = /\d+/.exec(boxOffice)!

    return `${idx + 1},${year.slice(0, 4)},${name},${director},${boxOfficeData[0]}`
  }).join('\n')

  const csvDataCHN = movieList.map((movieItem, idx) => {
    const [year, name, director, boxOffice] = movieItem
    const boxOfficeData = /\d+/.exec(boxOffice)!
    if (!year.includes('🇨🇳'))
      return ''
    return `${idx + 1},${year},${name},${director},${boxOfficeData[0]}`
  }).filter(item => !!item).join('\n')

  const csvString = `orderId,上映时间,影片名,导演,票房（万元）\n${csvData}\n`
  const csvStringCHN = `orderId,上映时间,影片名,导演,票房（万元）\n${csvDataCHN}\n`
  console.log('finish')
  writeFileSync('red-box-office-data.csv', csvString, 'utf-8')
  writeFileSync('red-box-office-data-china-only.csv', csvStringCHN, 'utf-8')
}
