import { main as redBoxOfficeMain } from './src/spider-red-box-office'
import mainCHNList from './src/spider-chn-movies'
import spiderWorldMovieList from './src/spider-world-movies'

async function main() {
  await spiderWorldMovieList()
  // await redBoxOfficeMain()
  // await mainCHNList()
}

main()
