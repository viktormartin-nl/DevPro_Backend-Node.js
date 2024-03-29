import { Request, Response, NextFunction } from "express";

import { z } from "zod";
import User from "../models/User";

// zod Validations
const registerSchema = z.object({
    first_name: z.string().min(3),
    last_name: z.string().min(3),
    username: z.string().min(3),
    email: z.string().min(6).email(),
    password: z.string().min(6)
}).strict();

type RequestBody = {
    email: string;
    username: string;
}
export const registerValidation = async (req: Request, res: Response, next: NextFunction) => {
    // validating using zod
    const parsed = registerSchema.safeParse(req.body);
    if (!parsed.success)
        res.status(400).send(parsed.error)
    else {
        const { email: emailFromBody, username }: RequestBody = req.body;
        // checking to see if the user is already registered
        const emailExist = await User.findOne({ email: emailFromBody })
        const usernameExist = await User.findOne({ username })
        if (emailExist)
            res.status(400).json({ msg: "email already registered!" })
        else if (usernameExist)
            res.status(400).json({ msg: "This username is already taken!" })
        else
            next();
    }
}
