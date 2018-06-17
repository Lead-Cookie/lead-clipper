$(document).ready(function() {
  var i, postedData;

  var postToAirtable = function(linked_in_url, lead_id) {
    var firstName = $('#' + lead_id).data('first-name');
    var lastName = $('#' + lead_id).data('last-name');
    var airtable_api_key = window.localStorage.getItem("airtable-api-key");
    var airtable_base_id = window.localStorage.getItem("airtable-base-id");
    var airtable_list_id = window.localStorage.getItem("airtable-list-id");


    var url = 'https://api.airtable.com/v0/' + airtable_base_id + '/Leads';
    var data = {"fields": {"List": airtable_list_id, "First Name": firstName, "Last Name": lastName, "LinkedIn URL": linked_in_url}}
    var ajax = function() {
      $.ajax({
        url: url,
        type: "POST",
        beforeSend: function (xhr) {
            xhr.setRequestHeader('Authorization', 'Bearer ' + airtable_api_key);
        },
        data: JSON.stringify(data),
        contentType: "application/json",
        success: function(response) {
          $('#' + lead_id).find('td:eq(2)').html('<p>Airtable</p>');
        },
        error: function(xhr) {
          console.log(xhr);
          $('#' + lead_id).find('td:eq(2)').html('<p>Airtable Error: ' + xhr.responseText + '</p>');
        }
      });
    };
    
    ajax();
  }

  var renderLeads = function(data) {
    console.log('renderLeads data', data);

    if (data) {
      var trs = $.map(data, function(lead, index) {
        return '<tr id="lead-' + index + '" class="lead-row" data-last-name="' + 
                  lead.lastName +'" data-first-name="' + 
                  lead.firstName +'" data-linkedin-url="'+ 
                  lead.salesUrl + '"><td>' + 
                  lead.firstName + '</td><td>' + 
                  lead.lastName + '</td><td><a class="btn-sm btn btn-secondary clip-lead">Clip</a></td></tr>';
      }).join("\n");

      $('#leads-table table tbody').append(trs);

      $('.clip-lead').click(function(){
        var sales_url = $(this).parents('tr').data('linkedin-url');

        var row = $(this).parents('tr');

        $.ajax({
          url: sales_url,
          type: "GET",
          
          beforeSend: function() {
            // row.find('td:eq(2)').html('<p><img height="10" src="../img/spinner.gif"/>');
            row.find('td:eq(2)').html('<p>Fetching</p>');
          },
          complete: function(){
            // var id = row.attr('id');
            // $(id).find('td:eq(2)').find('img').hide();
          },
          success: function(response) {
            var re = /"publicLink":"(.*?)"/i;
            var linked_in_url_regex_response = response.match(re);
            if(linked_in_url_regex_response) {
              var linked_in_url = linked_in_url_regex_response[1]

              var id = row.attr('id');
              $('#' + id).find('td:eq(2)').html('<p>LinkedIn URL</p>');

              postToAirtable(linked_in_url, id);
            } else {
              //
              // NORMAL CODE, BEING OVERWRITTNE TO HELP CLIPPING WITHOUT LINKEDIN URL
              //
              // var id = row.attr('id');
              // $('#' + id).find('td:eq(2)').html('<p>LinkedIn URL NOT FOUND</p>');              
              // console.log('error', linked_in_url_regex_response, response)


              //
              // BUG PATCH TO KEEP MOVING
              //
              var linked_in_url = "NOT FOUND"

              var id = row.attr('id');
              $('#' + id).find('td:eq(2)').html('<p>LinkedIn URL</p>');

              postToAirtable(linked_in_url, id);
            }
            
          },
          error: function(xhr) {
            $('#' + id).find('td:eq(2)').html('<p>LinkedIn URL ERROR</p>');
            console.log(xhr);
          }
        });
        
      })
    }
  };

  var markAlreadyScraped = function() {
      console.log('markAlreadyScraped');
      
      var airtable_api_key = window.localStorage.getItem("airtable-api-key");
      var airtable_base_id = window.localStorage.getItem("airtable-base-id");

      var url = 'https://api.airtable.com/v0/' + airtable_base_id + '/Leads';

      var ajax = function() {
        $.ajax({
          url: url,
          type: "GET",
          beforeSend: function (xhr) {
            xhr.setRequestHeader('Authorization', 'Bearer ' + airtable_api_key);
          },
          success: function(response) {
            var records = response["records"];

            var names = $.map(records, function(record) {
              var first_name = record.fields["First Name"];
              var last_name = record.fields["Last Name"];
              return {firstName: first_name, lastName: last_name};
            }).filter(function(name) {
              return name.firstName
            })

            markAlreadyInAirtable(names);
          },
          error: function(xhr) {
            console.log(xhr);
          }
        });
      };
      
      ajax();
  };

  var markAlreadyInAirtable = function(names) {
    console.log('markAlreadyInAirtable');
    $('.lead-row').each(function() {
      var first_name = $(this).data('first-name');
      var last_name = $(this).data('last-name');
      var found_name = names.find(function(name) {
        return name.firstName == first_name && name.lastName == last_name;
      });

      if(found_name) {
        $(this).find('td:eq(2)').html('<p>Airtable</p>');
      }
    })

      
  };

  


  // scrape the lead data off of the active tab
  chrome.extension.sendRequest({type: "getCurrentLeads"}, function(response) {
    // postedData = response.postedData;
    renderLeads(response.leads);
    markAlreadyScraped();
  });


  $('.sign-out').click(function() {
    chrome.extension.sendRequest({ type: "logout" }, function(response) {
      window.close();
    });
  });


});

