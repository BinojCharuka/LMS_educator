const cloudinary = require('cloudinary').v2;
cloudinary.config({
  cloud_name: 'dhpkwtpz9',
  api_key: '611963949367425',
  api_secret: '-JdRKRa-RKyXjV6pjGBeZMLDIDA'
});
console.log("No version:", cloudinary.url('lumina/pdfs/doc-123.pdf', { resource_type: 'raw', sign_url: true }));
console.log("With version:", cloudinary.url('lumina/pdfs/doc-123.pdf', { resource_type: 'raw', version: '1785517350', sign_url: true }));
