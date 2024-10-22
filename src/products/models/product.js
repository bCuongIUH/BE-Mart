// const mongoose = require('mongoose');

// const ProductSchema = new mongoose.Schema({
//     code: { type: String, unique: true },
//     barcode: { type: String, unique: true },
//     name: { type: String, required: true , unique : true},
//     description: { type: String, required: true },
//     // image: { type: String, required: true },
//     category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: true },
//     quantity: { type: Number, default: 0 },
//     isAvailable: { type: Boolean, default: false },
//     currentPrice: { type: Number, default: 0 },
    
//     supplier: { type: mongoose.Schema.Types.ObjectId, ref: 'Supplier', required: true },

//     units: [
//       {
//           unitLine: { type: mongoose.Schema.Types.ObjectId, ref: 'UnitLine', required: true },
//           details: [{ type: mongoose.Schema.Types.ObjectId, ref: 'UnitDetail' }] // Tham chiếu đến các chi tiết đơn vị
//       }
//   ]
      
 
    
// }, { timestamps: true });

// const Product = mongoose.model('Products', ProductSchema);

// module.exports = Product;
const mongoose = require('mongoose');

const ProductSchema = new mongoose.Schema({
    code: { type: String, unique: true },
    barcode: { type: String, unique: true },
    name: { type: String, required: true, unique: true },
    description: { type: String, required: true },
    category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: true },
    quantity: { type: Number, default: 0 },
    isAvailable: { type: Boolean, default: false },
    
    // Đây là cách lưu giá cho từng đơn vị
    units: [
        {
            unitLine: { type: mongoose.Schema.Types.ObjectId, ref: 'UnitLine', required: true },
            details: [
                {
                    unitId: { type: mongoose.Schema.Types.ObjectId, ref: 'UnitDetail', required: true }, // ID chi tiết đơn vị
                    price: { type: Number, required: true } // Giá cho từng đơn vị
                }
            ]
        }
    ]
}, { timestamps: true });

const Product = mongoose.model('Products', ProductSchema);

module.exports = Product;
