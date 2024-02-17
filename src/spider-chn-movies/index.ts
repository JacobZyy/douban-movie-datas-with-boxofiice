import DouListDetailSpider from '../DouListDetailSpider'

async function main() {
  const spider = new DouListDetailSpider(1, 4, 110233943)
  await spider.startCrawlPage()
  await spider.analysisMovieDetail()
  await spider.analysisMovieComments()
  spider.writeData('chn-list')
  console.log('finish')
}

export default main
