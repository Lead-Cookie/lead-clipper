

function scrapeSalesNavigatorSearchResults() {
  var lead_elements = $('.name').filter(function() { return $(this).find('a.name-link').length > 0});

  if(lead_elements.length == 1) {
    return [parseLeadElement(lead_elements)]
  } else {
    return $('.name').filter(function() { return $(this).find('a.name-link').length > 0}).map(function() {
      return parseLeadElement(this)
    })
  }
  
}

function parseLeadElement(lead_element) {
  var salesUrl = $(lead_element).find('a.name-link').attr('href').split('?')[0];
  
  var stringArray = $(lead_element).text().split(/[^A-Za-z \.']/).slice(0, 1);
  var fullName = stringArray[0].trim();
  var firstName = fullName.split(' ').slice(0, 1).join(' ');
  var lastName = fullName.split(' ').slice(-1).join(' ');
  
  var salesUrl = 'https://www.linkedin.com' + salesUrl;

  return {firstName: firstName, lastName: lastName, salesUrl: salesUrl}
}




function getLeads(callback) {
  
  var leads = scrapeSalesNavigatorSearchResults();

  if (leads.length > 0) {
    callback(leads);
  } else {
    callback(null);
  }
}

chrome.extension.onRequest.addListener(function(request, sender, sendResponse) {
  
  if (request.type === 'getLeads') {
    
    getLeads(sendResponse);
  }
});

