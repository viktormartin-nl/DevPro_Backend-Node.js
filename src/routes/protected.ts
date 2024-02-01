import { Request, Response, Router } from "express";
const router = Router();

import { verify } from "../middleware/verify-token";
import { changePassword, deleteProfileImage, deleteUserImage, deleteUserVideo, getAllUsers, getUser, getUserDetails, updateProfileImage, updateUser, uploadUserImages, uploadUserVideo } from "../controllers/protected/user";
import { addProduct, buyProduct, getAllProducts } from "../controllers/protected/product";
import multer, { FileFilterCallback } from 'multer'
import path from "path";
import { addReview, updateReview } from "../controllers/protected/review";
import { addPayment } from "../controllers/protected/payment";
import { changePasswordValidation, changePasswordValidationMiddleware } from "../middleware/change-password-validation";
import Stripe from "stripe";
import Message from "../models/Message";
import User from "../models/User";
import { Mongoose } from "mongoose";






// --------------------<-----------------------




// Send a message


// Receive the last unread message
router.get('/receive/:recipientId', verify, async (req, res) => {
  try {
    const message = await Message.findOne({ recipient: req.params.recipientId, isRead: false }).sort({ timestamp: -1 });
    if (!message) {
      return res.status(404).json({ message: 'No unread messages found' });
    }
    res.status(200).json({
      message: 'Message fetched successfully',
      data: message
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

// Get message history with a user
router.get('/history/:userId/:otherUserId/:page', verify, async (req, res) => {
  try {
    const page = parseInt(req.params.page, 20) || 1; // Get page number from params
    const limit = page * 20; // Calculate limit based on page number

    const messages = await Message.find({
      $or: [
        { sender: req.params.userId, recipient: req.params.otherUserId },
        { sender: req.params.otherUserId, recipient: req.params.userId }
      ]
    })
      .sort({ timestamp: 1 })
    // .limit(limit); // Set the limit based on the page number

    const unreadCount = await Message.countDocuments({ recipient: req.params.userId, isRead: false });

    await Message.updateMany({
      _id: { $in: messages.map(message => message._id) }
    }, {
      $set: { isRead: true }
    });

    res.status(200).json({
      message: 'Message history fetched successfully',
      data: messages,
      unreadCount: unreadCount
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});







// --------------------<-----------------------
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // Specify the destination folder for uploads
    cb(null, path.join(__dirname, '../../uploads'));
  },
  filename: (req, file, cb) => {
    // Generate a unique filename
    cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
  },
});

const upload = multer({ storage: storage });
const ImageFilter = (req: Request, file: Express.Multer.File, cb: FileFilterCallback): void => {
  // Check if the file is an image
  if (!file.mimetype.startsWith('image/')) {
    return cb(null, false);
  }

  cb(null, true);
};
const VideoFilter = (req: Request, file: Express.Multer.File, cb: FileFilterCallback): void => {
  // Check if the file is an image
  if (!file.mimetype.startsWith('video/')) {
    return cb(null, false);
  }

  cb(null, true);
};
const upload5mbImage = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 4 MB limit
  },
  fileFilter: ImageFilter,
});
const upload5mbVideo = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 4 MB limit
  },
  fileFilter: VideoFilter,
});

router.get('/', verify, getUser)
router.get('/all-user', getAllUsers)
router.get('/get-user-details/:username', getUserDetails)
router.put('/update', verify, updateUser)
router.post('/change-password', verify, changePasswordValidationMiddleware, changePasswordValidation, changePassword)

router.post('/update-profile-photo', verify, upload.single('profile_photo'), updateProfileImage)
router.post('/delete-profile-photo', verify, deleteProfileImage)

router.post('/add-user-images', verify, upload5mbImage.single('user_images'), uploadUserImages)
router.post('/delete-user-images/:imageName', verify, deleteUserImage)

router.post('/add-user-videos', verify, upload5mbVideo.single('user_videos'), uploadUserVideo)

router.post('/delete-user-videos/:imageName', verify, deleteUserVideo)


router.post("/create-checkout-session", verify, addPayment)

// <-------- product --------------->
// const storage = multer.diskStorage({
//     destination: (req, file, cb) => {

//       cb(null, "images");
//     },
//     filename: (req, file, cb) => {

//       cb(null, file.fieldname + "-" + Date.now() + path.extname(file.originalname));
//     },
//   });


// const upload = multer({ storage: storage });
router.post('/product/add', verify, upload.array("images"), addProduct)
router.put('/product/buy', verify, buyProduct)
router.get('/product/get', getAllProducts)

// <-------- product --------------->

// <-------- REVIEW --------------->
router.post('/review/add', verify, addReview)
router.put('/review/update/:reviewId', verify, updateReview)

// <-------- REVIEW --------------->



export default router
