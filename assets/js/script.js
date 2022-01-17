var tasks = {};

var createTask = function(taskText, taskDate, taskList) {
  // create elements that make up a task item
  var taskLi = $("<li>").addClass("list-group-item");
  var taskSpan = $("<span>")
    .addClass("badge badge-primary badge-pill")
    .text(taskDate);
  var taskP = $("<p>")
    .addClass("m-1")
    .text(taskText);

  // append span and p element to parent li
  taskLi.append(taskSpan, taskP);

  //LINE 17-22 checks to see due date
  var auditTask = function(taskEl) {
    //to ensure element is getting to the function
    // console.log(taskEl);

    //get date from task element
    var date = $(taskEl).find("span").text().trim();

    //ensure it worked
    console.log(date);

    //convert to moment object at 5:00pm
    var time = moment(date, "L").set("hour", 17);
    //this should print out an object for the value of the date variable, but at 5pm of that date
    //this takes the date, converts it to MM/DD/YYYY and we can then take the date info, parse it to the moment object using moment.js. We use jquery to select the taskEl element and ffind the span element inside it, then retrieve the text value using text(), and then a javascript method of .trim() to cut off empty spaces 
    console.log(time);

    //remove any old classes from element 
    $(taskEl).removeClass("list-group-item-warning list-group-item-danger");

    //apply new class if task is near/over due date
      if (moment().isAfter(time)) {
        $(taskEl).addClass("list-group-item-danger");
      }

    //check if the due date is nearing close 
      else if (Math.abs(moment().diff(time, "days")) <= 2) {
        $(taskEl).addClass("list-group-item-warning");
      }
  };
  //check due date
  auditTask(taskLi);


  // append to ul list on the page
  $("#list-" + taskList).append(taskLi);
};

var loadTasks = function() {
  tasks = JSON.parse(localStorage.getItem("tasks"));

  // if nothing in localStorage, create a new object to track all task status arrays
  if (!tasks) {
    tasks = {
      toDo: [],
      inProgress: [],
      inReview: [],
      done: []
    };
  }

  // loop over object properties
  $.each(tasks, function(list, arr) {
    // then loop over sub-array
    arr.forEach(function(task) {
      createTask(task.text, task.date, list);
    });
  });
};

var saveTasks = function() {
  localStorage.setItem("tasks", JSON.stringify(tasks));
};

$(".list-group").on("click","p",function () {
  console.log(this);
  
  var text = $(this)
  .text()
  .trim();     //removes whitespace in a string 

  var textInput = $("<textarea>")    //<> tells jquery to to create a NEW <textarea> element
  .addClass("form-control")
  .val(text);
  $(this).replaceWith(textInput);
  textInput.trigger("focus");
});

$(".list-group").on("blur","textarea", function (){
  //blur event will trigger as soon as user interacts with anything other than <textarea>
  //when it happens, need to collect data of current value of element, parent element's ID, and element's position on list

  //get textarea's current value/text

  var text = $(this)
    .val()
    .trim();

  // get the parent ul's id attribute

  var status = $(this)
    .closest(".list-group")
    .attr("id")
    .replace("list-", "");

  // get the task's position in the list of other li elements

  var index = $(this)
    .closest(".list-group-item")
    .index();

  tasks[status][index].text = text;
  saveTasks();

  //recreate p element for when we blur and change it from a textarea back to p element 

  var taskP = $("<p>")
    .addClass("m-1")
    .text(text);

  //replace textarea with p element 
  $(this).replaceWith(taskP);
});


//----------------------------------------------------

//MODIFYING DUE DATE 

//Due date was clicked
$(".list-group").on("click", "span", function () {
  //get current text

  var date = $(this)
  .text()
  .trim();

  //create new input element
  var dateInput = $("<input>")
  .attr("type", "text")
  .addClass("form-control")
  .val(date);

  //swap out elements 
  $(this).replaceWith(dateInput);

  //enable jquery ui datepicker
  dateInput.datepicker({
    minDate: 1,
    onClose: function() {
      //when calendar is closed, force a "change" event on the 'dateInput'
      $(this).trigger("change");
    }
  });
  //automatically focus on new element 
  dateInput.trigger("focus");



});

//------------------------------------------------------

//BLUR modified due date and save its contents

//value of due date was changed
$(".list-group").on("change","input[type='text']", function (){
  //get current text
  var date = $(this)
  .val()
  .trim();

  //get the parent ul's id attribute 

  var status = $(this)
  .closest(".list-group")
  .attr("id")
  .replace("list-", "");

  //get the task's position in the list of other li elements
  var index = $(this)
    .closest(".list-group-item")
    .index();

  //update task in array and re-save to localStorage
  tasks[status][index].date = date;
    saveTasks();

  //recreate span element with bootstrap classes
  var taskSpan = $("<span>")
    .addClass("badge badge-primary badge-pill")
    .text(date);

  //replace input with span element
  $(this).replaceWith(taskSpan);

  //Pass task's <li> element into auditTask() to check new due date from calendar
  auditTask($(taskSpan).closest(".list-group-item"));

});

//------------------------------------------------------

// modal was triggered
$("#task-form-modal").on("show.bs.modal", function() {
  // clear values
  $("#modalTaskDescription, #modalDueDate").val("");
});

// modal is fully visible
$("#task-form-modal").on("shown.bs.modal", function() {
  // highlight textarea
  $("#modalTaskDescription").trigger("focus");
});

// save button in modal was clicked
$("#task-form-modal .btn-primary").click(function() {
  // get form values
  var taskText = $("#modalTaskDescription").val();
  var taskDate = $("#modalDueDate").val();

  if (taskText && taskDate) {
    createTask(taskText, taskDate, "toDo");

    // close modal
    $("#task-form-modal").modal("hide");

    // save in tasks array
    tasks.toDo.push({
      text: taskText,
      date: taskDate
    });

    saveTasks();
  }
});

// remove all tasks
$("#remove-tasks").on("click", function() {
  for (var key in tasks) {
    tasks[key].length = 0;
    $("#list-" + key).empty();
  }
  saveTasks();
});

// load tasks for the first time
loadTasks();

//------------------------------------------------

//creating sortable <ul> elements 
//active, over, out, update, deactivate are all event listeners

$(".card .list-group").sortable({
    connectWith: $(".card .list-group"),
    scroll: false,
    tolerance: "pointer",
    helper: "clone",
    activate: function(event) {
      //console.log("activate", this);
    }, 
      deactivate: function(event) {
        //console.log("deactivate", this);
    },
      over: function(event) {
        //console.log("over", event.target);
    },
      out: function(event) {
        //console.log("out", event.target);
    },
      update: function(event) {

        var tempArr = [];
        //loop over current set of children in sortable list
        $(this).children().each(function () {

          var text = $(this)
            .find("p")              // find method is perfect for traversing through child DOM elements
            .text()
            .trim();

          console.log($(this));      //this refers to the task <li> element

          var date = $(this)
            .find("span")
            .text()
            .trim();

          console.log(text,date);    //these values need to be stored in an array to save the data

          //add task data to the temp array as an object
          tempArr.push({
            text: text,
            date: date
          });

         });
         console.log(tempArr);

         //trim down list's ID to match object property
         var arrName = $(this)
            .attr("id")
            .replace("list-","");
         
         // update array on tasks object and save
         tasks[arrName] = tempArr;
         saveTasks();

         //now we updated tasks with arrName equal to tempArr so that when we refresh, the browser keeps the tasks in the same positions from our last iteration of tasks
    }
});

//------------------------------------------------

//CREATING A DROP AND DELETE FEATURE (the drop method is our main concern here. over and out are just there for demonstration)

$("#trash").droppable({
  accept: ".card .list-group-item",
  tolerance: "touch",
  drop: function(event, ui) {
    ui.draggable.remove();    //removes it from the DOM entirely (NOTE: we dont need to call on saveTasks() becuase removing a task triggers a sortable update(), meaning the sortable calls saveTasks() for us)
    console.log("drop");
  },
  over: function(event, ui) {
    //console.log("over");
  },
  out: function(event, ui) {
    //console.log("out");
  }
})

//-------------------------------------------------

//adding jquery UI date picker and prevent user from clicking a day that already passed

$("#modalDueDate").datepicker({
  minDate: 1    //min date is one day from the current date
});

//--------------------------------------------------

//Checking date of task and coloring it based on overdue/2 days left

var auditTask = function(taskEl) {
  //to ensure element is getting to the function
  console.log(taskEl);

  //and then update the createTask() function to execute it and pass taskLi element to it as arguement 
}