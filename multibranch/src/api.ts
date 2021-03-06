import { Router } from 'express';
import { sum } from './math.helpers';

export const api = Router();

api.get('/sum', async (req, res) => {
  try {
    const params = req.query;
    // console.log(params);
    const a: number = Number(params.a);
    const b: number = Number(params.b);
    // console.log(a, b);
    const result = `The result is ${sum(a, b)}`;
    res.send(result);
  } catch (error) {
    console.log({ error });
    res.sendStatus(400);
  }
});
