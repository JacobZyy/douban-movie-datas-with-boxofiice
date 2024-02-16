import DouListSpider from '../DouListSpider'

async function spiderWorldMovieList() {
  const spider = new DouListSpider(1, 22, 1641439)
  await spider.startCrawlPage()
  spider.writeData('world-list')
  console.log('finish')
}
export default spiderWorldMovieList
