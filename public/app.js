// Grab the articles as a json
$.getJSON("/articles", function(data) {
  // For each one
  for (var i = 0; i < data.length; i++) {
    // Display the apropos information on the page
    $("#articles").append("<p data-id='" + data[i]._id + "'>" + data[i].title + "<br />" + data[i].link + "</p>");
  }
});

$(function() {
  $(".comment").on("click", function(event) {
    var id = $(this).data("id");
    var newTask = $(this).data("newcomment");  
    var newCommentState = {
        completed: newComment
      };
  
      // Send the PUT request.
    $.ajax("/api/articles/" + id, {
      type: "PUT",
      data: newCommentState
    }).then(
      function() {
        console.log("commented", newComment);
        // Reload the page to get the updated list
        location.reload();
      }
    );
  });
  
  $(".create-form").on("submit", function(event) {
    event.preventDefault();

    var newComment = {
      name: $("#ta").val().trim(),
      completed: $("[name=completed]:checked").val().trim()
    };

      // Send the POST request.
    $.ajax("/api/articles", {
      type: "POST",
      data: newComment
    }).then(
      function() {
        console.log("created new comment");
        location.reload();
      }
    );
  });
  
    $(".delete-comment").on("click", function(event) {
      var id = $(this).data("id");
  
      // Send the DELETE request.
    $.ajax("/api/articles/" + id, {
      type: "DELETE"
    }).then(
      function() {
        console.log("deleted comment", id);
        location.reload();
      }
    );
  });
});

