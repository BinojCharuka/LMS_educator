require('dotenv').config({path: 'server/.env'});
const cloudinary = require('./server/config/cloudinary');
const fs = require('fs');

// Create a dummy PDF
fs.writeFileSync('dummy.pdf', '%PDF-1.4\n1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj\n3 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] >>\nendobj\ntrailer\n<< /Root 1 0 R >>\n%%EOF');

cloudinary.uploader.upload('dummy.pdf', {
  resource_type: 'image',
  folder: 'lumina/pdfs',
  format: 'pdf',
}, (err, result) => {
  if (err) console.error(err);
  else {
    console.log("Upload result:", result.secure_url);
    const attachmentUrl = cloudinary.url(result.public_id, {
      resource_type: 'image',
      flags: 'attachment'
    });
    console.log("Attachment URL:", attachmentUrl);
  }
});
