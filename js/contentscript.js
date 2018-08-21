
function scrapeNewUI(){

  //var dt_classes = $('dt.result-lockup__name');

  var dt_classes = $('div.result-lockup__entity');
  return parseNewLeadElement(dt_classes);

  // var lead_elements = dt_classes.filter(function() { return $(this).find('a[id*="ember"]').length > 0});
  // if(lead_elements.length == 1) {
  //   return [parseNewLeadElement(lead_elements)]
  // } else {
  //   return dt_classes.filter(function() { return $(this).find('a[id*="ember"]').length > 0}).map(function() {
  //     return parseNewLeadElement(this)
  //   })
  // }

}

function parseNewLeadElement(dt_classes) {
  // var salesUrl = 'https://www.linkedin.com' + $(lead_element).find('a[id*="ember"]').attr('href').split('?')[0];
  
  // var stringArray = $(lead_element).text(); //.split(/[^A-Za-z \.']/).slice(0, 1);
  // var fullName = stringArray.trim();
  // var firstName = fullName.split(' ').slice(0, 1).join(' ');
  // var lastName = fullName.split(' ').slice(-1).join(' ');
  
  // //var salesUrl = 'https://www.linkedin.com' + salesUrl;
  // //console.log(salesUrl)

  // return {firstName: firstName, lastName: lastName, salesUrl: salesUrl}


  var results = [];
  for(i=0;i<dt_classes.length;i++ ) {
    var result = {firstName: '', lastName: '', salesUrl: '', currentTitle: '', currentCompany: ''};

    var item = $(dt_classes[i])

    try{
      var name_part = item.find('dt.result-lockup__name');
      var nameArray = $(name_part).find('a[id*="ember"]');
      result.salesUrl = 'https://www.linkedin.com' + nameArray.attr('href').split('?')[0];

      //console.log(nameArray)

      var fullName = nameArray.text().trim();
      result.firstName = fullName.split(' ').slice(0, 1).join(' ');
      result.lastName = fullName.split(' ').slice(-1).join(' ');

    }catch(err){
      continue
    }
    //console.log(firstName, lastName);

    try{
      var current = item.find("span.result-lockup__position-company").parent("dd").text().trim().replace(/(\r\n\t|\n|\r\t)/gm,"");
      //console.log(current)
      var current = current.split(' at ')
      //console.log(current);
      result.currentTitle = current[0].trim();
      result.currentCompany = current[1].trim();
    }catch(err){

      //try highlighted keyword
      try{
        var current = item.find('dd.result-lockup__highlight-keyword');
        result.currentTitle = $(current).find("span").text().trim().replace(/(\r\n\t|\n|\r\t)/gm,"");
        result.currentCompany = $(current).find("a.result-lockup__position-company").text().trim().replace(/(\r\n\t|\n|\r\t)/gm,"");
        
      }catch(err){
        //console.log(err)
      }

    }

    results.push(result);
  }

  return results;

}



function scrapeOldUI(){

  var lead_elements = $('.name').filter(function() { return $(this).find('a.name-link').length > 0});

  if(lead_elements.length == 1) {
    return [parseOldLeadElement(lead_elements)]
  } else {
    return $('.name').filter(function() { return $(this).find('a.name-link').length > 0}).map(function() {
      return parseOldLeadElement(this)
    })
  }

}



function parseOldLeadElement(lead_element) {
  var salesUrl = $(lead_element).find('a.name-link').attr('href').split('?')[0];
  
  var stringArray = $(lead_element).text().split(/[^A-Za-z \.']/).slice(0, 1);
  var fullName = stringArray[0].trim();
  var firstName = fullName.split(' ').slice(0, 1).join(' ');
  var lastName = fullName.split(' ').slice(-1).join(' ');
  
  var salesUrl = 'https://www.linkedin.com' + salesUrl;

  return {firstName: firstName, lastName: lastName, salesUrl: salesUrl}
}




function scrapeSalesNavigatorSearchResults() {
  var dt_classes = $('dt.result-lockup__name');
  var leads = [];
  try{
    if(dt_classes.length < 1 ){
      leads = scrapeOldUI();
    }else{
      leads = scrapeNewUI();
    }
  }catch(err){
    leads = scrapeNewUI();
  }

  return leads;
  
}





// function parseOldLeadElement(lead_element) {
//   var salesUrl = $(lead_element).find('a.name-link').attr('href').split('?')[0];
  
//   var stringArray = $(lead_element).text().split(/[^A-Za-z \.']/).slice(0, 1);
//   var fullName = stringArray[0].trim();
//   var firstName = fullName.split(' ').slice(0, 1).join(' ');
//   var lastName = fullName.split(' ').slice(-1).join(' ');
  
//   var salesUrl = 'https://www.linkedin.com' + salesUrl;

//   return {firstName: firstName, lastName: lastName, salesUrl: salesUrl}
// }




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