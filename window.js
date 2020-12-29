//this file is incharge of the client side of the app
//the inter process controller will be the components 
//that's controlling the passing of message between 
//the client and the server 
//all position starts from zero (0)

console.log("refreshed");
const electron = require('electron');
const {ipcRenderer} = electron;
const container = document.querySelector('#taskContainer');
ipcRenderer.send("setupData")
let allTasks = []

//when the window is ready and a message is sent from server
ipcRenderer.on('setupSchedules', function (event, schedules) {
  allTasks = schedules;
  updateObjectPosition(allTasks);
  setupSchedules(schedules);
});

//initial setup for the schedules
function setupSchedules (schedules) {
  schedules.forEach((objRow, index)=>{
    addItemToBody(objRow, index);
  })
}

//when new item added
ipcRenderer.on('newItemAdded', function (event, schedules) {
  allTasks.push(schedules);
  updateObjectPosition(allTasks);
  addNewSchedules(schedules);
});

//when a new schedule is added
function addNewSchedules (obj) {
  const position = getPositionForBiggerValue(obj, allTasks);
  addItemToBody(obj, position)
}

function addItemToBody (obj, position ) {
  const item = document.createElement("div");
  const title = document.createElement("div");
  const time = getTime(obj.taskTime);
  const itemFooter = document.createElement("div");
  const timeHolder = document.createElement("span");
  const editIcon = document.createElement("i");
  const deleteIcon = document.createElement("i");

  editIcon.classList = "fa fa-pencil editBtn";
  deleteIcon.classList = "fa fa-close closeBtn";
  itemFooter.classList = "itemFooter";
  title.classList = "itemTitle"

  deleteIcon.addEventListener("click", () => {
    deleteTask(obj.taskID, position);
  });

  editIcon.addEventListener("click", ()=>{
    editTask(obj, position)
  });

  item.classList = "item";
  timeHolder.classList = "timeHolder";
  item.setAttribute("id", obj.taskID);
  title.innerHTML = obj.taskTitle;
  timeHolder.innerHTML = time;
  itemFooter.appendChild(editIcon)
  itemFooter.appendChild(deleteIcon)
  itemFooter.appendChild(timeHolder)

  item.appendChild(title);
  item.appendChild(itemFooter);

  if (position === null) {
    container.appendChild(item);
  }else {
    container.insertBefore(item, container.children[position]);
  }
}

function deleteTask (ID, position) {
  console.log(ID, position);
  ipcRenderer.send("deleteData", ID);
}

ipcRenderer.on('deletedDataFromDB', (event, taskID) => {
  document.getElementById(taskID).remove();
})

function editTask (obj, position) {
  allTasks[position] = newTaskObject;
  updateObjectPosition();
  const element = container.childNodes[position];
}

//adding new item to database
function addNewTaskToStorage (event) {
  event.preventDefault();
  const date = getDate();
  const title = document.querySelector('#titleInput').value;
  const time = document.querySelector('#timeInput').value;
  ipcRenderer.send('addItem', title, time, date);
  clearformField();
}

function clearformField() {
  document.querySelector('#titleInput').value="";
  document.querySelector('#timeInput').value="";
}

function getDate(dateObj=null) {
  let today = new Date();
  if (dateObj) {
    today = new Date (dateObj);
  }
  const dd = String(today.getDate()).padStart(2, '0');
  const mm = String(today.getMonth() + 1).padStart(2, '0'); //January is 0!
  const yyyy = today.getFullYear();

  //the date object accept value of mm/dd/yyyy
  return yyyy + "-" + mm + "-" + dd;
}

function updateObjectPosition (taskArr) {
  taskArr.sort(compareObjectByTime)
}

function getPositionForBiggerValue(obj, arr) {
  let position;
  for (let index = 0; index < arr.length;index++) {
    const arrObj = arr[index];
    const result = compareObjectByTime (obj, arrObj);
    if (result == -1) {
      console.log(index + " matched positon");
      position = index - 1;
      break;
    }
  }
  return position == undefined ? null: position ;
}

function compareObjectByTime (obj, obj2) {
  const obj_H = obj.taskTime[0];
  const obj2_H = obj2.taskTime[0];
  if ( obj_H < obj2_H){
    return -1;
  }else if (obj_H == obj2_H) {
    // if the hour is the same, sort using the minute
    const obj_M = obj.taskTime[1];
    const obj2_M = obj2.taskTime[1];
    if (obj_M < obj2_M) {
      return -1
    }else {
      return 1
    }
  }else {
    return 1;
  }
}

function getTime (timeArr) {
  let hour = timeArr[0];
  const minute = timeArr[1];
  let str = " PM"
  if (hour < 12) {
      str = " AM"
  }
  if (hour > 12) {
    hour -=12;
  }
  return `${hour}:${minute} ${str}`;
}