const addTaskButton = document.getElementById('add-task-button');
const taskModal = document.getElementById('task-modal');
const saveTaskButton = document.getElementById('save-task-button');
const closeModalButton = document.getElementById('close-modal-button');
const taskNameInput = document.getElementById('task-name');
const studyTimeInput = document.getElementById('study-time');
const breakTimeInput = document.getElementById('break-time');
const activeTasksList = document.getElementById('active-tasks-list');
const completedTasksList = document.getElementById('completed-tasks-list');
const timerDisplay = document.getElementById('timer-display');
const currentTaskDisplay = document.getElementById('current-task');

const notification = document.createElement('div');
notification.id = 'notification';
notification.classList.add('hidden');
document.body.appendChild(notification);

let tasks = JSON.parse(localStorage.getItem('tasks')) || [];
let currentTask = null;
let timerInterval = null;

function saveTask() {
    const taskName = taskNameInput.value.trim();
    const studyTime = parseInt(studyTimeInput.value.trim());
    const breakTime = parseInt(breakTimeInput.value.trim());

    if (taskName && !isNaN(studyTime) && studyTime > 0 && !isNaN(breakTime) && breakTime > 0) {
        tasks.push({ name: taskName, studyTime, breakTime, completed: false });
        localStorage.setItem('tasks', JSON.stringify(tasks));
        renderTasks();
        closeModal();
    } else {
        showNotification("Please fill out all fields correctly!");
    }
}

function renderTasks() {
    activeTasksList.innerHTML = '';
    completedTasksList.innerHTML = '';

    tasks.forEach((task, index) => {
        const li = document.createElement('li');
        const taskName = document.createElement('span');
        taskName.textContent = task.name;
        li.appendChild(taskName);

        const buttonContainer = document.createElement('div');
        buttonContainer.className = 'task-buttons';

        if (!task.completed) {
            const startButton = document.createElement('button');
            startButton.innerHTML = '<i class="fas fa-play"></i> Start';
            startButton.addEventListener('click', () => startTask(index));
            buttonContainer.appendChild(startButton);

            const deleteButton = document.createElement('button');
            deleteButton.innerHTML = '<i class="fas fa-trash-alt"></i> Delete';
            deleteButton.addEventListener('click', () => confirmDeleteTask(index));
            buttonContainer.appendChild(deleteButton);
        } else {
            const deleteButton = document.createElement('button');
            deleteButton.innerHTML = '<i class="fas fa-trash-alt"></i> Delete';
            deleteButton.addEventListener('click', () => deleteTask(index));
            buttonContainer.appendChild(deleteButton);
        }

        li.appendChild(buttonContainer);
        (task.completed ? completedTasksList : activeTasksList).appendChild(li);
    });
}

function startTask(index) {
    if (currentTask) {
        showNotification("Terdapat tugas yang sedang berlangsung!");
        return;
    }

    currentTask = tasks[index];
    document.getElementById('timer-status').textContent = "Study Time";
    currentTaskDisplay.textContent = currentTask.name;

    let timeLeft = currentTask.studyTime * 60;
    timerInterval = setInterval(() => {
        const minutes = Math.floor(timeLeft / 60);
        const seconds = timeLeft % 60;
        timerDisplay.textContent = `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;

        if (timeLeft === 0) {
            clearInterval(timerInterval);
            timerInterval = null;
            startBreak(index);
        } else {
            timeLeft--;
        }
    }, 1000);
}

function startBreak(index) {
    document.getElementById('timer-status').textContent = "Break Time";
    let timeLeft = tasks[index].breakTime * 60;
    timerDisplay.textContent = 'Break Time!';

    timerInterval = setInterval(() => {
        const minutes = Math.floor(timeLeft / 60);
        const seconds = timeLeft % 60;
        timerDisplay.textContent = `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;

        if (timeLeft === 0) {
            clearInterval(timerInterval);
            timerInterval = null;
            completeTask(index);
        } else {
            timeLeft--;
        }
    }, 1000);
}

function completeTask(index) {
    tasks[index].completed = true;
    currentTask = null;
    document.getElementById('timer-status').textContent = "Timer";
    currentTaskDisplay.textContent = "No Tasks";
    localStorage.setItem('tasks', JSON.stringify(tasks));
    renderTasks();
}

function confirmDeleteTask(index) {
    if (currentTask && currentTask === tasks[index]) {
        showNotification(
            "Apakah anda yakin ingin menghapus tugas yang sedang berlangsung?",
            true,
            () => deleteTask(index, true)
        );
    } else {
        deleteTask(index);
    }
}

function deleteTask(index, resetTimer = false) {
    if (resetTimer) {
        clearInterval(timerInterval);
        timerInterval = null;
        currentTask = null;
        timerDisplay.textContent = '00:00';
        currentTaskDisplay.textContent = 'No Tasks';
        document.getElementById('timer-status').textContent = 'Timer';
    }

    tasks.splice(index, 1);
    localStorage.setItem('tasks', JSON.stringify(tasks));
    renderTasks();
}

function showNotification(message, confirm = false, confirmAction = null) {
    notification.innerHTML = `<p>${message}</p>`;
    if (confirm) {
        notification.innerHTML += `
            <button id="confirm-yes">Ya</button>
            <button id="confirm-no">Tidak</button>
        `;

        document.getElementById('confirm-yes').onclick = () => {
            if (confirmAction) confirmAction();
            notification.classList.remove('show');
        };

        document.getElementById('confirm-no').onclick = () => {
            notification.classList.remove('show');
        };
    }

    notification.classList.add('show');
    if (!confirm) {
        setTimeout(() => {
            notification.classList.remove('show');
        }, 3000);
    }
}

function closeModal() {
    taskModal.classList.add('hidden');
    taskNameInput.value = '';
    studyTimeInput.value = '';
    breakTimeInput.value = '';
}

function openModal() {
    taskModal.classList.remove('hidden');
}

studyTimeInput.addEventListener('keypress', (e) => {
    if (!/\d/.test(e.key)) {
        e.preventDefault();
    }
});

breakTimeInput.addEventListener('keypress', (e) => {
    if (!/\d/.test(e.key)) {
        e.preventDefault();
    }
});

addTaskButton.addEventListener('click', openModal);
saveTaskButton.addEventListener('click', saveTask);
closeModalButton.addEventListener('click', closeModal);

renderTasks();