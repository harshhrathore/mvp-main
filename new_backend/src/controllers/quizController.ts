import { Response } from "express";
import { AuthRequest } from "../middleware/authMiddleware";

export const submitQuiz = async (req: AuthRequest, res: Response) => {
  const { answers } = req.body; // array of {dosha, weight}
  const userId = req.user?.userId!;

  let vata = 0, pitta = 0, kapha = 0;

  answers.forEach((a: any) => {
    if (a.dosha === "Vata") vata += a.weight;
    if (a.dosha === "Pitta") pitta += a.weight;
    if (a.dosha === "Kapha") kapha += a.weight;
  });

  const profile =
    vata > pitta && vata > kapha ? "Vata" :
    pitta > kapha ? "Pitta" : "Kapha";

  res.json({ profile, vata, pitta, kapha });
};
