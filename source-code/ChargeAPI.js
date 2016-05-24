(
function(window){
	'use strict'
	function DefineChargeAPI(){
		var ChargeAPI={};
		var mainAppKey='';
		var user='';
		var account='';
		var serverUrl="http://services-demo.ezetap.com/charge_api/v1";

		ChargeAPI.initialize=function(appKey,accountId,userName, fn){
			mainAppKey = appKey;
			account = accountId;
			user = userName;
			if(!appKey || !accountId || !userName){
				var response = {
				    "status": "failure",
				    "error": {
				        "code": "400",
				        "message": "Initialize failed"
				    }
				}
			}else{
				var response = {
				    "status": "success",
				}
			}
			if(fn) fn(response);
		}

		ChargeAPI.viewCharge=function(chargeId,fn){
			var chargeUri="/charges/"+chargeId;
			try{
				doGetCall(serverUrl+chargeUri,function(response){
					if(fn) fn(response);
				});
			}catch(e){
				console.log(e);
			}
		}
			
		ChargeAPI.createCharge=function(chargeObj,fn){
			var createChargeUri="/charges/"
			try{
				chargeObj.accountId=account;
				doPostCall(chargeObj,serverUrl+createChargeUri,function(response){
					if(fn) fn(response);
				});
			}catch(e){
				console.log(e);
			}
		}

		ChargeAPI.walletTransaction=function(walletProvider,charge, chargeId,fn){ 
			try{
				var walletUri="/remotePay/walletTransaction";
				var callWalletTransaction = function(chargeid){
					var walletData={
							"chargeId":chargeid,
							"walletProvider":walletProvider,
							"username":user
						};
					doPostCall(walletData,serverUrl+walletUri,function(response){
						if(response.status == "SUCCESS"){
							var resObj = {
							    "status": "SUCCESS",
							    "result": {
							        "currentTxnId": response.result.txnId,
							        "chargeId": chargeId
							    }
							}
							fn(resObj);
						}else{
							fn(response);
						}
						
					})
				}

				if(chargeId){
					callWalletTransaction(chargeId);
				}else if(!chargeId){
					ChargeAPI.createCharge(charge,function(response){
						if(response.status=='SUCCESS'){
							var newChargeId=response.result.id;
							callWalletTransaction(newChargeId);
						}else{
							fn(response);
						}
					})
				}
				
			}catch(e){
				console.log(e);
			}
		}

		ChargeAPI.confirmWalletTransaction=function(txnId,walletOTP,fn){
			try{
				var confirmOTPUri = "/remotePay/confirmWalletTransaction";
				var data={
					"txnId":txnId,
					"walletOTP": walletOTP
				};
				doPostCall(data,serverUrl+confirmOTPUri,function(response){

					if(response && response.status == "SUCCESS"){
						var currentTxn = response.result.currentTransaction;
						var resObj = {
						    "status": "SUCCESS",
						    "result": {
						        "currentTxn": {
						            "txnId": currentTxn.txnId,
						            "txnDate": currentTxn.transactionDate,
						            "txnType": currentTxn.txnType,
						            "paymentMode": currentTxn.paymentMode,
						            "amount": currentTxn.amount,
						            "receiptURL": currentTxn.receiptUrl,
						            "wallet": {
						                "walletProvider": currentTxn.wallet.walletProvider,
						                "walletCustomerAuthId": currentTxn.wallet.walletCustomerAuthId,
						                "walletChannelId": currentTxn.wallet.walletChannelId,
						                "walletMid": currentTxn.wallet.walletMid,
						                "walletAcquirer": currentTxn.wallet.walletAcquirer,
						                "walletRefTxnId": currentTxn.wallet.walletRefTxnId 
						            }
						        },
						        "charge": response.result.charge
						    }
						}

						if(fn) fn(resObj);
					}else{
						if(fn) fn(response);
					}
					
				})
			}catch(e){
				console.log(e);
			}
		}

		var doPostCall=function(data,url,ezetapResponseHandler){
		
			$.ajax({
						  type: "POST",
						  url: url,
						  data:JSON.stringify(data),
						  headers:{"key": mainAppKey,'Content-Type': 'application/json'},
						  success: function(response){
							  if(typeof (ezetapResponseHandler)==='function')
								  ezetapResponseHandler(response);
						  },
						  error:function(response){
							  if(typeof (ezetapResponseHandler)==='function'){
							  	ezetapResponseHandler(response.responseText);
							  }
						  },
						  dataType: "json"
						});
		}

		var doGetCall=function(url,ezetapResponseHandler){
			$.ajax({
						  type: "GET",
						  url: url,
						  headers:{"key": mainAppKey,'Content-Type': 'application/json'},
						  success: function(response){
							  if(typeof (ezetapResponseHandler)==='function')
								  ezetapResponseHandler(response);
						  },
						  error:function(response){
							  if(typeof (ezetapResponseHandler)==='function')
								  ezetapResponseHandler(response.responseText);
						  },
						  dataType: "json"
						});
		}
		return ChargeAPI;
	}
	if(typeof(ChargeAPI)==='undefined'){
		window.ChargeAPI=DefineChargeAPI();
	}else{
		console.log('ChargeAPI Already defined');
	}
}
)(window);


