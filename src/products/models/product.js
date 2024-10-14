const mongoose = require('mongoose');


const ProductSchema = new mongoose.Schema({
    code: { type: String, unique: true },
    barcode: { type: String, unique: true },
    name: { type: String, required: true },
    description: { type: String, required: true },
    image: { type: String, required: true },
    category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: true },
    quantity: { type: Number, default: 0 },
    price: { type: Number, required: true }, 
    isAvailable: { type: Boolean, default: true }, 

    lines: [{
        supplierId: { type: mongoose.Schema.Types.ObjectId, ref: 'Supplier', required: true },
        quantity: { type: Number, required: true, default: 0 },
        //unitPrice: { type: Number, required: true },
        //totalPrice: { type: Number, required: true },
        isAvailable: { type: Boolean, default: false },
        startDate: { type: Date, default: Date.now },
        endDate: { type: Date }
    }]
}, { timestamps: true });


// const Product = mongoose.model('Product', ProductSchema);
// module.exports = Product;
const Product = mongoose.model('Products', ProductSchema);

module.exports = Product;