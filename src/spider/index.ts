import { load } from 'cheerio';
import { get as HttpsGet } from 'https';
import { writeFileSync } from 'fs';
import { DataListType } from './type';

const getUrl = (page?: number) => {
  const curPage = page ?? 0;
  const startIdx = curPage * 25;
  // return `https://www.douban.com/doulist/1641439/?start=${startIdx}&sort=seq&playable=0&sub_type=`;
  return 'https://movie.douban.com/top250';
};

const getHtml = async (url: string): Promise<string> => {
  return new Promise((resolve) => {
    let html = '';
    HttpsGet(
      {
        host: 'www.douban.com',
        path: '/doulist/1641439/',
        search: '?start=0',
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 ' + '(KHTML, like Gecko) Chrome/87.0.4280.88 Safari/537.36',
        },
      },
      (res) => {
        res.on('data', (chunk) => {
          html += chunk;
        });
        res.on('end', () => {
          resolve(html);
        });
      }
    );
  });
};

const operateDescription = (desc: string) => {
  return desc
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => line)
    .join('\n');
};

const getRateValue = (rateInfos: string) => {
  const regex = /\((\d+)人评价\)/;
  const match = rateInfos.match(regex) ?? [];
  return Number(match[1] ?? '0');
};

export const getPage = async () => {
  const baseUrl = '';
  const curUrl = getUrl();
  const html: string = await getHtml(curUrl);

  const $ = load(html);
  const dataItems = $('.article .doulist-item');

  const dataList: DataListType[] = [];

  dataItems.each((idx, element) => {
    const movieSubject = $(element).find('.doulist-subject');

    const movieName = movieSubject.find('.title a').text().trim();
    const ratingSubject = movieSubject.find('.rating');
    const rateValue = ratingSubject.find('.rating_nums').text();

    const ratePersonCount = getRateValue(ratingSubject.children().last().text());
    const description = operateDescription(movieSubject.find('.abstract').text());
    const boxInfo = $(element).find('.ft .content .comment').text().split('$')[1].replaceAll(',', '');
    const obj: DataListType = {
      movieName,
      rateValue: Number(rateValue),
      ratePersonCount,
      description,
      boxOffice: Number(boxInfo),
    };
    dataList.push(obj);
  });
  // writeFileSync('./src/spider/test.html', html);
  console.log(dataList);
};
