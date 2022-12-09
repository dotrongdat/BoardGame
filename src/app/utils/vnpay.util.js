import querystring from 'qs';
import dateFormat from 'date-format';
import crypto from 'crypto';
import {vnp_Url_config, vnp_Url} from '../../constants/order.constant.js';

function sortObject(obj) {
	var sorted = {};
	var str = [];
	var key;
	for (key in obj){
		if (obj.hasOwnProperty(key)) {
		str.push(encodeURIComponent(key));
		}
	}
	str.sort();
    for (key = 0; key < str.length; key++) {
        sorted[str[key]] = encodeURIComponent(obj[str[key]]).replace(/%20/g, "+");
    }
    return sorted;
}
export const createVNPayUrl = ({amount,ipAddr, orderCode}) => {
    let date = new Date();
    let createDate = dateFormat('yyyymmddHHmmss',date);
    
    const {vnp_Command,vnp_CurrCode,vnp_HashSecret,vnp_Locale,vnp_OrderInfo,vnp_OrderType,vnp_ReturnUrl,vnp_TmnCode,vnp_Version} = vnp_Url_config;
    let vnpUrl = vnp_Url;
    var vnp_Params = {};

    vnp_Params['vnp_Version'] = vnp_Version;
    vnp_Params['vnp_Command'] = vnp_Command;
    vnp_Params['vnp_TmnCode'] = vnp_TmnCode;
    vnp_Params['vnp_Locale'] = vnp_Locale;
    vnp_Params['vnp_CurrCode'] = vnp_CurrCode;
    vnp_Params['vnp_TxnRef'] = orderCode;
    vnp_Params['vnp_OrderInfo'] = vnp_OrderInfo;
    vnp_Params['vnp_OrderType'] = vnp_OrderType;
    vnp_Params['vnp_Amount'] = amount * 100;
    vnp_Params['vnp_ReturnUrl'] = vnp_ReturnUrl;
    vnp_Params['vnp_IpAddr'] = ipAddr;
    vnp_Params['vnp_CreateDate'] = createDate;


    vnp_Params = sortObject(vnp_Params);

    var signData = querystring.stringify(vnp_Params, { encode: false });   
    var hmac = crypto.createHmac("sha512", vnp_HashSecret);
    var signed = hmac.update(new Buffer(signData, 'utf-8')).digest("hex"); 
    vnp_Params['vnp_SecureHash'] = signed;
    vnpUrl += '?' + querystring.stringify(vnp_Params, { encode: false });
    return vnpUrl;
}

export const checkValidUrlReturn = (params) => {
    var vnp_Params = params;

    var secureHash = vnp_Params['vnp_SecureHash'];

    delete vnp_Params['vnp_SecureHash'];
    delete vnp_Params['vnp_SecureHashType'];

    vnp_Params = sortObject(vnp_Params);

    const {vnp_HashSecret} = vnp_Url_config;
    var signData = querystring.stringify(vnp_Params, { encode: false });   
    var hmac = crypto.createHmac("sha512", vnp_HashSecret);
    var signed = hmac.update(new Buffer(signData, 'utf-8')).digest("hex");     

    return secureHash === signed;
}