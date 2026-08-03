require('dotenv').config({path: 'server/.env'});
const cloudinary = require('./server/config/cloudinary');

const public_id = 'lumina/pdfs/doc-1785516824437-571709480.pdf'; // from the screenshot
const url = cloudinary.url(public_id, {
  resource_type: 'raw',
  type: 'upload',
  sign_url: true,
});
console.log(url);
