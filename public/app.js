// Secure json articles 
$.getJSON('/articles', function(data) { 
    for (var i = 0; i < data.length; i++) {
        $('#articles').append("<p data-id='" + data[i]._id + "'>" + data[i].title + "<br />>" + data[i].link + "</p>");
    }
}); 

// Click on <p/> tag 
$(document).on("click", "p", function() {
    $('#notes').empty(); 
    let thisId = $(this).attr("data-id");

    // AJAX call 
    $.ajax({ 
        method: "GET",
        url: "/articles/" + thisId
    })
        // note section 
        .then(function(data) { 
            console.log(data);

            // Article title 
            $('#notes').append('<h2>' + data.title+ '</h2>');
            $('#notes').append("<input id='titleinput' name='title' >");
            $("#notes").append("<textarea id='bodyinput' name='body'></textarea>");
            $("#notes").append("<button data-id='" + data._id + "' id='savenote'>Save Note</button>");
            
            if (data.note) {
                $('#titleinput').val(data.note.title);
                $('#bodyinput').val(data.note.body);
            }
        });
});

// Clicking to save the note
$(document).on('click', '#savenote', function() { 
    let thisId = $(this).attr('data-id');

    // POST request 
    $.ajax({
        method: "POST", 
        url: "/articles/" + thisId,
        data: {
            title: $('#titleinput').val(),
            body: $('#bodyinput').val()
        }
    })
        .then(function(data) {
            console.log(data);
            $('#notes').empty();
        });

    // Remove input values 
    $('#titleinput').val("");
    $('#bodyinput').val("");
});