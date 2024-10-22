const UnitHeader = require('../models/UnitHeader');
const UnitLine = require('../models/UnitLine');
const UnitDetail = require('../models/UnitDetail');
const Category = require('../../products/models/category');
const Product = require('../../products/models/product');


exports.createUnitHeader = async (req, res) => {
  try {
    const { name, description, status } = req.body;

    const newHeader = new UnitHeader({
      name,
      description,
      status: status || true, 
    });

    await newHeader.save();
    res.status(201).json({ message: 'Tạo nhóm đơn vị tính thành công', header: newHeader });
  } catch (error) {
    console.error('Lỗi khi tạo nhóm đơn vị:', error);
    res.status(500).json({ message: 'Lỗi máy chủ', error: error.message });
  }
};


exports.createUnitLine = async (req, res) => {
    try {
      const { headerId, name, description } = req.body;
  
      const header = await UnitHeader.findById(headerId);
      if (!header) {
        return res.status(400).json({ message: 'Nhóm đơn vị không hợp lệ' });
      }
  
      const newLine = new UnitLine({
        header: headerId,
        name,
        description,
      });
  
      await newLine.save();
      res.status(201).json({ message: 'Tạo dòng đơn vị thành công', line: newLine });
    } catch (error) {
      console.error('Lỗi khi tạo dòng đơn vị:', error);
      res.status(500).json({ message: 'Lỗi máy chủ', error: error.message });
    }
  };



  exports.createUnitDetail = async (req, res) => {
    try {
        const { lineId, name, value } = req.body;

        const line = await UnitLine.findById(lineId);
        if (!line) {
            return res.status(400).json({ message: 'Dòng đơn vị không hợp lệ' });
        }

        const newDetail = new UnitDetail({
            unitLine: lineId, 
            name,
            value,
        });

        await newDetail.save();

        // Cập nhật dòng đơn vị để thêm chi tiết mới vào trường details
        line.details.push(newDetail._id);
        await line.save();

        res.status(201).json({ message: 'Tạo chi tiết đơn vị thành công', detail: newDetail });
    } catch (error) {
        console.error('Lỗi khi tạo chi tiết đơn vị:', error);
        res.status(500).json({ message: 'Lỗi máy chủ', error: error.message });
    }
};

 