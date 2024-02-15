import { Spider } from './spider'

async function main() {
  const spider = new Spider(1, 22)
  await spider.startCrawlPage()
  console.log('finish')
}
export default main
