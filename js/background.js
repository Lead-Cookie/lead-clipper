leadcookieClipper = {
	Settings: {
		// appUrl: 'https://storage.leadcookiestaging.com'
		appUrl: 'http://localhost:4000'
	}
};


// Little helper to easily extract the hostname out of a string that holds a URL
String.prototype.host = function() {
	var parser = document.createElement('a');
	parser.href = this;
	return parser.hostname;
};
function isEmpty(str) {
  return (!str || 0 === str.length);
}

leadcookieClipper.Main = function() {

	var appUrl = leadcookieClipper.Settings.appUrl

	function getSignedIn() {
		console.log(!isEmpty(window.localStorage.getItem("airtable-api-key")));
		console.log(!isEmpty(window.localStorage.getItem("airtable-base-key")));
		console.log(!isEmpty(window.localStorage.getItem("airtable-list-key")));
		return !isEmpty(window.localStorage.getItem("airtable-api-key"))
						&& !isEmpty(window.localStorage.getItem("airtable-base-id"))
						&& !isEmpty(window.localStorage.getItem("airtable-list-id"));
	}


	function login(options) {
		window.localStorage.setItem("airtable-api-key", options.api_key);
		window.localStorage.setItem("airtable-base-id", options.base_id);
		window.localStorage.setItem("airtable-list-id", options.list_id);

		options.success({});
	}

	function logout(options) {
		window.localStorage.removeItem("airtable-list-id");
		options.success({})
	}

	function postLead(options) {

		var lead = options.lead;

		var ajax = function() {
			$.ajax({
				url: appUrl + '/api/v1/lead/',
				type: "POST",
				// beforeSend: function(xhr, settings) {
				//     xhr.setRequestHeader("X-CSRFToken", csrfToken);
				// },
				data: JSON.stringify(lead),
				contentType: "application/json",
				success: function(response) {
					options.success(response);
				},
				error: function(xhr) {
					console.log(xhr);
					options.error(xhr);
				}
			});
		};
		
		ajax();

	}

	return {
		init: function() {


			// Set the popup template depending on whether we're signed in or not
			if (getSignedIn()) {
				chrome.browserAction.setPopup({ popup: 'templates/app.html' });
			} else {
				chrome.browserAction.setPopup({ popup: 'templates/sign_in.html'});
			}

			// Load user details (i.e. /me/) and set the popup template to the menu
			// (upon success) or to the sign-in page (upon failure)
			// loadUserDetails({
			// 	success: function() {
			// 		chrome.browserAction.setPopup({ popup: 'templates/app.html' });
			// 	},
			// 	error: function() {
			// 		chrome.browserAction.setPopup({ popup: 'templates/sign_in.html' });
			// 	}
			// });

			chrome.extension.onRequest.addListener(function(request, sender, sendResponse) {
				if (request.type === 'login') {
					login({
						api_key: request.api_key,
						base_id: request.base_id,
						list_id: request.list_id,
						success: function(response, textStatus, request) {
							sendResponse({
								success: true
							});
						},
						error: function(xhr) {
							sendResponse({
								statusCode: xhr.status,
								message: xhr.statusText
							});
						}
					});
				} else if (request.type === 'logout') {
					logout({
						success: function(response) {
							chrome.browserAction.setPopup({
								popup: 'templates/sign_in.html'
							});
							sendResponse({
								success: true
							});
						}
					});
				} else if (request.type === 'loadMenu') {
					chrome.browserAction.setPopup({
						popup: 'templates/app.html'
					});
					sendResponse({ success: true });
				} else if (request.type === 'postLead') {
					var lead = request.lead

					postLead({
						lead: lead,
						success: function(response) {

							sendResponse({
								success: true,
								data: response,
								url: appUrl + '/lead/' + response.id + '/'
							});
						},
						error: function(xhr) {
							sendResponse({
								error: true,
								xhr: xhr
							});
						}
					});
				} else if (request.type === 'getCurrentLeads') {
					// Scrape the data from the last open window's active tab
					chrome.windows.getLastFocused(function(win) {
						chrome.tabs.query({ active: true, windowId: win.id }, function(tabs) {
							if (tabs.length) {
								chrome.tabs.sendRequest(tabs[0].id, {type: 'getLeads'}, function(leads) {
									// send back the leads data and info if given url has been saved for any orgs
									sendResponse({
										leads: leads,
										postedData: {}
									});
								});
							}
						});
					});
				}
			});

		}
	};

}();

$(document).ready(function() {
	leadcookieClipper.Main.init();
});

