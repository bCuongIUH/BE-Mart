const axios = require('axios');
const CryptoJS = require('crypto-js');
const moment = require('moment');
const qs = require('qs');

// APP CONFIG
const config = {
  app_id: '2554',
  key1: 'sdngKKJmqEMzvh5QQcdD2A9XBSKUNaYn',
  key2: 'trMrHtvjo6myautxDUiAcYsVtaeQ8nhf',
  endpoint: 'https://sb-openapi.zalopay.vn/v2/create',
};

// Tạo đơn hàng ZaloPay
exports.createPayment = async (req, res) => {
  const embed_data = {
    redirecturl: 'https://phongthuytaman.com',
  };
  const items = [];
  const transID = Math.floor(Math.random() * 1000000);

  const order = {
    app_id: config.app_id,
    app_trans_id: `${moment().format('YYMMDD')}_${transID}`,
    app_user: 'user123',
    app_time: Date.now(),
    item: JSON.stringify(items),
    embed_data: JSON.stringify(embed_data),
    amount: 50000,
    callback_url: ' https://df3e-2402-800-63ba-abf7-61ef-47c8-7611-162.ngrok-free.app/callback',
    description: `Lazada - Payment for the order #${transID}`,
    bank_code: '',
  };

  const data = `${config.app_id}|${order.app_trans_id}|${order.app_user}|${order.amount}|${order.app_time}|${order.embed_data}|${order.item}`;
  order.mac = CryptoJS.HmacSHA256(data, config.key1).toString();

  try {
    const result = await axios.post(config.endpoint, null, { params: order });
    return res.status(200).json(result.data);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: 'Error creating payment', error: error.message });
  }
};

// Callback xử lý thanh toán
exports.callback = (req, res) => {
  let result = {};
  try {
    let dataStr = req.body.data;
    let reqMac = req.body.mac;

    let mac = CryptoJS.HmacSHA256(dataStr, config.key2).toString();
    console.log('mac =', mac);

    if (reqMac !== mac) {
      result.return_code = -1;
      result.return_message = 'mac not equal';
    } else {
      let dataJson = JSON.parse(dataStr, config.key2);
      console.log("update order's status = success where app_trans_id =", dataJson['app_trans_id']);
      result.return_code = 1;
      result.return_message = 'success';
    }
  } catch (ex) {
    console.log('Error:', ex.message);
    result.return_code = 0;
    result.return_message = ex.message;
  }
  res.json(result);
};

// Kiểm tra trạng thái đơn hàng
exports.checkOrderStatus = async (req, res) => {
  const { app_trans_id } = req.body;

  let postData = {
    app_id: config.app_id,
    app_trans_id,
  };

  let data = `${postData.app_id}|${postData.app_trans_id}|${config.key1}`;
  postData.mac = CryptoJS.HmacSHA256(data, config.key1).toString();

  let postConfig = {
    method: 'post',
    url: 'https://sb-openapi.zalopay.vn/v2/query',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    data: qs.stringify(postData),
  };

  try {
    const result = await axios(postConfig);
    return res.status(200).json(result.data);
  } catch (error) {
    console.log('Error checking order status:', error);
    res.status(500).json({ message: 'Error checking order status', error: error.message });
  }
};
