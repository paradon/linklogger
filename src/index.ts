import express, { Express, Request, Response, NextFunction } from 'express';
import { appendFile } from 'node:fs/promises';

const app: Express = express();
const port = process.env.PORT || 4000;
const file = process.env.INBOXFILE || 'inbox.org';

app.use(express.json());

app.get('/', (req: Request, res: Response) => {
  res.send('Hai');
});

function headingTemplate({ url, title }: { url?: string; title?: string }) {
  if (!url) {
    return title;
  }
  if (!title) {
    return `[[${url}]] :website:`;
  }
  return `[[${url}][${title}]] :website:`;
}

function bodyTemplate(text?: string) {
  if (!text) return '';
  return `${text}\n`;
}

function nodeTemplate({
  url,
  title,
  notes,
}: {
  url?: string;
  title?: string;
  notes?: string;
}) {
  const heading = headingTemplate({ url, title });
  const body = bodyTemplate(notes);
  return `* ${heading}\n${body}`;
}

app.post(
  '/api/capture',
  async (req: Request, res: Response, next: NextFunction) => {
    if (!(req.body.url || req.body.title)) {
      return next(new Error('Neither title nor url are specified.'));
    }
    await appendFile(
      file,
      nodeTemplate({
        url: req.body.url,
        title: req.body.title,
        notes: req.body.notes,
      }),
    );
    res.json({ status: 'success' });
  },
);


app.listen(port, () => {
  console.log(`[server] Listening on http://localhost:${port}`);
});
