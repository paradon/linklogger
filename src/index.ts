import express, { Express, Request, Response, NextFunction } from 'express';
import { appendFile } from 'node:fs/promises';

const app: Express = express();
const port = process.env.PORT || 4000;

const argValues = process.argv.slice(2);

if (argValues.length < 1) {
  console.log(
    `Usage: ${process.argv[0]} ${process.argv[1]} inbox=/home/user/inbox.org [ example=/home/user/another.org ...]`,
  );
  process.exit();
}

interface OrgFile {
  name: string;
  path: string;
}

type OrgFileMap = Record<string, OrgFile>;

function parseFileArg(arg: string): OrgFile {
  const idx = arg.indexOf('=');
  if (idx < 0) {
    return <OrgFile>{ name: arg, path: arg };
  }
  const name = arg.slice(0, idx);
  const file = arg.slice(idx + 1);
  if (name.length < 1) {
    return <OrgFile>{ name: file, path: file };
  }
  if (file.length < 1) {
    throw new Error('filename missing');
  }
  return <OrgFile>{ name: name, path: file };
}

const orgFiles: OrgFile[] = argValues.map((x) => parseFileArg(x));
const orgFilesMap: OrgFileMap = orgFiles.reduce(
  (a, x) => ({ ...a, ...(<OrgFileMap>{ [x.name]: x }) }),
  <OrgFileMap>{},
);

function getFileByName(name: string) {
  if (!name) {
    return orgFiles[0];
  }
  const file = orgFilesMap[name];
  if (!file) {
    return orgFiles[0];
  }
  return file;
}

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

app.get('/api/targets', (req: Request, res: Response) => {
  return res.json(orgFiles.map((x) => x.name));
});

app.post(
  '/api/capture',
  async (req: Request, res: Response, next: NextFunction) => {
    if (!(req.body.url || req.body.title)) {
      return next(new Error('Neither title nor url are specified.'));
    }
    await appendFile(
      getFileByName(req.body.target).path,
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
