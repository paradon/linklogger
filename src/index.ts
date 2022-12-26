import express, { Express, Request, Response } from 'express';

const app: Express = express();
const port = process.env.PORT || 4000;

app.get('/', (req: Request, res: Response) => {
  res.send('Hai');
});

app.listen(port, () => {
  console.log(`[server] Listening on http://localhost:${port}`);
});
