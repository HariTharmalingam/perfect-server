"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const categorySchema = new mongoose_1.Schema({
    title: { type: String },
});
const layoutSchema = new mongoose_1.Schema({
    type: { type: String },
    categories: [categorySchema],
});
const LayoutModel = (0, mongoose_1.model)('Layout', layoutSchema);
exports.default = LayoutModel;
