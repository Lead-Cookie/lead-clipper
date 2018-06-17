$(document).ready(function() {

    var apiInput = $('#user_api_key');
    var baseIdInput = $('#user_base_id');
    var listIdInput = $('#user_list_id');

    console.log('window.localStorage.getItem("airtable-api-key")', window.localStorage.getItem("airtable-api-key"))

    apiInput.val(window.localStorage.getItem("airtable-api-key"));
    baseIdInput.val(window.localStorage.getItem("airtable-base-id"));
    listIdInput.val(window.localStorage.getItem("airtable-list-id"));

    console.log('sign in')

    $('#login_form').submit(function() {
        $('#loading').show();
        $("#error").hide();
        $('#login_form').hide();
        $('#h1_text').hide();

        var api_key = apiInput.val();
        var base_id = baseIdInput.val();
        var list_id = listIdInput.val();

        chrome.extension.sendRequest({
                type: "login",
                api_key: api_key,
                base_id: base_id,
                list_id: list_id,
            }, 
            function(response) {
                if (response.success) {
                    $('#loading').hide();
                    $("#success").show();
                    
                    chrome.extension.sendRequest({ type: "loadMenu" }, 
                        function(response) {
                            setTimeout(function(){
                                window.close();
                            }, 1000);
                        }
                    );
                } else {
                    $('#loading').hide();
                    $('#login_form').show();
                    $('#h1_text').show();
                    $("#error").show();
                }
            }
        );

        return false;
        
    });

    // workaround to focus the api_key input field
    var timer = setInterval(function() {
        apiInput.focus();
        if(apiInput.is(':focus')) {
            clearInterval(timer);
        }
    }, 300);
  
});

