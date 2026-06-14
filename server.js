// // const express = require('express');
// // const multer = require('multer');
// // const fs = require('fs');
// // const path = require('path');

// // const app = express();
// // const PORT = 3000;

// // // Create main uploads folder if it doesn't exist
// // const uploadDir = path.join(__dirname, 'uploads');
// // if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

// // // Setup storage
// // const storage = multer.diskStorage({
// //     destination: (req, file, cb) => {
// //         // Fix: If device_id hasn't reached req.body yet, check req.query or default cleanly
// //         const deviceId = req.body.device_id || req.query.device_id || 'unknown_device';
        
// //         // Let's also organize files by today's date so it's clean to browse
// //         const today = new Date().toISOString().split('T')[0]; 
// //         const targetDir = path.join(uploadDir, deviceId, today);
        
// //         if (!fs.existsSync(targetDir)) {
// //             fs.mkdirSync(targetDir, { recursive: true });
// //         }
// //         cb(null, targetDir);
// //     },
// //     filename: (req, file, cb) => {
// //         // Keep original filename but prepend timestamp to prevent overwriting duplicate names
// //         cb(null, Date.now() + '_' + file.originalname);
// //     }
// // });

// // const upload = multer({ storage: storage });

// // // Upload endpoint
// // app.post('/upload', upload.single('file'), (req, res) => {
// //     // 1. Check if a file actually arrived
// //     if (!req.file) {
// //         console.log(`❌ Upload failed: No file received in request.`);
// //         return res.status(400).json({ success: false, error: 'No file received' });
// //     }

// //     // 2. Gather data details to print to your console
// //     const deviceId = req.body.device_id || 'Not Provided';
// //     const fileSizeMB = (req.file.size / (1024 * 1024)).toFixed(2); // Convert bytes to MB

// //     console.log(`\n================ NEW INCOMING FILE ================`);
// //     console.log(`📱 Device ID : ${deviceId}`);
// //     console.log(`📄 File Name : ${req.file.originalname}`);
// //     console.log(`📁 Saved To  : ${path.relative(__dirname, req.file.path)}`);
// //     console.log(`⚖️  File Size : ${fileSizeMB} MB`);
// //     console.log(`🚀 Mime-Type : ${req.file.mimetype}`);
// //     console.log(`===================================================`);

// //     res.json({ success: true });
// // });

// // // Deep View Endpoint: See all devices and files structured perfectly
// // app.get('/files', (req, res) => {
// //     const getFileTree = (dir) => {
// //         let results = [];
// //         const list = fs.readdirSync(dir);
// //         list.forEach((file) => {
// //             const filePath = path.join(dir, file);
// //             const stat = fs.statSync(filePath);
// //             if (stat && stat.isDirectory()) {
// //                 results.push({ folder: file, contents: getFileTree(filePath) });
// //             } else {
// //                 results.push({ file: file, size: (stat.size / 1024).toFixed(1) + ' KB' });
// //             }
// //         });
// //         return results;
// //     };

// //     if (fs.existsSync(uploadDir)) {
// //         res.json({ uploads: getFileTree(uploadDir) });
// //     } else {
// //         res.json({ uploads: [] });
// //     }
// // });

// // app.listen(PORT, () => {
// //     console.log(`\n🚀 Backup Server running on port ${PORT}`);
// //     console.log(`📱 Copy one of these URLs into your Android App Service URL:`);
    
// //     const { networkInterfaces } = require('os');
// //     const nets = networkInterfaces();
// //     for (const name of Object.keys(nets)) {
// //         for (const net of nets[name]) {
// //             if (net.family === 'IPv4' && !net.internal) {
// //                 console.log(`   👉 http://${net.address}:${PORT}/upload`);
// //             }
// //         }
// //     }
// //     console.log(`\n🖥️  To view all received data in your browser, open: http://localhost:${PORT}/files\n`);
// // });


// // server.js
// const express = require('express');
// const multer = require('multer');
// const path = require('path');

// const app = express();
// const PORT = 3000;

// // Configure multer for file uploads
// const storage = multer.diskStorage({
//     destination: './uploads',
//     filename: (req, file, cb) => {
//         // Keep original filename
//         cb(null, file.originalname);
//     }
// });

// const upload = multer({ 
//     storage: storage,
//     limits: {
//         fileSize: 500 * 1024 * 1024 // 500MB limit
//     }
// });

// // Serve uploaded files statically
// app.use('/files', express.static('uploads'));

// // Upload endpoint
// app.post('/upload', upload.single('file'), (req, res) => {
//     if (!req.file) {
//         return res.status(400).json({ error: 'No file uploaded' });
//     }
    
//     console.log(`File uploaded: ${req.file.originalname} (${req.file.size} bytes)`);
//     res.json({ 
//         success: true, 
//         filename: req.file.originalname,
//         size: req.file.size 
//     });
// });

// // Health check endpoint
// app.get('/health', (req, res) => {
//     res.json({ status: 'ok' });
// });

// app.listen(PORT, '0.0.0.0', () => {
//     console.log(`Server running on http://192.168.0.104:${PORT}`);
// });

const express = require('express');
const multer = require('multer');
const fs = require('fs');
const path = require('path');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());

const uploadDir = './uploads';
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir);

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const deviceId = req.body.device_id || 'unknown';
        const deviceDir = path.join(uploadDir, deviceId);
        if (!fs.existsSync(deviceDir)) fs.mkdirSync(deviceDir, { recursive: true });
        cb(null, deviceDir);
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + '_' + file.originalname);
    }
});

const upload = multer({ storage: storage });

// Upload endpoint
app.post('/upload', upload.single('file'), (req, res) => {
    if (req.file) {
        console.log(`✅ Received: ${req.file.originalname}`);
        res.json({ success: true });
    } else {
        res.status(400).json({ success: false });
    }
});

// Test endpoint
app.get('/', (req, res) => {
    res.send('Server is running ✅');
});

// List files endpoint
app.get('/files', (req, res) => {
    if (fs.existsSync(uploadDir)) {
        const devices = fs.readdirSync(uploadDir);
        const result = {};
        for (const device of devices) {
            const devicePath = path.join(uploadDir, device);
            if (fs.statSync(devicePath).isDirectory()) {
                result[device] = fs.readdirSync(devicePath);
            }
        }
        res.json({ success: true, files: result });
    } else {
        res.json({ success: true, files: {} });
    }
});

// FIXED: Listen on 0.0.0.0
app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on port ${PORT}`);
});