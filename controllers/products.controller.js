const productModel = require("../models/products.model");
const fs = require("fs");

exports.list = async (req, res, next) => {
  try {
    const searchKeyword = req.query.keyword || "";
    const searchCategory = req.query.category || "";
    const sortField = req.query.sort || "name" || "price";
    const sortOrder = req.query.order === "asc" ? 1 : -1;

    let perPage = 4;
    let page = req.query.page || 1;

    const query = {};

    if (searchKeyword) {
      query.name = { $regex: searchKeyword, $options: "i" };
    }

    if (searchCategory) {
      query.cateId = searchCategory;
    }

    const products = await productModel.productModel
      .find(query)
      .skip(perPage * page - perPage)
      .limit(perPage)
      .sort({ [sortField]: sortOrder })
      .populate("cateId")
      .exec();

    const count = await productModel.productModel.countDocuments();

    const categoris = await productModel.productModel.distinct("cateId");

    let categories = await productModel.cateModel.find();
    let userInfor = req.session.userLogin;

    res.render("products/list", {
      products: products,
      categories: categories,
      categoris: categoris,
      searchKeyword: searchKeyword,
      searchCategory: searchCategory,
      sortField: sortField,
      sortOrder: sortOrder,
      userInfor: userInfor,
      current: page,
      pages: Math.ceil(count / perPage),
    });
  } catch (error) {
    console.error(error);
  }
};

//--------POST Product-------------
exports.addProduct = async (req, res, next) => {
  try {
    let categories = await productModel.cateModel.find();
    let userInfor = req.session.userLogin;

    res.render("products/add", {
      categories: categories,
      userInfor: userInfor,
    });
  } catch (err) {
    console.error(err);
  }
};

exports.postProduct = async (req, res, next) => {
  let url_image = "";
  let base64_image = "";
  let url_pdf = "";
  let base64_pdf = "";
  try {
    if (req.files["image"]) {
      const imageFile = req.files["image"][0];
      fs.renameSync(
        imageFile.path,
        "./public/uploads/" + imageFile.originalname
      );
      url_image = "/uploads/" + imageFile.originalname;
    }

    if (req.files["pdf"]) {
      const pdfFile = req.files["pdf"][0];
      fs.renameSync(pdfFile.path, "./public/uploads/" + pdfFile.originalname);
      url_pdf = "/uploads/" + pdfFile.originalname;
      // Xử lý PDF nếu cần
    }

    const newProduct = new productModel.productModel({
      name: req.body.name,
      price: req.body.price,
      desc: req.body.desc,
      image: url_image,
      pdf: url_pdf, // Cập nhật trường PDF trong model của bạn
      cateId: req.body.cateId,
    });

    await productModel.productModel.create(newProduct);
    res.redirect("/products");
  } catch (err) {
    console.error(err);
    res.status(500).send("Lỗi khi tải lên sản phẩm!");
  }
};
//---------------------------------

//--------GET Product DATA (Xem chi tiết)-------------
exports.view = async (req, res, next) => {
  try {
    const product = await productModel.productModel
      .findOne({
        _id: req.params.id,
      })
      .populate("cateId");
    let userInfor = req.session.userLogin;

    res.render("products/view", { product: product, userInfor: userInfor });
  } catch (err) {
    console.error(err);
  }
};
//---------------------------------

//--------GET Product DATA (PUT)-------------
exports.editProduct = async (req, res, next) => {
  try {
    const product = await productModel.productModel.findOne({
      _id: req.params.id,
    });
    const categories = await productModel.cateModel.find();
    let userInfor = req.session.userLogin;

    res.render("products/edit", {
      product: product,
      categories: categories,
      userInfor: userInfor,
    });
  } catch (err) {
    console.error(err);
  }
};

exports.putProduct = async (req, res, next) => {
  let url_image = "";
  let base64_image = "";

  try {
    fs.rename(
      req.file.path,
      "./public/uploads/" + req.file.originalname,
      async (err) => {
        if (err) {
          console.log(err);
        } else {
          url_image = "/uploads/" + req.file.originalname;
          var fileImage = fs.readFileSync("public" + url_image, {
            encoding: "base64",
          });
          base64_image =
            "data:image/png;base64," + fileImage.toString("base64");
          await productModel.productModel.findByIdAndUpdate(req.params.id, {
            name: req.body.name,
            price: req.body.price,
            desc: req.body.desc,
            image: base64_image,
            cateId: req.body.cateId,
          });
          await res.redirect(`/products`);
        }
      }
    );
  } catch (err) {
    console.error(err);
  }
};
//---------------------------------

//--------DELETE Product DATA-------------
exports.deleteProduct = async (req, res, next) => {
  try {
    await productModel.productModel.deleteOne({ _id: req.params.id });
    res.redirect("/products");
  } catch (err) {
    console.error(err);
  }
};

//---------------------------------

//--------Search Product Cate-------------
exports.searchCate = async (req, res, next) => {
  try {
    const cateId = req.query.cateId;
    const name = req.query.name;
    const regex = new RegExp(name, "i");
    const { sort } = req.query;
    const sortField = sort || "name";
    const sortOrder = sort === "-name" ? -1 : 1;

    let products;
    if (cateId) {
      products = await productModel.productModel
        .find({ cateId: cateId, name: regex })
        .populate("cateId");
    } else {
      products = await productModel.productModel
        .find({ name: regex })
        .populate("cateId");
    }

    let categories = await productModel.cateModel.find();
    let userInfor = req.session.userLogin;

    res.render("products/list", {
      products: products,
      categories: categories,
      userInfor: userInfor,
      sortField: sortField,
      sortOrder: sortOrder,
    });
  } catch (err) {
    console.error(err);
  }
};
//----------------------------------------
