import 'zone.js/node';
import * as express from 'express';
import { join } from 'path';
import { APP_BASE_HREF } from '@angular/common';
import { existsSync } from 'fs';
import { ApplicationRef } from '@angular/core';
import { renderApplication } from '@angular/platform-server';
import bootstrap from './src/main.server';

// The Express app is exported so that it can be used by serverless Functions.
export function app(): express.Express {
  const server = express.default();
  const distFolder = join(process.cwd(), 'dist/real-estate-frontend/browser');
  const indexHtml = existsSync(join(distFolder, 'index.original.html')) ? 'index.original.html' : 'index.html';

  server.set('view engine', 'html');
  server.set('views', distFolder);

  // Serve static files from /browser
  server.get('*.*', express.static(distFolder, {
    maxAge: '1y'
  }));

  // All regular routes use the Universal engine
  server.get('*', (req: express.Request, res: express.Response, next: express.NextFunction) => {
    const { protocol, originalUrl, baseUrl, headers } = req;

    const documentPath = join(distFolder, indexHtml);
    const url = `${protocol}://${headers.host}${originalUrl}`;

    // Add timeout handling
    const timeout = setTimeout(() => {
      console.error('SSR timeout for URL:', url);
      res.status(500).send('Server-side rendering timeout');
    }, 30000); // 30 second timeout

    renderApplication(bootstrap, {
      document: existsSync(documentPath) ? require('fs').readFileSync(documentPath, 'utf-8') : '',
      url: url,
      platformProviders: [
        { provide: APP_BASE_HREF, useValue: baseUrl }
      ]
    })
    .then((html: string) => {
      clearTimeout(timeout);
      if (!html) {
        throw new Error('Empty HTML response from SSR');
      }
      res.send(html);
    })
    .catch((err: any) => {
      clearTimeout(timeout);
      console.error('Error occurred during SSR:', err);
      // Send a more graceful fallback
      res.status(500).send(`
        <html>
          <head>
            <title>Error</title>
          </head>
          <body>
            <h1>Server Error</h1>
            <p>Please try refreshing the page.</p>
          </body>
        </html>
      `);
    });
  });

  return server;
}

function run(): void {
  const port = process.env['PORT'] || 4000;

  // Start up the Node server
  const server = app();
  server.listen(port, () => {
    console.log(`Node Express server listening on http://localhost:${port}`);
  });
}

// Webpack will replace 'require' with '__webpack_require__'
// '__non_webpack_require__' is a proxy to Node 'require'
// The below code is to ensure that the server is run only when not requiring the bundle.
declare const __non_webpack_require__: NodeRequire;
const mainModule = __non_webpack_require__.main;
const moduleFilename = mainModule && mainModule.filename || '';
if (moduleFilename === __filename || moduleFilename.includes('iisnode')) {
  run();
}

export * from './src/main.server'; 