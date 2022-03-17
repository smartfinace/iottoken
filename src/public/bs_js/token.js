SmartApp = (function (SmartApp, $, window) {
    "use strict";
    let GAS = 21000; 
    var blockchain = SmartApp.Blockchain;
    var login_wallet;
    let TokenAddress = "{token_address}";
    let Abi = JSON.parse({token_abi});
    var TokenContact;

    SmartApp.Token = {};
    SmartApp.Token.Balance = 0;
    SmartApp.Token.loadContracts = async () => {

            var contractLoader = await blockchain.loadContract(TokenAddress,Abi);
            TokenContact = contractLoader.methods;
            login_wallet = await blockchain.getLoginWallet();
            return true;
    }
    
    SmartApp.Token.getBalance = async () =>{
        return SmartApp.Token.Balance;
    };
    SmartApp.Token.getContractAddress = () =>{
        return TokenAddress;
    };
    SmartApp.Token.setAccess = async (address, amount, callback) => {
        let checkAccess = await TokenContact.allowance(login_wallet,address).call();
        console.log("get access : ",amount*1.2," ",checkAccess);
        if(checkAccess < amount*1.2){
            let data = await TokenContact.approve(address, amount*1.2).send();
            console.log(data);
        }
        
        return false;
    }

    SmartApp.Token.init = async () => {
        await blockchain.init();
        if(SmartApp.Blockchain.isConnect == false) return;
        await SmartApp.Token.loadContracts();
        const balance = await TokenContact.balanceOf(login_wallet).call();
        SmartApp.Token.Balance = SmartApp.Blockchain.fromWei(balance);
        $(".balance").html(SmartApp.Token.Balance);
    }
    SmartApp.components.docReady.push(SmartApp.Token.init);
    return SmartApp;
})(SmartApp, jQuery, window);