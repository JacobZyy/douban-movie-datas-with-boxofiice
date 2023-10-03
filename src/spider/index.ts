import { load } from 'cheerio';
import { get as HttpsGet, RequestOptions } from 'https';
import { writeFileSync } from 'fs';
import { DataListType } from './type';

export class Spider {
  private startPage: number;
  private endPage: number;
  private dataList: DataListType[];
  constructor(startPage?: number, endPage?: number) {
    this.startPage = startPage ?? 0;
    this.endPage = endPage ?? 0;
    this.dataList = [];
  }

  private getHtml = async (configs: URL | RequestOptions | string): Promise<string> => {
    return new Promise((resolve) => {
      let html = '';

      HttpsGet(configs, (res) => {
        res.on('data', (chunk) => {
          html += chunk;
        });
        res.on('error', (err) => {
          // @ts-ignore
          console.log(err, configs.search);
        });
        res.on('end', () => {
          resolve(html);
        });
      });
    });
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

  private getPage = async (curPage: number) => {
    const baseRequestConfig: URL | RequestOptions = {
      host: 'www.douban.com',
      path: '/doulist/1641439/',
      search: `?start=${curPage * 25}&sort=seq&playable=0&sub_type=`,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 ' + '(KHTML, like Gecko) Chrome/87.0.4280.88 Safari/537.36',
      },
    };

    const testUrl = 'https://www.douban.com/doulist/1641439/?start=50&sort=seq&playable=0&sub_type=';

    console.log('requestUrl', `${baseRequestConfig.host}/doulist/1641439/?start=${curPage * 25}&sort=seq&playable=0&sub_type=`);
    const html: string = await this.getHtml(testUrl);
    writeFileSync(`src/htmls/${curPage}.html`, html);
    const $ = load(html);
    const dataItems = $('.article .doulist-item');

    if (dataItems.length === 0) {
      console.log(`page: ${curPage} get failed`);
    }
    dataItems.each((idx, element) => {
      const movieSubject = $(element).find('.doulist-subject');

      const movieName = movieSubject.find('.title a').text().trim();
      const ratingSubject = movieSubject.find('.rating');
      const rateValue = ratingSubject.find('.rating_nums').text();

      const ratePersonCount = this.getRateValue(ratingSubject.children().last().text());
      const description = this.operateDescription(movieSubject.find('.abstract').text());
      const boxInfo = $(element).find('.ft .content .comment').text().split('$')[1].replaceAll(',', '');
      console.log('currentId: ', curPage * 25 + idx + 1);
      const obj: DataListType = {
        orderId: curPage * 25 + idx + 1,
        movieName,
        rateValue: Number(rateValue),
        ratePersonCount,
        description,
        boxOffice: Number(boxInfo),
      };
      this.dataList.push(obj);
    });
  };

  private logInfos = async (curPage: number, promise: Promise<unknown>) => {
    console.log('crwaling page: ', curPage + 1);
    await promise;
    console.log(`page ${curPage + 1} successed! `);
  };

  private crawlAllPages = () => {
    let r: (value: void | PromiseLike<void>) => void;
    const p = new Promise((resolve) => {
      r = resolve;
    });

    for (let curPage = this.startPage; curPage <= this.endPage; ++curPage) {
      const curPromise = this.getPage(curPage);
      this.logInfos(curPage, curPromise);
      if (curPage === this.endPage) {
        curPromise.then(() => {
          r();
        });
      }
    }
    return p;
  };

  private writeData = (dataList: DataListType[]) => {
    // 将数据转换为 CSV 格式的字符串
    const csvData = dataList
      .sort((prev, cur) => prev.orderId - cur.orderId)
      .map((item) => {
        return `${item.orderId},${item.movieName},${item.rateValue},${item.ratePersonCount},"${item.description}",${item.boxOffice}`;
      });

    // 将 CSV 数据连接成一个字符串
    const csvString = `orderId,movieName,rateValue,ratePersonCount,description,boxOffice\n${csvData.join('\n')}`;

    // 将 CSV 字符串写入到文件
    writeFileSync('data.csv', csvString, 'utf8');

    console.log('CSV 文件已导出为 data.csv');
    // const jsonStr = JSON.stringify(dataList);
    // writeFileSync('./data.json', jsonStr);
  };

  startCrawlPage = async () => {
    await this.crawlAllPages();

    this.writeData(this.dataList);
  };
  getList = () => this.dataList;
}
