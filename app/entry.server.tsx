import type { AppLoadContext, EntryContext } from '@remix-run/node';
import { RemixServer } from '@remix-run/react';
import { isbot } from 'isbot';
import { renderToPipeableStream } from 'react-dom/server';
import { renderHeadToString } from 'remix-island';
import { Head } from './root';
import { themeStore } from '~/lib/stores/theme';
import { PassThrough } from 'node:stream';

const ABORT_DELAY = 5_000;

export default async function handleRequest(
  request: Request,
  responseStatusCode: number,
  responseHeaders: Headers,
  remixContext: EntryContext,
  _loadContext: AppLoadContext,
) {
  const prohibitOutOfOrderStreaming = isbot(request.headers.get('user-agent') || '');

  return new Promise((resolve, reject) => {
    let shellRendered = false;

    const { pipe, abort } = renderToPipeableStream(
      <RemixServer context={remixContext} url={request.url} abortDelay={ABORT_DELAY} />,
      {
        onShellReady() {
          if (prohibitOutOfOrderStreaming) {
            return;
          }

          shellRendered = true;

          const head = renderHeadToString({ request, remixContext, Head });
          const body = new PassThrough();

          // Write the opening HTML with head
          body.write(
            `<!DOCTYPE html><html lang="en" data-theme="${themeStore.value}"><head>${head}</head><body><div id="root" class="w-full h-full">`,
          );

          pipe(body);

          const stream = new ReadableStream({
            start(controller) {
              // Write opening HTML
              body.on('data', (chunk) => {
                controller.enqueue(typeof chunk === 'string' ? new TextEncoder().encode(chunk) : new Uint8Array(chunk));
              });
              body.on('end', () => {
                controller.enqueue(new TextEncoder().encode('</div></body></html>'));
                controller.close();
              });
              body.on('error', (err) => {
                controller.error(err);
              });
            },
          });

          responseHeaders.set('Content-Type', 'text/html');
          responseHeaders.set('Cross-Origin-Embedder-Policy', 'require-corp');
          responseHeaders.set('Cross-Origin-Opener-Policy', 'same-origin');

          resolve(
            new Response(stream, {
              headers: responseHeaders,
              status: responseStatusCode,
            }),
          );
        },
        onAllReady() {
          if (!prohibitOutOfOrderStreaming) {
            return;
          }

          shellRendered = true;

          const head = renderHeadToString({ request, remixContext, Head });
          const body = new PassThrough();

          body.write(
            `<!DOCTYPE html><html lang="en" data-theme="${themeStore.value}"><head>${head}</head><body><div id="root" class="w-full h-full">`,
          );

          pipe(body);

          const stream = new ReadableStream({
            start(controller) {
              body.on('data', (chunk) => {
                controller.enqueue(typeof chunk === 'string' ? new TextEncoder().encode(chunk) : new Uint8Array(chunk));
              });
              body.on('end', () => {
                controller.enqueue(new TextEncoder().encode('</div></body></html>'));
                controller.close();
              });
              body.on('error', (err) => {
                controller.error(err);
              });
            },
          });

          responseHeaders.set('Content-Type', 'text/html');
          responseHeaders.set('Cross-Origin-Embedder-Policy', 'require-corp');
          responseHeaders.set('Cross-Origin-Opener-Policy', 'same-origin');

          resolve(
            new Response(stream, {
              headers: responseHeaders,
              status: responseStatusCode,
            }),
          );
        },
        onShellError(error: unknown) {
          reject(error);
        },
        onError(error: unknown) {
          responseStatusCode = 500;

          if (shellRendered) {
            console.error(error);
          }
        },
      },
    );

    setTimeout(abort, ABORT_DELAY);
  });
}
