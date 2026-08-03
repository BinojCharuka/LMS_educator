const cloudinary = require('cloudinary').v2;
cloudinary.config({ cloud_name: 'dhpkwtpz9', api_key: '611963949367425', api_secret: '-JdRKRa-RKyXjV6pjGBeZMLDIDA' });

const fs = require('fs');
fs.writeFileSync('dummy.pdf', '%PDF-1.4\n1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj\n3 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] >>\nendobj\ntrailer\n<< /Root 1 0 R >>\n%%EOF');

cloudinary.uploader.upload('dummy.pdf', { resource_type: 'image', folder: 'lumina/pdfs' }, (err, result) => {
  if (err) console.error(err);
  else {
    const attachmentUrl = cloudinary.url(result.public_id, { resource_type: 'image', flags: 'attachment' });
    console.log("Attachment URL:", attachmentUrl);
  }
});
