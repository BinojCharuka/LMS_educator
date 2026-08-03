require('dotenv').config();
const cloudinary = require('./config/cloudinary');
const fs = require('fs');

async function testFormat() {
    const pdfPath = 'test-proxy.pdf';
    const uploadRes = await cloudinary.uploader.upload(pdfPath, {
      folder: 'lumina/pdfs',
      resource_type: 'raw',
      format: 'txt'
    });
    console.log("Upload result with format: txt =>", uploadRes.secure_url);
}
testFormat().catch(console.error);
