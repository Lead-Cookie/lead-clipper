
function scrapeNewUI(){

  var dt_classes = $('div.result-lockup__entity');
  return parseNewLeadElement(dt_classes);

}

function parseNewLeadElement(dt_classes) {

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
        var title = result.currentTitle.split(' at ');
        result.currentTitle = title[0];
        result.currentCompany = $(current).find("span.result-lockup__position-company").text().trim().replace(/(\r\n\t|\n|\r\t)/gm,"");
        
        var company = result.currentCompany.split(' Go to ');
        result.currentCompany = company[0];

        // console.log('title', result.currentTitle);
        // console.log('company', result.currentCompany)
      }catch(err){
        //console.log(err)
      }

    }

    results.push(result);
  }

  return results;

}



function scrapeOldUI(){

  var dt_classes = $('.name-and-badge-container');
  return parseOldLeadElement(dt_classes)

}



function parseOldLeadElement(dt_classes) {

  var results = [];
  for(i=0;i<dt_classes.length;i++ ) {
    var result = {firstName: '', lastName: '', salesUrl: '', currentTitle: '', currentCompany: ''};

    var item = $(dt_classes[i]);

    try{
      var salesUrl =  item.find('a.name-link').attr('href').split('?')[0];
      var stringArray = item.text().split(/[^A-Za-z \.']/).slice(0, 1);
      var fullName = stringArray[0].trim();
      result.firstName = fullName.split(' ').slice(0, 1).join(' ');
      result.lastName = fullName.split(' ').slice(-1).join(' ');

    }catch(err){
      continue
    }
    
    result.salesUrl = 'https://www.linkedin.com' + salesUrl;

    var title = item.find('.details-container abbr');
    if (title){
      try{
        result.currentTitle = $(title[0]).attr('title');
      }catch(err){

      }
    }

    var company = item.find('.details-container a');
    if (company){
      try{
        result.currentCompany = $(company[0]).attr('title');
      }catch(err){

      }
    }


    results.push(result)


  }

  return results;
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