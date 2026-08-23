const express = require('express');
const router = express.Router();
const https = require('https');
const http = require('http');
const url = require('url');
const { protect } = require('../middleware/auth');
const Material = require('../models/Material');
const Payment = require('../models/Payment');

router.get('/pdf', (req, res) => {
  const targetUrl = req.query.url;
  
  if (!targetUrl || !targetUrl.includes('cloudinary.com')) {
    return res.status(400).send('Invalid URL');
  }

  // Parse the URL to use with https
  const parsedUrl = url.parse(targetUrl);
  const options = {
    hostname: parsedUrl.hostname,
    path: parsedUrl.path,
    method: 'GET',
    headers: {
      'User-Agent': 'Node.js/proxy'
    }
  };

  https.get(options, (cloudinaryRes) => {
    if (cloudinaryRes.statusCode !== 200) {
      return res.status(cloudinaryRes.statusCode).send('Failed to fetch from Cloudinary');
    }

    // Set headers to force the browser to treat it as a PDF
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'inline; filename="document.pdf"');
    
    // Pipe the response directly to the client
    cloudinaryRes.pipe(res);
  }).on('error', (err) => {
    console.error("Proxy error:", err);
    res.status(500).send('Proxy server error');
  });
});

// Secure Video Proxy endpoint with Range requests support (important for timeline scrubbing)
router.get('/video/:materialId', protect, async (req, res) => {
  try {
    const { materialId } = req.params;
    const material = await Material.findById(materialId);
    if (!material) {
      return res.status(404).send('Material not found');
    }

    // Auth Check: Student must have approved payment for the lesson pack, or user is teacher/admin
    const isAuthorized = req.user.role === 'teacher' || req.user.role === 'admin';
    if (!isAuthorized) {
      const payment = await Payment.findOne({
        studentId: req.user._id,
        lessonPackId: material.lessonPackId,
        status: 'approved'
      });
      if (!payment) {
        return res.status(403).send('Access Denied: Payment not approved');
      }
    }

    const videoUrl = material.url;
    if (!videoUrl) {
      return res.status(400).send('Video URL is missing');
    }

    // Parse the video URL
    const parsedUrl = url.parse(videoUrl);
    const clientRange = req.headers.range;

    const headers = {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'
    };
    if (clientRange) {
      headers['Range'] = clientRange;
    }

    const options = {
      hostname: parsedUrl.hostname,
      path: parsedUrl.path,
      method: 'GET',
      headers: headers
    };

    const httpClient = videoUrl.startsWith('https') ? https : http;

    const proxyReq = httpClient.request(options, (remoteRes) => {
      // Forward relevant range and content headers back to client
      if (remoteRes.headers['content-range']) {
        res.setHeader('Content-Range', remoteRes.headers['content-range']);
      }
      if (remoteRes.headers['content-length']) {
        res.setHeader('Content-Length', remoteRes.headers['content-length']);
      }
      if (remoteRes.headers['content-type']) {
        res.setHeader('Content-Type', remoteRes.headers['content-type']);
      }
      res.setHeader('Accept-Ranges', 'bytes');
      
      res.writeHead(remoteRes.statusCode || (clientRange ? 206 : 200));
      remoteRes.pipe(res);
    });

    proxyReq.on('error', (err) => {
      console.error('Video proxy request failed:', err.message);
      if (!res.headersSent) {
        res.status(500).send('Video proxy stream failed');
      }
    });

    proxyReq.end();
  } catch (err) {
    console.error('Video proxy error:', err);
    res.status(500).send('Server error');
  }
});

const { getLandingTeacher } = require('../controllers/settingController');
router.get('/settings/landing-teacher', getLandingTeacher);

module.exports = router;
