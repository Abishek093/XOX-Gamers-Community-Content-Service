// import express from 'express';
// import sponsoredPostRoutes from './sponsoredPostRoutes'; 
// import postRoutes from './postRoutes'; 
// import communityRoutes from './communityRoutes'
// import newsRoutes from './newsRoutes';

// const router = express.Router();

// router.use((req, res, next) => {
//     console.log('Incoming request to Content Service routes:', req.method, req.url, req.headers, req.originalUrl);
//     next();
// });


// router.use('/sponsored-posts', sponsoredPostRoutes);
// router.use('/posts', postRoutes);
// router.use('/communities', communityRoutes);
// router.use('/news', newsRoutes);

// export default router;


// import express from 'express';
// import sponsoredPostRoutes from './sponsoredPostRoutes'; 
// import postRoutes from './postRoutes'; 
// import communityRoutes from './communityRoutes'
// import newsRoutes from './newsRoutes';

// const router = express.Router();

// console.log('Routes file loaded');

// console.log('Mounting /posts routes');
// router.use('/posts', postRoutes);


// console.log('Mounting /sponsored-posts routes');
// router.use('/sponsored-posts', sponsoredPostRoutes);


// console.log('Mounting /communities routes');
// router.use('/communities', communityRoutes);

// console.log('Mounting /news routes');
// router.use('/news', newsRoutes);

// console.log('All routes mounted');

// export default router;







import express from 'express';
import sponsoredPostRoutes from './sponsoredPostRoutes'; 
import postRoutes from './postRoutes'; 
import communityRoutes from './communityRoutes';
import newsRoutes from './newsRoutes';

const router = express.Router();

router.use((req, res, next) => {
    // console.log('Content Service Routes: Handling request:', req.method, req.url);
    next();
});

console.log('Mounting /posts routes');
router.use('/posts', postRoutes);  

console.log('Mounting /sponsored-posts routes');
router.use('/sponsored-posts', sponsoredPostRoutes);

console.log('Mounting /communities routes');
router.use('/communities', communityRoutes);

console.log('Mounting /news routes');
router.use('/news', newsRoutes);


export default router;
