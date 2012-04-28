//DEfine un alert con con Jquery
window.alert = function(message) {
                	$('#dialogmessage').text(message).dialog({
                		modal:true,
                		title:'Error',
                		buttons: {
                			Aceptar:function(){
                				$(this).dialog('close');
                			}
                		}
                	});
                };