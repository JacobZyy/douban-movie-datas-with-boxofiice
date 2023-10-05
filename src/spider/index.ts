import { load } from 'cheerio';
import { writeFileSync } from 'fs';
import { DataListType } from './type';
import xCrawl from 'x-crawl';
import { getRandomHeader } from './utils';

export class Spider {
  private startPage: number;
  private endPage: number;
  private dataList: DataListType[];
  constructor(startPage?: number, endPage?: number) {
    this.startPage = startPage ?? 1;
    this.endPage = endPage ?? 1;
    this.dataList = [];
  }

  private crawlHTMLInfos = async (pageList: number[]) => {
    try {
      const urlList = pageList.map((item) => {
        const url = `https://www.douban.com/doulist/1641439/?start=${(item - 1) * 25}&sort=seq&playable=0&sub_type=`;
        const headerAgent = getRandomHeader();
        return {
          url,
          header: {
            'User-Agent': headerAgent,
          },
        };
      });

      console.log(urlList);
      const instance = xCrawl({
        mode: 'sync',
        intervalTime: { max: 3000, min: 1000 },
      });

      const resList = await instance.crawlHTML(urlList);
      return resList.map((res, resIdx) => {
        const { data } = res ?? {};
        if (!data) {
          throw new Error('no data');
        }
        const { html: pageHtml } = data;

        console.log('pageId: ', resIdx + pageList[0], 'successed!');
        return pageHtml;
      });
    } catch (error) {
      throw error;
    }
  };

  private operateDescription = (desc: string) => {
    return desc
      .split('\n')
      .map((line) => line.trim())
      .filter((line) => line)
      .join('\n');
  };

  private getRateValue = (rateInfos: string) => {
    const regex = /\((\d+)人评价\)/;
    const match = rateInfos.match(regex) ?? [];
    return Number(match[1] ?? '0');
  };

  private getDatasFromHTML = async (curPageList: number | number[]) => {
    const isMultiPage = Array.isArray(curPageList);
    const pageList = isMultiPage ? curPageList : [curPageList];

    const htmlList: string[] = await this.crawlHTMLInfos(pageList);
    htmlList.forEach((html, pageIdx) => {
      const curPage = pageList[0] + pageIdx;

      const $ = load(html);
      const dataItems = $('.article .doulist-item');

      if (dataItems.length === 0) {
        console.log(`page: ${curPage} get failed`);
      }
      dataItems.each((idx, element) => {
        const orderId = $(element).find('.mod .hd .pos').text().trim();
        const shouldCurId = curPage * 25 + idx + 1;

        const movieSubject = $(element).find('.doulist-subject');

        const movieName = movieSubject.find('.title a').text().trim();
        const ratingSubject = movieSubject.find('.rating');
        const rateValue = ratingSubject.find('.rating_nums').text();

        const ratePersonCount = this.getRateValue(ratingSubject.children().last().text());
        const description = this.operateDescription(movieSubject.find('.abstract').text());
        const boxInfo = $(element).find('.ft .content .comment').text().split('$')[1].replaceAll(',', '');
        const obj: DataListType = {
          orderId: Number(orderId),
          shouldCurId,
          movieName,
          rateValue: Number(rateValue),
          ratePersonCount,
          description,
          boxOffice: Number(boxInfo),
        };
        this.dataList.push(obj);
      });
    });
  };

  private writeData = (dataList: DataListType[]) => {
    // 将数据转换为 CSV 格式的字符串
    const csvData = dataList
      .sort((prev, cur) => prev.orderId - cur.orderId)
      .map((item) => {
        return `${item.orderId},${item.shouldCurId},${item.movieName},${item.rateValue},${item.ratePersonCount},"${item.description}",${item.boxOffice}`;
      });

    // 将 CSV 数据连接成一个字符串
    const csvString = `orderId,shouldCurId,movieName,rateValue(x/10),ratePersonCount(评价人数),description,boxOffice(票房，万美元)\n${csvData.join(
      '\n'
    )}`;

    // 将 CSV 字符串写入到文件
    writeFileSync('data.csv', csvString, 'utf8');
  };

  startCrawlPage = async () => {
    const pageList: number[] = Array.from({ length: this.endPage - this.startPage + 1 }, (_, idx) => idx + this.startPage);

    await this.getDatasFromHTML(pageList);

    this.writeData(this.dataList);
  };
  getList = () => this.dataList;
}
