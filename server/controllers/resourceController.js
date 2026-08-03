const Resource = require('../models/Resource');
const cloudinary = require('../config/cloudinary');

/**
 * @desc   Create a new resource
 * @route  POST /api/resources
 * @access Private (teacher)
 */
exports.createResource = async (req, res) => {
  try {
    const { title, category } = req.body;

    let finalUrl = '';
    if (req.file) {
      if (req.file.location) {
        if (process.env.R2_PUBLIC_DOMAIN) {
          finalUrl = `${process.env.R2_PUBLIC_DOMAIN}/${req.file.key}`;
        } else {
          finalUrl = req.file.location;
        }
      } else {
        finalUrl = req.file.path;
      }
    } else {
      return res.status(400).json({ success: false, message: 'File is required' });
    }

    const resource = await Resource.create({
      title,
      category,
      fileUrl: finalUrl,
      uploadedBy: req.user._id,
    });

    res.status(201).json({ success: true, resource });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/**
 * @desc   Get all resources
 * @route  GET /api/resources
 * @access Private
 */
exports.getResources = async (req, res) => {
  try {
    const filter = {};
    if (req.query.category) filter.category = req.query.category;

    const resources = await Resource.find(filter).sort({ createdAt: -1 });

    // Generate proxy URLs to bypass Cloudinary's strict PDF delivery restrictions
    const resourcesWithProxyUrls = resources.map(resource => {
      const resObj = resource.toObject();
      if (resObj.fileUrl && resObj.fileUrl.includes('cloudinary.com')) {
        // Build the backend proxy URL
        const backendHost = req.protocol + '://' + req.get('host');
        resObj.fileUrl = `${backendHost}/api/proxy/pdf?url=${encodeURIComponent(resObj.fileUrl)}`;
      }
      return resObj;
    });

    res.status(200).json({ success: true, count: resourcesWithProxyUrls.length, resources: resourcesWithProxyUrls });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/**
 * @desc   Delete a resource
 * @route  DELETE /api/resources/:id
 * @access Private (teacher, admin)
 */
exports.deleteResource = async (req, res) => {
  try {
    const resource = await Resource.findById(req.params.id);
    if (!resource) {
      return res.status(404).json({ success: false, message: 'Resource not found' });
    }

    if (resource.fileUrl) {
      if (resource.fileUrl.includes('cloudinary.com')) {
        const filename = resource.fileUrl.split('/').pop();
        await cloudinary.uploader.destroy(`educator/pdfs/${filename}`, {
          resource_type: 'raw',
        });
      } else if (process.env.R2_PUBLIC_DOMAIN && resource.fileUrl.includes(process.env.R2_PUBLIC_DOMAIN)) {
        const { deleteFromR2 } = require('../middleware/upload');
        const key = resource.fileUrl.replace(`${process.env.R2_PUBLIC_DOMAIN}/`, '');
        await deleteFromR2(key);
      }
    }

    await resource.deleteOne();
    res.status(200).json({ success: true, message: 'Resource deleted' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
