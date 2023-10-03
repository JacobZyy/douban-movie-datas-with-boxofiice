import { Spider } from './spider';

const main = async () => {
  const spider = new Spider();
  await spider.startCrawlPage();
  console.log('finish');
};
export default main;
