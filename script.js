/*-------------------
GLOBAL VARIABLES
--------------------*/
const closeModal = document.querySelector('.close-modal');
const addTask = document.querySelectorAll('.add-task');
const tasks = document.querySelectorAll('.task');
const saveBtn = document.querySelector('.btn-save');
const deleteBtn = document.querySelector('.btn-delete');
const taskContainers = document.querySelectorAll('.tasks-container');

// Task Class
class Tasks {
  constructor(list, taskName) {
    this.list = list;
    this.taskName = taskName;
    this.description = undefined;
    this.color = '';
  }
}

// Task Variables
let allTasks = [];
let activeTask = '';
const activeSection = {
  tempTaskName: '',
  tempTaskType: '',
  tempActiveComponent: '',
};

// Split all Tasks array by section;
const reorderTasks = () => {
  const toDoTasks = allTasks.filter((t) => t.list === 'section-1');
  const inProgressTasks = allTasks.filter((t) => t.list === 'section-2');
  const doneTasks = allTasks.filter((t) => t.list === 'section-3');

  allTasks = toDoTasks.concat(inProgressTasks, doneTasks);
};

// Instaniate new task class and add to array + update UI
const addNewTask = () => {
  const { tempTaskName, tempTaskType } = activeSection;
  const newTask = new Tasks(tempTaskType, tempTaskName);

  if (newTaskValidation(tempTaskName) > 0) {
    return;
  }
  allTasks.push(newTask);
  reorderTasks();
  updateLocaleStorage();
  updateTaskDisplay();
  clearAddTaskText();
  clearActiveSection();
};

// Validate user entry before adding task
const newTaskValidation = (task) =>
  allTasks.findIndex((t) => t.taskName.toLowerCase() === task.toLowerCase());

// Create and display task elements
const updateTaskDisplay = () => {
  const taskContainers = document.querySelectorAll('.tasks-container');
  taskContainers.forEach((t) => (t.textContent = ''));
  reorderTasks();

  allTasks.forEach((task) => {
    const template = document.querySelector('template');
    const taskTemplate = template.content.cloneNode(true);
    const parentEl = document
      .querySelector(`.${task.list}`)
      .querySelector('.tasks-container');
    taskTemplate.querySelector('.task-name').textContent = task.taskName;
    const taskEl = document.createElement('div');
    taskEl.classList.add('task');
    taskEl.draggable = true;
    const taskType = taskTemplate.querySelector('.task-type');
    if (task.color) {
      taskType.classList.add(task.color);
    }
    taskEl.append(taskTemplate);
    parentEl.append(taskEl);
  });
};

/*-------------------
LOCAL STORAGE
--------------------*/

const updateLocaleStorage = () => {
  localStorage.setItem('to-do-list', JSON.stringify(allTasks));
};

const checkLocaleStorage = () => {
  if (localStorage.getItem('to-do-list')) {
    [...JSON.parse(localStorage.getItem('to-do-list'))].forEach((item) => {
      allTasks.push(item);
    });
  }
};

/*-------------------
CLEAN UP FUNCTIONS
--------------------*/

// Clear task input after adding new task
const clearAddTaskText = () => {
  addTask.forEach((t) => {
    t.value = '';
  });
};

// Clear temp selected task values
const clearActiveSection = () => {
  activeSection.tempTaskName = '';
  activeSection.tempTaskType = '';
  activeSection.tempActiveComponent = '';
};

/*-------------------
TASK DETAILS MODAL
--------------------*/

// Hide/Show Modal
const toggleModal = () => {
  document.querySelector('.edit-modal').classList.toggle('hide');
  document.querySelector('.modal-backdrop').classList.toggle('hide');
};

// Identify selected task
const findActiveTask = (id) => {
  allTasks.forEach((task) => {
    Object.values(task).forEach((el) => {
      if (el === id.textContent) {
        updateModalValues(task);
      }
    });
  });
};

// Update modal with active task info
const updateModalValues = (task) => {
  document.querySelector('.task-edit').value = task.taskName;
  document.querySelector('.task-notes').value =
    task.description === undefined ? '' : task.description;

  for (let i = 1; i <= 4; i++) {
    document.querySelector(`.task-color-${i}`).checked =
      task.color === `color-${i}` ? true : false;
  }

  for (let i = 1; i <= 3; i++) {
    document.querySelector(`.section-radio-${i}`).checked =
      task.list === `section-${i}` ? true : false;
  }
};

// Update task changes in modal
const taskChangeUpdate = () => {
  updateTaskDisplay();
  updateLocaleStorage();
  toggleModal();
};

const saveModalChanges = () => {
  const nameVal = document.querySelector('.task-name-edit').value;
  const noteVal = document.querySelector('.task-notes').value;
  const sectionVal = document.querySelectorAll('.section-radio');
  const colorLabels = document.querySelectorAll('.task-color');
  let selectedColor = '';
  let selectedSection = '';

  colorLabels.forEach((i) => {
    if (i.checked) {
      selectedColor = i.value;
    }
  });

  sectionVal.forEach((i) => {
    if (i.checked) {
      selectedSection = i.value;
    }
  });

  allTasks.forEach((task, index) => {
    if (task.taskName === activeTask.textContent) {
      updateModalValues(task);
      allTasks[index].taskName = nameVal;
      allTasks[index].description = noteVal;
      allTasks[index].color = selectedColor;
      allTasks[index].list = selectedSection;
    }
  });
  reorderTasks();
  taskChangeUpdate();
};

/*-------------------
EVENT LISTENERS
--------------------*/

// Save task edit listener
saveBtn.addEventListener('click', saveModalChanges);

// Delete task listener
deleteBtn.addEventListener('click', () => {
  allTasks.forEach((task, index) => {
    if (task.taskName === activeTask.textContent) {
      allTasks.splice(index, 1);
    }
  });
  taskChangeUpdate();
});

// Close Edit Task Modal
closeModal.addEventListener('click', toggleModal);

// Open Edit Task Modal
tasks.forEach((task) => {
  task.addEventListener('click', toggleModal);
});

// Storage user entry into temporary global variable
addTask.forEach((elem) => {
  elem.addEventListener('keyup', (e) => {
    activeSection.tempTaskType = e.target.closest('section').className;
    activeSection.tempTaskName = e.target.value;
    activeSection.tempActiveComponent = document
      .querySelector(`.${activeSection.tempTaskType}`)
      .querySelector('.tasks-container');
  });
});

document.addEventListener('click', (e) => {
  // Event Listener for editing task (open modal)
  if (e.target.classList.contains('fa-pencil')) {
    const id = e.target.parentNode.parentNode.querySelector('.task-name');
    activeTask = id;
    toggleModal();
    findActiveTask(id);
    return;
  }
  // Add Task Input contains text and user clicks outside -> add new task
  if (activeSection.tempTaskName !== '') {
    addNewTask();
  }
});

// Pressing Enter key to add new task
document.addEventListener('keypress', (e) => {
  const modal = document.querySelector('.modal-backdrop');
  if (e.key === 'Enter' && !(activeSection.tempTaskName === '')) {
    addNewTask();
  } else if (e.key === 'Enter' && !modal.className.includes('hide')) {
    saveModalChanges();
  }
});

/*-------------------
DRAG AND DROP
--------------------*/

// Temp variables storage
let moveToSection = '';
let draggedTask;
let taskBefore = '';

// Place task in new section
const moveSectionFn = (draggedTask, moveToSection) => {
  allTasks.forEach((task, index) => {
    // Find task index and assign new section
    if (task.taskName === draggedTask.textContent) {
      allTasks[index].list = moveToSection;
      reorderTasks();
    }
  });
  movePositionFn(draggedTask, taskBefore);
};

// Place task in correct position
const movePositionFn = (draggedTask, taskBefore) => {
  // Find index of the task before
  const beforeIndex = allTasks.findIndex((i) => i.taskName === taskBefore);
  let draggedTaskObj = '';

  allTasks.forEach((task, index) => {
    // Find task in array and store task obj in temp variable
    if (task.taskName === draggedTask.textContent) {
      draggedTaskObj = allTasks[index];
      allTasks.splice(index, 1);
    }
  });
  // Place obj in new Index
  allTasks.splice(beforeIndex, 0, draggedTaskObj);

  // Update UI and Data
  reorderTasks();
  updateTaskDisplay();
  updateLocaleStorage();
};

// DRAG START LISTENER
document.addEventListener('dragstart', (e) => {
  draggedTask = e.target.querySelector('p');
});

// DRAG OVER LISTENER
document.addEventListener('dragover', (e) => {
  e.preventDefault();

  if (e.target.closest('p')) {
    taskBefore = e.target.closest('p').textContent;
  }

  if (!e.target.closest('section')) {
    return;
  } else {
    moveToSection = e.target.closest('section').className;
  }

  if (draggedTask) {
    moveSectionFn(draggedTask, moveToSection);
    moveToSection = '';
  }
});

// DROP LISTENER
taskContainers.forEach((c) => {
  c.addEventListener('drop', (e) => {
    e.preventDefault();
    draggedTask = '';
    moveToSection = '';
  });
});

/*-------------------
FUNCTIONS CALLED ON PAGE LOAD
--------------------*/

checkLocaleStorage();
updateTaskDisplay();
