
//调用渠道init方法
function callChannelInit(params) {
    var WhaleProductCode = params.productCode;
    var WhaleProductKeu = params.productKey;
    var debug = params.debug;
    var channelGameKey = getChannelParams('gameKey');
    skymoonsLib.init(channelGameKey, debug);
}

//需返回{'status':true,'data':{'uid':'123','username':'123321','token':'123','message':'','channelCode':32}} 格式的对象
function callChannelLogin() {
    //创建正确的回调对象格式
    var returnObject = new Object();
    var userData = new Object();
    userData.uid = '';
    userData.username = '';
    userData.token = '';
    skymoonsLib.login(function(res) {
        //创建正确的回调对象格式
        var returnObject = new Object();
        var userData = new Object();
        userData.uid = '';
        userData.username = '';
        userData.token = '';

        //判断渠道的返回格式		
        returnObject.status = false;
        returnObject.message = '';
        returnObject.channelCode = channelCode;

        if (res != null && typeof(res) == 'object' && res.hasOwnProperty('data') && typeof(res.data) == 'object' && res.data.hasOwnProperty('data') && typeof(res.data.data) == 'object' && res.data.data.hasOwnProperty('userData')) {

            returnObject.status = res.status;
            userData.uid = res.data.data.userData.uid;
            userData.username = res.data.data.userData.username;
            returnObject.data = userData;
        } else {
            returnObject.status = false;
            returnObject.message = '返回数据格式错误';
        }


        if (userData.uid == '') {
            returnObject.status = false;
        }

        if (returnObject.status == false && typeof(res) == 'object' && res.hasOwnProperty('message')) {
            returnObject.message = res.message;
        }

        var messageObject = new Object();
        messageObject.func = 'Notify_Whale_Login';
        messageObject.params = returnObject;
        document.getElementById('gameFrame').contentWindow.postMessage(JSON.stringify(messageObject), '*');
    });
}

function callToggleMenu(status) {
    skymoonsLib.toggleModalMenu(status);
}

//调用渠道支付方法
function callChannelPay(sOrderInfo) {

    var orderInfo = new Object();
    orderInfo.productCode = getChannelParams('productCode');
    orderInfo.uid = sOrderInfo.uid;
    orderInfo.userRoleId = sOrderInfo.userRoleId;
    orderInfo.userRoleName = sOrderInfo.userRoleName;
    orderInfo.userServer = sOrderInfo.userServer;
    orderInfo.userLevel = sOrderInfo.userLevel;
    orderInfo.cpOrderNo = sOrderInfo.orderNo;
    orderInfo.amount = sOrderInfo.amount;
    orderInfo.subject = sOrderInfo.subject;
    orderInfo.desc = sOrderInfo.desc;
    //orderInfo.callbackUrl = sOrderInfo.callbackUrl;
    orderInfo.extrasParams = sOrderInfo.extrasParams;
    orderInfo.goodsId = sOrderInfo.goodsId;

    var orderInfoJson = JSON.stringify(orderInfo);

    skymoonsLib.pay(orderInfoJson, function(payObject) {
        var messageObject = new Object();
        messageObject.func = 'Notify_Whale_payStatus';
        messageObject.params = payObject;
        document.getElementById('gameFrame').contentWindow.postMessage(JSON.stringify(messageObject), '*');
    });
}

function callUploadRole(sRoleInfo) {
    skymoonsLib.uploadGameRoleInfo(sRoleInfo);
}

function callChannelLogout() {
    var returnObject = new Object();
    returnObject.status = true;
    returnObject.message = '退出成功';

    skymoonsLib.logOut(function(res) {
        var messageObject = new Object();
        messageObject.func = 'Notify_Whale_Logout';
        messageObject.params = returnObject;
        document.getElementById('gameFrame').contentWindow.postMessage(JSON.stringify(messageObject), '*');
    })
}

function getChannelParams(keyName) {
    var keyTrueName = 'client_' + keyName;
    if (channelParams.hasOwnProperty(keyTrueName)) {
        return channelParams[keyTrueName];
    }
    return '';
}

function callChannelGetUserInfo() {
    var returnObject = new Object();
    var userInfo = new Object();
    userInfo = userData;
    returnObject.status = true;
    returnObject.data = userInfo;

    var messageObject = new Object();
    messageObject.func = 'Notify_Whale_GetUserInfo';
    messageObject.params = returnObject;
    document.getElementById('gameFrame').contentWindow.postMessage(JSON.stringify(messageObject), '*');
}

window.addEventListener('message', function(e) {

    var messageData = e.data;
    try {
        var messageObject = JSON.parse(messageData);
    } catch (e) {
        var messageObject = null;
    }
    if (messageObject == null || typeof(messageObject) != 'object' || !messageObject.hasOwnProperty('func')) {
        return;
    }
    var funcName = messageObject.func;
    switch (funcName) {
        case 'Event_Whale_Init':
            callChannelInit(messageObject.params);
            setLog('调用渠道SDK初始化接口', 0);
            break;

        case 'Event_Whale_Pay':
            var orderInfo = messageObject.params;
            callChannelPay(orderInfo);
            break;

        case 'Event_Whale_Login':
            callChannelLogin();
            break;

        case 'Event_Whale_GetUserInfo':
            callChannelGetUserInfo();
            break;

        case 'Event_Whale_Logout':
            callChannelLogout();
            break;

        case 'Event_Whale_uploadRole':
            var roleInfo = messageObject.params;
            callUploadRole(roleInfo);
            break;

        case 'Event_Whale_ToggleMenu':
            var status = messageObject.params;
            callToggleMenu(status);
            break;
    }
}, false);
