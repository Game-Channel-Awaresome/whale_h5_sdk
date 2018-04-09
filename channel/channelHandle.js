
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
    skymoonsLib.login(function(res) {

        //加上渠道编号
        res.channelCode = channelCode;
        var messageObject ={
            func:'Notify_Login',
            params:res
        };
        document.getElementById('gameFrame').contentWindow.postMessage(JSON.stringify(messageObject), '*');
    });
}

function callToggleMenu(status) {
    skymoonsLib.toggleModalMenu(status);
}

function callChannelPay(sOrderInfo) {
    skymoonsLib.pay(JSON.stringify(sOrderInfo), function(payObject) {
        var messageObject = new Object();
        messageObject.func = 'Notify_payStatus';
        messageObject.params = payObject;
        document.getElementById('gameFrame').contentWindow.postMessage(JSON.stringify(messageObject), '*');
    });
}

function callUploadRole(sRoleInfo) {
    skymoonsLib.uploadGameRoleInfo(sRoleInfo);
}

function callChannelLogout() {
    skymoonsLib.logOut(function(res) {
        var messageObject = new Object();
        messageObject.func = 'Notify_Logout';
        messageObject.params = { status:true, message:'退出成功' };
        document.getElementById('gameFrame').contentWindow.postMessage(JSON.stringify(messageObject), '*');
    })
}

function callChannelGetUserInfo() {
    var messageObject = new Object();
    messageObject.func = 'Notify_GetUserInfo';
    messageObject.params = {
        status:true,
        data:userData
    };
    document.getElementById('gameFrame').contentWindow.postMessage(JSON.stringify(messageObject), '*');
}

function getChannelParams(keyName) {
    var keyTrueName = 'client_' + keyName;
    if (channelParams.hasOwnProperty(keyTrueName)) {
        return channelParams[keyTrueName];
    }
    return '';
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
        case 'Event_Init':
            callChannelInit(messageObject.params);
            setLog('渠道初始化', 2);
            break;

        case 'Event_Pay':
            var orderInfo = messageObject.params;
            callChannelPay(orderInfo);
            break;

        case 'Event_Login':
            callChannelLogin();
            break;

        case 'Event_GetUserInfo':
            callChannelGetUserInfo();
            break;

        case 'Event_Logout':
            callChannelLogout();
            break;

        case 'Event_uploadRole':
            var roleInfo = messageObject.params;
            callUploadRole(roleInfo);
            break;

        case 'Event_ToggleMenu':
            var status = messageObject.params;
            callToggleMenu(status);
            break;
    }
}, false);
