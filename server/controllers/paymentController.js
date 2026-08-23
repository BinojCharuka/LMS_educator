const Payment = require('../models/Payment');
const LessonPack = require('../models/LessonPack');
const cloudinary = require('../config/cloudinary');
const Tesseract = require('tesseract.js');

/**
 * Helper function to run OCR on the uploaded bank slip and verify:
 * 1. Price exactly matches LessonPack price
 * 2. Date is today or within the last 7 days
 * 3. Remark contains the studentId
 */
const verifySlipOCR = async (imageUrl, expectedPrice, expectedStudentId) => {
  try {
    const { data: { text } } = await Tesseract.recognize(imageUrl, 'eng');
    
    // 1. Price Matching
    // Look for 'Rs', 'LKR', 'Amount', 'Price', 'Total' followed by a number
    // Or just look for the expected price directly if it's uniquely formatted
    let priceVerified = false;
    
    // First, let's try to find the exact expected price in the text.
    // This is safer since we know the expected price (e.g. 2000)
    // We look for boundaries around the price to avoid matching 2000 in 12000.
    const exactPriceRegex = new RegExp(`\\b${expectedPrice}(?:\\.00)?\\b`);
    if (exactPriceRegex.test(text)) {
      priceVerified = true;
    } else {
      // Fallback to the old method but more strictly looking for keywords
      const priceMatch = text.match(/(?:Rs\.?|LKR|Amount|Price|Total)[\s:]*([\d,]+\.\d{2}|[\d,]+)/i);
      if (priceMatch) {
        const extractedPrice = parseFloat(priceMatch[1].replace(/,/g, ''));
        if (extractedPrice === expectedPrice) priceVerified = true;
      }
    }

    // 2. Date Matching
    // Matches DD/MM/YYYY, DD-MM-YYYY, YYYY/MM/DD, YYYY-MM-DD
    const dateMatch = text.match(/\b(\d{2}[/-]\d{2}[/-]\d{4}|\d{4}[/-]\d{2}[/-]\d{2})\b/);
    let dateVerified = false;
    if (dateMatch) {
      const dateString = dateMatch[1];
      let slipDate;
      if (dateString.match(/^\d{2}[/-]\d{2}[/-]\d{4}$/)) {
        const parts = dateString.split(/[/-]/);
        // We will default to parsing as DD/MM/YYYY since it's the most common format outside the US.
        // Format for Date constructor: YYYY-MM-DD
        slipDate = new Date(`${parts[2]}-${parts[1]}-${parts[0]}`);
      } else {
        // YYYY-MM-DD
        slipDate = new Date(dateString.replace(/\//g, '-'));
      }
      
      const now = new Date();
      const diffTime = now.getTime() - slipDate.getTime();
      const diffDays = diffTime / (1000 * 3600 * 24);
      
      // Valid if within the last 2 days (and we allow -1 for timezone slight differences)
      if (diffDays >= -1 && diffDays <= 2) {
        dateVerified = true;
      }
    }

    // 3. Remark (Random Code) Matching
    // Looking for the exact remark code, ignoring spaces and dashes which OCR often adds randomly
    let remarkVerified = false;
    if (expectedStudentId) {
      const normalizedText = text.replace(/[\s-_]/g, '').toUpperCase();
      const normalizedExpected = expectedStudentId.replace(/[\s-_]/g, '').toUpperCase();
      
      if (normalizedText.includes(normalizedExpected)) {
        remarkVerified = true;
      }
    }

    console.log('--- OCR DEBUG ---');
    console.log('Extracted Text:\n', text);
    console.log('Expected:', { expectedPrice, expectedStudentId });
    console.log('Results:', { priceVerified, dateVerified, remarkVerified });
    console.log('-----------------');

    return priceVerified && dateVerified && remarkVerified;
  } catch (err) {
    console.error('OCR Extraction Error:', err);
    return false; // Fallback to manual review
  }
};

/**
 * @desc   Student uploads a bank slip for a specific month
 * @route  POST /api/payments
 * @access Private (student)
 */
exports.uploadPayment = async (req, res) => {
  try {
    const { lessonPackId, remark } = req.body;

    if (!req.file) {
      return res.status(400).json({ success: false, message: 'Slip image is required' });
    }

    // Fetch LessonPack to verify price
    const lessonPack = await LessonPack.findById(lessonPackId);
    if (!lessonPack) {
      await cloudinary.uploader.destroy(req.file.filename);
      return res.status(404).json({ success: false, message: 'Lesson Pack not found' });
    }

    // Handle existing submission for the same lesson pack
    const existing = await Payment.findOne({ studentId: req.user._id, lessonPackId });
    
    if (existing) {
      if (existing.status === 'rejected') {
        // Delete the old rejected slip image from cloudinary
        if (existing.slipImagePublicId) {
          try {
            await cloudinary.uploader.destroy(existing.slipImagePublicId);
          } catch (err) {
            console.error('Error deleting old slip image:', err);
          }
        }
        
        // Update the existing record with the new slip and set to pending while OCR runs
        existing.slipImageUrl = req.file.path;
        existing.slipImagePublicId = req.file.filename;
        existing.status = 'pending';
        existing.rejectionReason = ''; // Clear any previous rejection reason
        await existing.save();
        
        // Respond immediately so user doesn't wait for OCR
        res.status(200).json({ success: true, payment: existing });

        // Run OCR in background
        verifySlipOCR(req.file.path, lessonPack.price, remark)
          .then(async (isOCRVerified) => {
            if (isOCRVerified) {
              existing.status = 'approved';
              await existing.save();
            }
          })
          .catch(err => console.error('Background OCR Error:', err));
          
        return;
      } else {
        // If pending or approved, block the submission and delete the just-uploaded file
        await cloudinary.uploader.destroy(req.file.filename);
        return res.status(400).json({
          success: false,
          message: `Payment for this lesson pack already submitted (status: ${existing.status})`,
        });
      }
    }

    const payment = await Payment.create({
      studentId: req.user._id,
      lessonPackId,
      slipImageUrl: req.file.path,
      slipImagePublicId: req.file.filename,
      status: 'pending', // Set to pending initially
    });

    // Respond immediately so user doesn't wait for OCR
    res.status(201).json({ success: true, payment });

    // Run OCR in background
    verifySlipOCR(req.file.path, lessonPack.price, remark)
      .then(async (isOCRVerified) => {
        if (isOCRVerified) {
          payment.status = 'approved';
          await payment.save();
        }
      })
      .catch(err => console.error('Background OCR Error:', err));

  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/**
 * @desc   Get the logged-in student's own payment records
 * @route  GET /api/payments/my
 * @access Private (student)
 */
exports.getMyPayments = async (req, res) => {
  try {
    const payments = await Payment.find({ studentId: req.user._id })
      .populate('lessonPackId', 'title price')
      .sort({ createdAt: -1 });
    res.status(200).json({ success: true, payments });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/**
 * @desc   Get ALL payment records with student info (teacher view)
 * @route  GET /api/payments
 * @access Private (teacher)
 */
exports.getAllPayments = async (req, res) => {
  try {
    const filter = {};
    if (req.query.status) filter.status = req.query.status;
    if (req.query.lessonPackId) filter.lessonPackId = req.query.lessonPackId;

    const payments = await Payment.find(filter)
      .populate('studentId', 'name email avatar')
      .populate('lessonPackId', 'title price')
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, count: payments.length, payments });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/**
 * @desc   Approve or reject a payment (teacher only)
 * @route  PATCH /api/payments/:id/status
 * @access Private (teacher)
 * @body   { status: 'approved' | 'rejected', rejectionReason?: string }
 */
exports.updatePaymentStatus = async (req, res) => {
  try {
    const { status, rejectionReason } = req.body;

    if (!['approved', 'rejected'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Status must be approved or rejected' });
    }

    const payment = await Payment.findByIdAndUpdate(
      req.params.id,
      {
        status,
        rejectionReason: status === 'rejected' ? rejectionReason || '' : '',
      },
      { new: true }
    ).populate('studentId', 'name email').populate('lessonPackId', 'title');

    if (!payment) {
      return res.status(404).json({ success: false, message: 'Payment not found' });
    }

    res.status(200).json({ success: true, payment });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
