class CustomError extends Error {
    public statusCode: number;  
    public status: string;       
    public isOperational: boolean; 

    constructor(error: unknown, statusCode: number) {
        let message;

        if (error instanceof Error) {
            message = error.message;
        } else if (error && typeof error === 'object' && 'message' in error) {
            message = String((error as { message: unknown }).message); 
        } else if (typeof error === 'string') {
            message = error;
        } else {
            message = "Oops, something went wrong!";
        }

        super(message);
        this.statusCode = statusCode; 
        this.status = statusCode >= 400 && statusCode < 500 ? 'fail' : 'error'; 
        this.isOperational = true; 

        Error.captureStackTrace(this, this.constructor); 
    }
}

export default CustomError;
