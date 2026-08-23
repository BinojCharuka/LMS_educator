const Setting = require('../models/Setting');
const cloudinary = require('../config/cloudinary');

/**
 * @desc   Update Landing Page Teacher Info (Image, Name, Qualifications)
 * @route  POST /api/admin/settings/landing-teacher
 * @access Private (admin)
 */
exports.updateLandingTeacher = async (req, res) => {
  try {
    const { name, qualifications } = req.body;
    let newImageUrl = null;

    if (req.file) {
      newImageUrl = req.file.path; // Cloudinary URL
    }

    let setting = await Setting.findOne({ key: 'landingTeacher' });

    if (!setting) {
      setting = new Setting({
        key: 'landingTeacher',
        value: {
          name: name || 'Mr. Suresh',
          qualifications: qualifications || 'M.Sc. | B.Ed. Hons.',
          imageUrl: newImageUrl || '',
        },
      });
    } else {
      // If a new image was uploaded and there was an old image, we could delete it from Cloudinary
      // but for simplicity and safety, we'll just update the URL.
      if (newImageUrl) {
        // Optional: Extract old public_id and delete
        // if (setting.value.imageUrl) { ... }
        setting.value.imageUrl = newImageUrl;
      }
      if (name !== undefined) setting.value.name = name;
      if (qualifications !== undefined) setting.value.qualifications = qualifications;
      
      // Mark as modified since it's a Mixed type
      setting.markModified('value');
    }

    await setting.save();
    res.status(200).json({ success: true, setting: setting.value });
  } catch (error) {
    console.error('Update Landing Teacher Error:', error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

/**
 * @desc   Get Landing Page Teacher Info
 * @route  GET /api/proxy/settings/landing-teacher
 * @access Public
 */
exports.getLandingTeacher = async (req, res) => {
  try {
    const setting = await Setting.findOne({ key: 'landingTeacher' });
    if (!setting) {
      return res.status(200).json({ 
        success: true, 
        setting: {
          name: 'Mr. Suresh',
          qualifications: 'M.Sc. | B.Ed. Hons.',
          imageUrl: null
        } 
      });
    }
    res.status(200).json({ success: true, setting: setting.value });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};
