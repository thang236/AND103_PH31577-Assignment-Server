const mongoose = require("mongoose");

mongoose.connect("mongodb://127.0.0.1:27017/ASM").catch((err) => {
  console.error("Lỗi kết nối CSDL\n" + err);
});

module.exports = { mongoose };
