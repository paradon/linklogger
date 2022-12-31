import express, { Express, Request, Response } from 'express';
import { appendFile } from 'node:fs/promises';

const app: Express = express();
const port = process.env.PORT || 4000;
const file = process.env.INBOXFILE || 'inbox.org';

app.use(express.json());

app.get('/', (req: Request, res: Response) => {
  res.send('Hai');
});

app.post('/api/capture', async (req: Request, res: Response) => {
  await appendFile(
    file,
    `* [[${req.body.url}][${req.body.title}]]\n${req.body.notes}\n`,
  );
  res.json({ status: 'success' });
});

app.listen(port, () => {
  console.log(`[server] Listening on http://localhost:${port}`);
});
