var express = require("express");
var router = express.Router();
var productsController = require("../controllers/products.controller");
var checkLogin = require("../middleware/checkLogin");
var multer = require("multer");

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./public/uploads/");
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname);
  },
});

const fileFilter = (req, file, cb) => {
  if (
    file.mimetype === "image/jpeg" ||
    file.mimetype === "image/png" ||
    file.mimetype === "application/pdf"
  ) {
    cb(null, true);
  } else {
    cb(null, false);
  }
};

const uploader = multer({
  storage: storage,
  fileFilter: fileFilter,
  dest: "/tmp",
});

router.get("/", checkLogin.requireLogin, productsController.list);
// router.get("/search", checkLogin.requireLogin, productsController.searchCate);

router.get("/add", checkLogin.requireLogin, productsController.addProduct);
router.post(
  "/add",
  checkLogin.requireLogin,
  uploader.fields([
    { name: "image", maxCount: 1 },
    { name: "pdf", maxCount: 1 },
  ]),
  productsController.postProduct
);

router.get("/view/:id", checkLogin.requireLogin, productsController.view);

router.get(
  "/edit/:id",
  checkLogin.requireLogin,
  productsController.editProduct
);
router.put(
  "/edit/:id",
  checkLogin.requireLogin,
  uploader.single("image"),
  productsController.putProduct
);

router.delete(
  "/edit/:id",
  checkLogin.requireLogin,
  productsController.deleteProduct
);

module.exports = router;
