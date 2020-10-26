import { NowRequest, NowResponse } from "@vercel/node";

module.exports = (req: NowRequest, res: NowResponse) => {
  const { name = "World" } = req.query;
  res.send(`Hello ${name}!`);
};
