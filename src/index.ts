import { Spider } from './spider';

const main = async () => {
  const spider = new Spider(1, 22);
  await spider.startCrawlPage();
  console.log('finish');
};
export default main;
