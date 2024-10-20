import { Response } from "express";

export const handleResponse = (
    res: Response,
    statusCode: number,
    message: string | unknown,
    data?: unknown
): void => {
    res.status(statusCode).json({
        status: statusCode >= 400 ? 'error' : 'success',
        message,
        ...(data && typeof data === 'object' ? { data } : {}),
    });
};
