import DouListDetailSpider from '../DouListDetailSpider'
import DouListSpider from '../DouListSpider'

async function personalMovies() {
  const spider = new DouListDetailSpider(1, 2, 157851186)
  await spider.startCrawlPage()
  await spider.analysisMovieDetail()
  spider.writeData('personal-list')
  console.log('finish')
}

export default personalMovies
