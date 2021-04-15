import fastify from 'fastify';
import fastifyCors from 'fastify-cors';
import path from 'path';
import fs from 'fs';
import { GPKICertInterface } from './interface';

// doing this since there are no typings for it.

// eslint-disable-next-line @typescript-eslint/no-var-requires
const imageToAscii = require('image-to-ascii');

const conversionOptions = {
  colored: false,
  size_options: {
    screen_size: {
      width: 24,
      height: 6,
    },
  },
};

const imageList = fs.readdirSync('image');
console.log(imageList.length, 'images found');

let imageCache: {
  [filename: string]: string;
} = {};

(async () => {
  console.log('BAD APPLE');

  if (!fs.existsSync('preprocess.cache.json')) {
    await (async () => {
      console.log('Starting preprocessing...');

      const conversionBatch = 32;
      for (let batch = 0; batch <= imageList.length / conversionBatch; batch++) {
        const imageBatchList = imageList.slice(
          0 + batch * conversionBatch,
          conversionBatch - 1 + batch * conversionBatch,
        );
        console.log('Conversion Batch ' + batch + '/' + Math.floor(imageList.length / conversionBatch) + ' Start!');

        const promises = [];
        for (const image of imageBatchList) {
          promises.push(
            (async () => {
              const imagePath = path.join('image', image);

              const result = await new Promise<string>((res, rej) => {
                imageToAscii(imagePath, conversionOptions, (err: any, str: string) => {
                  if (err) rej(err);
                  res(str);
                });
              });

              imageCache[image] = result;
            })(),
          );
        }

        await Promise.all(promises);
        console.log('Conversion Batch ' + batch + '/' + Math.floor(imageList.length / conversionBatch) + ' Complete!');
      }

      console.log('Preprocessing Complete.');

      fs.writeFileSync('preprocess.cache.json', JSON.stringify(imageCache));
    })();
  } else {
    console.log('Loaded preprocessed data.');
    imageCache = JSON.parse(fs.readFileSync('preprocess.cache.json', { encoding: 'utf-8' }));
  }

  const app = fastify();
  app.register(fastifyCors);

  app.get('/', (req, rep) => {
    rep.send({
      scarlet: 'fire',
    });
  });

  app.get('/:image', (req, rep) => {
    const image = (req.params as any).image;
    if (imageCache[image] !== undefined) {
      rep.send(imageCache[image]);
    }

    rep.status(404).send();
  });

  app.get('/gpki/:image', (req, rep) => {
    const image = (req.params as any).image;
    if (imageCache[image] !== undefined) {
      const ascii = imageCache[image];
      const result: GPKICertInterface[] = ascii.split('\n').map((n) => {
        return {
          selected: false,
          subject: [
            {
              name: 'cn',
              value: n,
            },
            {
              name: 'ou',
              value: 'Gensokyo PKI',
            },
            {
              name: 'o',
              value: 'Hakurei Foundation Certificate Authority',
            },
            {
              name: 'c',
              value: 'GS',
            },
          ],
          issuer: [
            {
              // It's root cert cause it's GPKI huh. ( :)))))) )
              name: 'cn',
              value: 'Hakurei Foundation Certificate Authority ROOT Certificate',
            },
            {
              name: 'ou',
              value: 'Gensokyo PKI',
            },
            {
              name: 'o',
              value: 'Hakurei Foundation Certificate Authority',
            },
            {
              name: 'c',
              value: 'GS',
            },
          ],
          expiresAt: '9999-12-31',
          serial: 'ffffffff',
          issuedBy: '금융결제원',
          status: '정상',
        } as GPKICertInterface;
      });

      console.log('Got Request for ' + image);
      rep.send(result);
    }

    rep.status(404).send();
  });

  await app.listen(8080);
  console.log('Server is listening on :8080');
})();
