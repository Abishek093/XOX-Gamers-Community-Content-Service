// import dotenv from 'dotenv'
// dotenv.config()
// import express from 'express'
// import { createServer } from 'http'
// import connectDB from './frameworks-and-drivers/database/db'
// import cors from 'cors';
// import CustomError from './utils/CustomError'
// import { handleResponse } from './utils/ResponseHandler'
// import { ErrorRequestHandler } from 'express';
// import fs from 'fs';
// import router from './routes/routes'
// import { startQueueConsumer } from './services/queueService' 

// const app = express()
// const server = createServer(app)

// const PORT = process.env.PORT || 3002

// app.use(cors({
//     origin: (origin, callback) => {
//         const allowedOrigins = ['http://localhost:3001', 'http://localhost:5173'];
//         if (!origin || allowedOrigins.includes(origin)) {
//             callback(null, true);
//         } else {
//             callback(new Error('Not allowed by CORS'));
//         }
//     },
//     methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
//     allowedHeaders: ['Content-Type', 'Authorization'],
//     credentials: true,
// }));

// // Apply JSON parsing middleware before the routes
// app.use(express.json());

// app.use((req, res, next) => {
//     console.log('Content Service: Received request:', req.method, req.url);
//     console.log('Content Service: Request headers:', req.headers);
//     console.log('Content Service: Request body:', req.body);
//     next();
// });

// app.use(router)

// function logErrorToFile(err: CustomError) {
//     const log = `
//     ===============================
//     Date: ${new Date().toISOString()}
//     Status Code: ${err.statusCode}
//     Error Message: ${err.message}
//     Stack Trace: ${err.stack}  // This includes file and line numbers
//     ===============================\n\n`;

//     // Log to file
//     fs.appendFile('server-errors.log', log, (error) => {
//         if (error) console.error('Failed to write error log', error);
//     });

//     // Log to console
//     console.error(log);
// }

// app.use(((err: CustomError, req, res, next) => {
//     const statusCode = err.statusCode || 500;

//     if (statusCode >= 400 && statusCode < 500) {
//         handleResponse(res, statusCode, err.message); // Send user-friendly message
//     } else if (statusCode >= 500) {
//         logErrorToFile(err);  // Log detailed error including stack trace
//         handleResponse(res, statusCode, 'Something went wrong, please try again later.');
//     }
// }) as ErrorRequestHandler);

// connectDB().then(() => {
//     startQueueConsumer();
//     server.listen(PORT, () => {
//         console.log(`Server running on http://localhost:${PORT}`);
//     });
// });








// import dotenv from 'dotenv'
// dotenv.config()
// import express from 'express'
// import { createServer } from 'http'
// import connectDB from './frameworks-and-drivers/database/db'
// import cors from 'cors';
// import router from './routes/routes'
// import { startQueueConsumer } from './services/queueService' 
// import { Request, Response, NextFunction } from 'express';

// const app = express()
// const server = createServer(app)

// const PORT = process.env.PORT || 3002

// // Log every request received
// app.use((req: Request, res: Response, next: NextFunction) => {
//     console.log('Content Service: Received request:', req.method, req.url);
//     console.log('Content Service: Request headers:', req.headers);
    
//     // For logging JSON body
//     if (req.body) {
//         console.log('Content Service: Request body:', JSON.stringify(req.body));
//     } else {
//         console.log('Content Service: Request body: No body sent');
//     }
    
//     next();
// });

// // CORS setup
// app.use(cors({
//     origin: ['http://localhost:3001', 'http://localhost:5173'],
//     methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
//     allowedHeaders: ['Content-Type', 'Authorization'],
//     credentials: true,
// }));

// app.use(express.json());

// // Use the main router
// app.use(router);

// // Log errors
// app.use((err: any, req: Request, res: Response, next: NextFunction) => {
//     console.error('Content Service: Error occurred:', err.message);
//     console.error('Stack trace:', err.stack);
    
//     res.status(500).json({ error: 'Internal Server Error', message: err.message });
// });

// // Connect to the database and start the server
// connectDB().then(() => {
//     startQueueConsumer();
//     server.listen(PORT, () => {
//         console.log(`Content Service running on http://localhost:${PORT}`);
//     });
// }).catch(err => {
//     console.error('Content Service: Failed to start service due to DB connection error:', err.message);
// });



import dotenv from 'dotenv';
dotenv.config();
import express, { Request, Response, NextFunction } from 'express';
import { createServer } from 'http';
import connectDB from './frameworks-and-drivers/database/db';
import cors from 'cors';
import fs from 'fs';
import CustomError from './utils/CustomError';
import { handleResponse } from './utils/ResponseHandler';
import { ErrorRequestHandler } from 'express';
import router from './routes/routes';
import { startQueueConsumer } from './services/queueService';
import { Server } from 'socket.io';


const app = express();
const server = createServer(app);
const io = new Server(server, {
    cors: {
        origin: 'http://localhost:5173',
        methods: ['GET', 'POST'],
    }
});
// Define the port
const PORT = process.env.PORT || 3002;

// app.use(cors({
//     origin: (origin, callback) => {
//         const allowedOrigins = (process.env.ALLOWED_ORIGINS || 'http://localhost:3001,http://localhost:5173').split(',');
//         if (!origin || allowedOrigins.includes(origin)) {
//             callback(null, true);
//         } else {
//             callback(new Error('Not allowed by CORS'));
//         }
//     },
//     methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
//     allowedHeaders: ['Content-Type', 'Authorization'],
//     credentials: true,
// }));


// Middleware for logging requests

// JSON parsing middleware
app.use(express.json());
// app.use((req: Request, res: Response, next: NextFunction) => {
//     console.log('Content Service: Received request:', req.method, req.url);
//     console.log('Content Service: Request headers:', req.headers);
//     console.log('Content Service: Request body:', req.body);
//     next();
// });

// Routes
app.use("/api/content",router);

// Utility function to log errors to file
function logErrorToFile(err: CustomError) {
    const log = `
    ===============================
    Date: ${new Date().toISOString()}
    Status Code: ${err.statusCode}
    Error Message: ${err.message}
    Stack Trace: ${err.stack}
    ===============================\n\n`;

    // Log to file
    fs.appendFile('server-errors.log', log, (error) => {
        if (error) console.error('Failed to write error log', error);
    });

    // Log to console
    console.error(log);
}

// Global error handler
app.use(((err: CustomError, req: Request, res: Response, next: NextFunction) => {
    const statusCode = err.statusCode || 500;

    if (statusCode >= 400 && statusCode < 500) {
        // Client error - send the error message
        handleResponse(res, statusCode, err.message);
    } else if (statusCode >= 500) {
        // Server error - log and send generic message
        logErrorToFile(err);
        handleResponse(res, statusCode, 'Something went wrong, please try again later.');
    }
}) as ErrorRequestHandler);

// Connect to the database and start the server
connectDB().then(() => {
    startQueueConsumer();
    server.listen(PORT, () => {
        console.log(`Server running on http://localhost:${PORT}`);
    });
}).catch((err) => {
    console.error('Content Service: Failed to start service due to DB connection error:', err.message);
});

io.on('connection', (socket) => {
    console.log('A user connected');

    socket.on('disconnect', () => {
        console.log('User disconnected');
    });
});

export { io };