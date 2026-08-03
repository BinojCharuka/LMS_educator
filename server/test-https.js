const https = require('https');
https.get('https://res.cloudinary.com/dhpkwtpz9/raw/upload/v1785517350/lumina/pdfs/doc-1785517350998-783887709.pdf', (res) => {
  console.log("Status:", res.statusCode);
});
