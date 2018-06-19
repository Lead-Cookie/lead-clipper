

function scrapeSalesNavigatorSearchResults() {
  var dt_classes = $('dt.result-lockup__name');

  var lead_elements = dt_classes.filter(function() { return $(this).find('a[id*="ember"]').length > 0});
  if(lead_elements.length == 1) {
    return [parseLeadElement(lead_elements)]
  } else {
    return dt_classes.filter(function() { return $(this).find('a[id*="ember"]').length > 0}).map(function() {
      return parseLeadElement(this)
    })
  }
  
}

function parseLeadElement(lead_element) {
  var salesUrl = 'https://www.linkedin.com' + $(lead_element).find('a[id*="ember"]').attr('href').split('?')[0];
  
  var stringArray = $(lead_element).text(); //.split(/[^A-Za-z \.']/).slice(0, 1);
  var fullName = stringArray.trim();
  var firstName = fullName.split(' ').slice(0, 1).join(' ');
  var lastName = fullName.split(' ').slice(-1).join(' ');
  
  //var salesUrl = 'https://www.linkedin.com' + salesUrl;
  //console.log(salesUrl)

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


chrome.runtime.onMessage.addListener(gotMessage);

function gotMessage(message, sender, sendResponse){
  console.log(message.type);
  if (message.type === 'getLeads') {
    getLeads(sendResponse);
  }
}