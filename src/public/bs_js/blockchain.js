SmartApp = (function (SmartApp, $, window) {
    "use strict";

    var $win		= $(window);
    
    let _des = "gwei"; //Des = 18
	//let _des = "gwei"; //Des = 9

	
	
	
	const Web3Modal = window.Web3Modal.default;
	const WalletConnectProvider = window.WalletConnectProvider.default;
	const Fortmatic = window.Fortmatic;
	const evmChains = window.evmChains;
	
    SmartApp.Blockchain = {};
    SmartApp.Blockchain.loginWallet = null;
    SmartApp.Blockchain.isConnect = false;
    SmartApp.Blockchain.provider = false;
    SmartApp.Blockchain.web3os = false;
    SmartApp.Blockchain.web3Modal = false;
    SmartApp.Blockchain.Wallet = null;
    SmartApp.Blockchain.ApiURL = "https://api.expressiq.co/";
    SmartApp.Blockchain.SocketURL = "https://ws.expressiq.co/";
    SmartApp.Blockchain.loadContract = async function(address, abi) {
    		if(SmartApp.Blockchain.isConnect == false){
    			await SmartApp.Blockchain.init();
    			await SmartApp.Blockchain.login_wallet();
    		}
		    let contract =   new SmartApp.Blockchain.web3os.eth.Contract(abi, address, {from:SmartApp.Blockchain.Wallet})
		    return contract;
    };

    SmartApp.Blockchain.getLoginWallet = async () => {
    	if(SmartApp.Blockchain.isConnect == false){
			await SmartApp.Blockchain.init();
			await SmartApp.Blockchain.login_wallet();
		}
		return SmartApp.Blockchain.Wallet;
    }

    SmartApp.Blockchain.login_wallet = async () => {
    		//await SmartApp.Blockchain.connect();
			//let networkId = await web3os.eth.net.getId();
			if(SmartApp.Blockchain.Wallet != null) return SmartApp.Blockchain.Wallet;
			
			const accounts = await SmartApp.Blockchain.web3os.eth.getAccounts();
			//console.log(accounts.length);
			//let loginWallet = null;
			if(accounts.length == 0 && SmartApp.Blockchain.Wallet == null){
				//this.web3.eth.enable();
				//await ethereum.enable();
				
				SmartApp.Blockchain.isConnect = false;
				return;
			}else{
				SmartApp.Blockchain.Wallet = SmartApp.Blockchain.web3os.utils.toChecksumAddress(accounts[0]);

				window.isConnect = true;
				if($("#btn-connect").length > 0) $("#btn-connect").parent().html('<a class="btn btn-md btn-round btn-outline btn-auto btn-primary btn-with-icon walletLimit" id="btn-disconnect"><span id="walletAddress">'+SmartApp.Blockchain.Wallet+'</span> <em class="icon  ti ti-lock"></em></a>');
				if($("#btn-disconnect").length > 0){
					document.querySelector("#btn-disconnect").addEventListener("click", async function(){
						await SmartApp.Blockchain.disconnect();

					});
				}
			}
			
			if(SmartApp.Blockchain.Wallet == undefined) {
				console.log("NULL Login");
				return false;
			}
			//window.loginWallet = loginWallet;
			return SmartApp.Blockchain.Wallet;
		};
	SmartApp.Blockchain.keccak256 = (data) => {
    	return SmartApp.Blockchain.web3os.utils.keccak256(data);
    };

    SmartApp.Blockchain.setReportUrl = async (url,obj)=>{
    	await axios.get(SmartApp.Blockchain.ApiURL + url,{token : "59e78438-fe00-41f3-97b8-37b13073d1e3"}).then((data) => {

            console.log(data);
        });
    	return true;
    }

    SmartApp.Blockchain.Socket = async () => {
    	var socket = io.connect(SmartApp.Blockchain.SocketURL, {transports : ['polling'],reconnect: true});
    	//var socket = io.connect('http://127.0.0.1:7000', {transports : ['polling'],reconnect: true});
    	return socket;
    }

    SmartApp.Blockchain.toWei = (amount) => {
    	var numBer = SmartApp.Blockchain.web3os.utils.toWei(amount.toString(),_des);
    	return numBer;
    }
    SmartApp.Blockchain.fromWei = (amount) => {
    	var numBer = SmartApp.Blockchain.web3os.utils.fromWei(amount.toString(),_des);
    	return numBer;
    }
    
    SmartApp.Blockchain.getGasPrice = async() => {
    	var numBer = await SmartApp.Blockchain.web3os.eth.getGasPrice();
    	return numBer;
    }
    SmartApp.Blockchain.estimateGas = async(obj) => {
    	var numBer = await SmartApp.Blockchain.web3os.eth.estimateGas(obj);
    	return numBer;
    }
	SmartApp.Blockchain.disconnect = async () => {
			
			console.log("Killing the wallet connection", SmartApp.Blockchain.provider);

			  // TODO: Which providers have close method?
			  //if(provider.close) {
			    //await provider.close();

			    // If the cached provider is not cleared,
			    // WalletConnect will default to the existing session
			    // and does not allow to re-scan the QR code with a new wallet.
			    // Depending on your use case you may want or want not his behavir.
			    await SmartApp.Blockchain.web3Modal.clearCachedProvider();
			    if($("#btn-disconnect").length > 0) $("#btn-disconnect").parent().html('<a class="btn btn-md btn-round btn-outline btn-auto btn-primary btn-with-icon walletLimit" id="btn-connect"><span id="walletAddress">Connect</span> <em class="icon  ti ti-lock"></em></a>');
			    SmartApp.Blockchain.provider = null;
			    window.location.reload();
			  //}
		};


    SmartApp.Blockchain.notify = function(msg){
	        $('.toast').find(".toast-body").html(msg);
	        $('.toast').addClass("toast-error");
	        $('.toast').toast('show');
	        $("body #notifyWait").remove();
	    };
	SmartApp.Blockchain.notifyWait = function(msg){
			$("body #notifyWait").remove();
	        $("body").append('<div id="notifyWait"><div class="preloader"><span class="spinner spinner-round"></span></div></div>');
	    };
	
	SmartApp.Blockchain.addToken = async (TokenAddress, tokenSymbol, tokenDecimals, tokenImage) => {
			
		    await web3os.givenProvider.sendAsync({
		        method: 'metamask_watchAsset',
		        params: {
		          type: 'ERC20', // Initially only supports ERC20, but eventually more!
		          options: {
		            address: TokenAddress, // The address that the token is at.
		            symbol: tokenSymbol, // A ticker symbol or shorthand, up to 5 chars.
		            decimals: tokenDecimals, // The number of decimals in the token
		            image: tokenImage, // A string url of the token logo
		          },
		        },
		    });
		};
	
    SmartApp.Blockchain.init = async () => {
    	//BlockchainCom = SmartApp.Blockchain;
    	//SmartApp.Blockchain.login_wallet();
    	
    	if(SmartApp.Blockchain.isConnect == true) return false;

		  // Tell Web3modal what providers we have available.
		  // Built-in web browser provider (only one can exist as a time)
		  // like MetaMask, Brave or Opera is added automatically by Web3modal
		 const providerOptions = {
		    walletconnect: {
		      package: WalletConnectProvider,
		      options: {
		        // Mikko's test key - don't copy as your mileage may vary
		        infuraId: "669981d1b5994165bcaedcc5cd1f6da4",
		      }
		    },

		    fortmatic: {
		      package: Fortmatic,
		      options: {
		        // Mikko's TESTNET api key
		        key: "pk_test_391E26A3B43A3350"
		      }
		    }
		  };

		SmartApp.Blockchain.web3Modal = new Web3Modal({
		    cacheProvider: true, // optional
		    providerOptions, // required
		    disableInjectedProvider: false, // optional. For MetaMask / Brave / Opera.
		    theme: {
			    background: "rgb(39, 49, 56)",
			    main: "rgb(199, 199, 199)",
			    secondary: "rgb(136, 136, 136)",
			    border: "rgba(195, 195, 195, 0.14)",
			    hover: "rgb(16, 26, 32)"
			  }
		  });
		//web3os = new Web3(web3Modal);
		
  		
		if($("#btn-connect").length > 0 && SmartApp.Blockchain.isConnect == false){
			document.querySelector("#btn-connect").addEventListener("click", async function(){
				SmartApp.Blockchain.provider = await SmartApp.Blockchain.web3Modal.connect();
			    SmartApp.Blockchain.web3os = new Web3(SmartApp.Blockchain.provider);
			    await SmartApp.Blockchain.login_wallet();
			});
		}else{
			try {
			    SmartApp.Blockchain.provider = await SmartApp.Blockchain.web3Modal.connect();
			    SmartApp.Blockchain.web3os = new Web3(SmartApp.Blockchain.provider);
			    await SmartApp.Blockchain.login_wallet();
			  } catch(e) {
			    console.log("Could not get a wallet connection", e);
			    //SmartApp.Blockchain.notify("Could not get a wallet connection");
			    return;
			  }

		}
		if(SmartApp.Blockchain.web3Modal.cachedProvider){
			SmartApp.Blockchain.provider = await SmartApp.Blockchain.web3Modal.connect();
		    SmartApp.Blockchain.web3os = new Web3(SmartApp.Blockchain.provider);	
			await SmartApp.Blockchain.login_wallet();
		}

		if(SmartApp.Blockchain.isConnect == true){
			SmartApp.Blockchain.provider.on("accountsChanged", (accounts) => {
				  
			  window.location.reload();
			});

			// Subscribe to chainId change
			SmartApp.Blockchain.provider.on("chainChanged", (chainId) => {
			  
			  if(chainId != 56){
			  		SmartApp.Blockchain.notify("Plz select BSC Network mainnet");
			  }
			  //window.location.reload();
			});

			// Subscribe to provider connection
			SmartApp.Blockchain.provider.on("connect", (info) => {
			  console.log("Connect ",info);
			});

			// Subscribe to provider disconnection
			SmartApp.Blockchain.provider.on("disconnect", (error) => {
			  
			  SmartApp.Blockchain.disconnect();
			  window.location.reload();
			});
			SmartApp.Blockchain.provider.on("receipt", (error) => {
				console.log("receipt", error);
			});
		}
		

    }
    SmartApp.components.winLoad.push(SmartApp.Blockchain.init);
 	return SmartApp;
})(SmartApp, jQuery, window);
