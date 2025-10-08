import { Request, Response, NextFunction } from "express";

type ValidatorResult = { value: any; errors?: Array<{ message: string; path?: (string | number)[] }>; };
type ValidatorFn = (data: any) => ValidatorResult;

export function validateRequest(validator: ValidatorFn) {
    return (req: Request, res: Response, next: NextFunction): void => {
        const { value, errors } = validator(req.body);
        if (errors && errors.length) {
            res.status(422).json({
                error: "ValidationError",
                details: errors,
            });
            return;
        }
        req.body = value;
        next();
    };
}


