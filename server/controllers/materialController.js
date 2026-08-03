const Material = require('../models/Material');
const cloudinary = require('../config/cloudinary');

// Helper to proxy Cloudinary URLs for raw PDFs (legacy support)
const proxyUrlIfPdf = (url, req) => {
  if (url && url.includes('cloudinary.com')) {
    const backendHost = req.protocol + '://' + req.get('host');
    return `${backendHost}/api/proxy/pdf?url=${encodeURIComponent(url)}`;
  }
  return url;
};

/**
 * @desc   Create a new material (PDF, YT-video, or live-link)
 * @route  POST /api/materials
 * @access Private (teacher)
 */
exports.createMaterial = async (req, res) => {
  try {
    const { title, type, url, lessonPackId, description } = req.body;

    let finalUrl = url;

    // If a PDF file was uploaded via multer
    if (req.file) {
      if (req.file.location) {
        // S3 / R2 Upload
        if (process.env.R2_PUBLIC_DOMAIN) {
          finalUrl = `${process.env.R2_PUBLIC_DOMAIN}/${req.file.key}`;
        } else {
          finalUrl = req.file.location;
        }
      } else {
        // Cloudinary fallback
        finalUrl = req.file.path; 
      }
    }

    const material = await Material.create({
      title,
      type,
      url: finalUrl,
      lessonPackId,
      description,
      uploadedBy: req.user._id,
    });

    res.status(201).json({ success: true, material });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/**
 * @desc   Get all materials (optionally filter by lessonPackId)
 * @route  GET /api/materials?lessonPackId=123
 * @access Private (teacher / admin)
 */
exports.getMaterials = async (req, res) => {
  try {
    const filter = {};
    if (req.query.lessonPackId) filter.lessonPackId = req.query.lessonPackId;

    const materials = await Material.find(filter)
      .populate('lessonPackId', 'title')
      .sort({ createdAt: -1 });
    
    const materialsWithSignedUrls = materials.map(m => {
      const obj = m.toObject();
      obj.url = proxyUrlIfPdf(obj.url, req);
      return obj;
    });

    res.status(200).json({ success: true, count: materialsWithSignedUrls.length, materials: materialsWithSignedUrls });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/**
 * @desc   Get materials for a specific approved lesson pack (student access)
 * @route  GET /api/materials/student?lessonPackId=123
 * @access Private (student)
 */
exports.getStudentMaterials = async (req, res) => {
  try {
    const Payment = require('../models/Payment');
    const { lessonPackId } = req.query;

    if (!lessonPackId) {
      return res.status(400).json({ success: false, message: 'lessonPackId is required' });
    }

    // Check if student's payment for this lesson pack is approved
    const payment = await Payment.findOne({
      studentId: req.user._id,
      lessonPackId,
      status: 'approved',
    });

    if (!payment) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Payment not approved for this lesson pack.',
        accessDenied: true,
      });
    }

    const materials = await Material.find({ lessonPackId }).sort({ type: 1, createdAt: -1 });
    
    // Sign URLs for students too
    const materialsWithSignedUrls = materials.map(m => {
      let obj = m.toObject();
      obj.url = proxyUrlIfPdf(obj.url, req);
      return obj;
    });

    res.status(200).json({ success: true, count: materialsWithSignedUrls.length, materials: materialsWithSignedUrls });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/**
 * @desc   Get recent materials across all approved lesson packs
 * @route  GET /api/materials/student/recent
 * @access Private (student)
 */
exports.getRecentStudentMaterials = async (req, res) => {
  try {
    const Payment = require('../models/Payment');
    
    const approvedPayments = await Payment.find({
      studentId: req.user._id,
      status: 'approved',
    });
    
    const packIds = approvedPayments.map(p => p.lessonPackId);
    
    const materials = await Material.find({ lessonPackId: { $in: packIds } })
      .sort({ createdAt: -1 })
      .limit(5);
      
    const materialsWithSignedUrls = materials.map(m => {
      let obj = m.toObject();
      obj.url = proxyUrlIfPdf(obj.url, req);
      return obj;
    });

    res.status(200).json({ success: true, materials: materialsWithSignedUrls });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/**
 * @desc   Get materials for a specific lesson pack WITHOUT urls (for student preview before buying)
 * @route  GET /api/materials/preview/:lessonPackId
 * @access Private (student)
 */
exports.getPreviewMaterials = async (req, res) => {
  try {
    const { lessonPackId } = req.params;

    if (!lessonPackId) {
      return res.status(400).json({ success: false, message: 'lessonPackId is required' });
    }

    const materials = await Material.find({ lessonPackId }).sort({ type: 1, createdAt: -1 });
    
    // Mask the URLs
    const previewMaterials = materials.map(m => {
      const obj = m.toObject();
      obj.url = null; // Do not send URL
      return obj;
    });

    res.status(200).json({ success: true, count: previewMaterials.length, materials: previewMaterials });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/**
 * @desc   Update a material
 * @route  PUT /api/materials/:id
 * @access Private (teacher)
 */
exports.updateMaterial = async (req, res) => {
  try {
    let finalUrl = req.body.url;
    if (req.file) {
      if (req.file.location) {
        if (process.env.R2_PUBLIC_DOMAIN) finalUrl = `${process.env.R2_PUBLIC_DOMAIN}/${req.file.key}`;
        else finalUrl = req.file.location;
      } else {
        finalUrl = req.file.path;
      }
    }
    
    const updates = { ...req.body };
    if (finalUrl) updates.url = finalUrl;

    const material = await Material.findByIdAndUpdate(req.params.id, updates, {
      new: true,
      runValidators: true,
    });
    
    if (!material) {
      return res.status(404).json({ success: false, message: 'Material not found' });
    }
    res.status(200).json({ success: true, material });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/**
 * @desc   Delete a material (also removes PDF from Cloudinary if applicable)
 * @route  DELETE /api/materials/:id
 * @access Private (teacher)
 */
exports.deleteMaterial = async (req, res) => {
  try {
    const material = await Material.findById(req.params.id);
    if (!material) {
      return res.status(404).json({ success: false, message: 'Material not found' });
    }

    // If it's a PDF hosted on Cloudinary, delete the asset
    if (material.type === 'pdf') {
      if (material.url.includes('cloudinary.com')) {
        const filename = material.url.split('/').pop();
        await cloudinary.uploader.destroy(`educator/pdfs/${filename}`, {
          resource_type: 'raw',
        });
      } else if (process.env.R2_PUBLIC_DOMAIN && material.url.includes(process.env.R2_PUBLIC_DOMAIN)) {
        const { deleteFromR2 } = require('../middleware/upload');
        const key = material.url.replace(`${process.env.R2_PUBLIC_DOMAIN}/`, '');
        await deleteFromR2(key);
      }
    }

    await material.deleteOne();
    res.status(200).json({ success: true, message: 'Material deleted' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/**
 * @desc   Create Mux direct upload URL
 * @route  POST /api/materials/mux-upload-url
 * @access Private (teacher)
 */
exports.createMuxUpload = async (req, res) => {
  try {
    const Mux = require('@mux/mux-node');
    const tokenId = process.env.MUX_TOKEN_ID;
    const tokenSecret = process.env.MUX_TOKEN_SECRET;

    if (!tokenId || !tokenSecret) {
      return res.status(400).json({
        success: false,
        message: 'Mux is not configured. Set MUX_TOKEN_ID and MUX_TOKEN_SECRET in server .env'
      });
    }

    const muxClient = new Mux({ tokenId, tokenSecret });

    const upload = await muxClient.video.uploads.create({
      cors_origin: '*',
      new_asset_settings: {
        playback_policy: ['public']
      }
    });

    res.status(201).json({
      success: true,
      uploadId: upload.id,
      uploadUrl: upload.url
    });
  } catch (err) {
    console.error('Mux upload URL creation error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
};

/**
 * @desc   Check status of Mux upload and get playback ID
 * @route  GET /api/materials/mux-status/:uploadId
 * @access Private (teacher)
 */
exports.checkMuxUploadStatus = async (req, res) => {
  try {
    const { uploadId } = req.params;
    const Mux = require('@mux/mux-node');
    const tokenId = process.env.MUX_TOKEN_ID;
    const tokenSecret = process.env.MUX_TOKEN_SECRET;

    if (!tokenId || !tokenSecret) {
      return res.status(400).json({
        success: false,
        message: 'Mux is not configured.'
      });
    }

    const muxClient = new Mux({ tokenId, tokenSecret });
    const upload = await muxClient.video.uploads.retrieve(uploadId);

    if (upload.status === 'asset_created') {
      const asset = await muxClient.video.assets.retrieve(upload.asset_id);
      const playbackId = asset.playback_ids?.[0]?.id;

      return res.status(200).json({
        success: true,
        status: 'completed',
        playbackId,
        playbackUrl: `https://stream.mux.com/${playbackId}.m3u8`
      });
    }

    res.status(200).json({
      success: true,
      status: upload.status // 'waiting', 'errored', etc.
    });
  } catch (err) {
    console.error('Mux status check error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
};
