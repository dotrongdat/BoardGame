export const productOrderStatus = {
	WAITING_CONFIRM: 0,
	CONFIRMED: 1,
	WAITING_PICKUP: 2,
	PICK_UP: 3,
	DELIVERING: 4,
	COMPLETE_DELIVERY: 5,
	CANCEL_BY_CUSTOMER: 6,
	CANCEL_BY_STORE: 7,
	WAITING_REFUND: 8,
	COMPLETE_REFUND: 9,
}
export const orderStatus = {
	WAITING_CONFIRM: 0,
	CONFIRMED: 1,
	WAITING_PICKUP: 2,
	PICK_UP: 3,
	DELIVERING: 4,
	COMPLETE_DELIVERY: 5,
	CANCEL_BY_CUSTOMER: 6,
	CANCEL_BY_STORE: 7,
	WAITING_REFUND: 8,
	COMPLETE_REFUND: 9,
}
export const paymentMethodType = {
	COD: 1,
	PAYPAL: 2,
	VNPAY: 3,
}
export const vnp_TmnCode = 'FCVWPDR0'
export const vnp_HashSecret = 'UCLOAJMWLJDPSFQLDJWTLFFGXXISMTPI'
export const vnp_Url = 'https://sandbox.vnpayment.vn/paymentv2/vpcpay.html'
export const vnp_Url_config = {
	vnp_Version: '2.1.0',
	vnp_Command: 'pay',
	vnp_TmnCode,
	vnp_ReturnUrl: 'http://localhost:3000/checkout',
	vnp_HashSecret,
	vnp_CurrCode: 'VND',
	vnp_Locale: 'vn',
	vnp_OrderInfo: 'Thanh toan don hang',
	vnp_OrderType: '270000',
}
export const vnp_ResponseCode = {
	success: '00',
	successDeductMoney: '07',
	nonSuccess_nonInternetBanking: '09',
	nonSuccess_exceededVerifyFailAllowTurn: '10',
	nonSuccess_sessionTimeOut: '11',
	nonSuccess_lockAccount: '12',
	nonSuccess_wrongOTP: '13',
	nonSuccess_cancelTransaction: '24',
	nonSuccess_notEnoughBalance: '51',
	nonSuccess_transactionExceeded: '65',
	nonSuccess_maintaining: '75',
	nonSuccess_exceededPasswordFailAllowTurn: '79',
	other: '99',
}

export const mailHtml =
	'<h4>Xin chào bạn,</h4>' +
	'<h4>Cảm ơn bạn rất nhiều vì đã tin tưởng và lựa chọn sản phẩm của <strong>Hunter</strong>.' +
	" Bạn hãy xác nhận đơn hàng của mình bằng cách trả lời <a href='#'>“Xác nhận”</a> qua email này và đợi Hunter đem sản phẩm đến cho mình nhé.</h4>" +
	'<h4> Bất cứ khi nào cần hỗ trợ bạn đừng ngần ngại mà hãy liên hệ ngay với Hunter qua số điện thoại <strong> 0939240054 </strong> nhé.</h4>' +
	'<h4>Chúc bạn một ngày tốt lành.</h4>' +
	'<h2>Hunter Shop</h2>'
