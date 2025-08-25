// Primero extraemos todas las secciones en orden numérico
const allSections = [
  { num: 1, duration: 63 }, { num: 2, duration: 16 }, { num: 3, duration: 31 }, { num: 4, duration: 26 },
  { num: 5, duration: 11 }, { num: 6, duration: 7 }, { num: 7, duration: 39 }, { num: 8, duration: 49 },
  { num: 9, duration: 55 }, { num: 10, duration: 43 }, { num: 11, duration: 40 },
  { num: 12, duration: 37 }, { num: 13, duration: 97 },
  { num: 14, duration: 39 }, { num: 15, duration: 54 },
  { num: 16, duration: 83 }, { num: 17, duration: 47 },
  { num: 18, duration: 13 }, { num: 19, duration: 31 }, { num: 20, duration: 6 }, { num: 21, duration: 11 }, { num: 22, duration: 26 }, { num: 23, duration: 49 },
  { num: 24, duration: 21 }, { num: 25, duration: 76 },
  { num: 26, duration: 100 }, { num: 27, duration: 54 },
  { num: 28, duration: 22 }, { num: 29, duration: 22 }, { num: 30, duration: 20 }, { num: 31, duration: 27 },
  { num: 32, duration: 69 }, { num: 33, duration: 23 }, { num: 34, duration: 33 },
  { num: 35, duration: 27 }, { num: 36, duration: 38 }, { num: 37, duration: 99 },
  { num: 38, duration: 51 }, { num: 39, duration: 39 },
  { num: 40, duration: 136 },
  { num: 41, duration: 25 }, { num: 42, duration: 2 }, { num: 43, duration: 4 }, { num: 44, duration: 55 }, { num: 45, duration: 43 }, { num: 46, duration: 33 },
  { num: 47, duration: 17 }, { num: 48, duration: 40 }, { num: 49, duration: 16 }, { num: 50, duration: 16 }, { num: 51, duration: 45 }, { num: 52, duration: 32 },
  { num: 53.1, duration: 95, name: "Sección 53 - (1-17)" },
  { num: 53.2, duration: 96, name: "Sección 53 - (18-35)" },
  { num: 54, duration: 87 }, { num: 55, duration: 62 },
  { num: 56, duration: 11 }, { num: 57, duration: 23 }, { num: 58, duration: 110 },
  { num: 59, duration: 36 }, { num: 60, duration: 25 }, { num: 61, duration: 82 },
  { num: 62, duration: 108 }, { num: 63, duration: 37 },
  { num: 64, duration: 16 }, { num: 65, duration: 65 }, { num: 66, duration: 35 }, { num: 67, duration: 1 }
];

// Ahora agrupamos manualmente en días, respetando el límite de 140 min
function agrupar(sections, max = 140) {
  const dias = [];
  let actual = [];
  let suma = 0;

  for (const sec of sections) {
    if (suma + sec.duration <= max) {
      actual.push(sec);
      suma += sec.duration;
    } else {
      dias.push(actual);
      actual = [sec];
      suma = sec.duration;
    }
  }
  if (actual.length) dias.push(actual);
  return dias.map((secs, i) => ({ day: i + 1, sections: secs, date: '' }));
}

const courseData = agrupar(allSections, 140);

let completedSections = new Set();
let progressChart;
let currentWeek = 1;

function initializeApp() {
    generateDates();
    loadProgress();
    createTabs();
    updateSummary();
    createCharts();
    updateCharts();
}

// Generar fechas a partir del 18/08/2025, saltando fines de semana
function generateDates() {
    // Fecha de inicio fija: 18/08/2025
    const startDate = new Date('2025-08-18');
    let currentDate = new Date(startDate);

    for (let i = 0; i < courseData.length; i++) {
        if (courseData[i].sections.length > 0) {
            // Saltar fines de semana
            while (currentDate.getDay() === 0 || currentDate.getDay() === 6) {
                currentDate.setDate(currentDate.getDate() + 1);
            }
            courseData[i].date = currentDate.toLocaleDateString('es-ES');
            currentDate.setDate(currentDate.getDate() + 1);
        } else {
            courseData[i].date = 'Día libre';
        }
    }
}

function calculateWeekProgress(week) {
    let totalMinutes = 0;
    let completedMinutes = 0;
    let totalSections = 0;
    let completedSectionsCount = 0;

    week.forEach(dayData => {
        dayData.sections.forEach(section => {
            totalMinutes += section.duration;
            totalSections++;
            if (completedSections.has(section.num)) {
                completedMinutes += section.duration;
                completedSectionsCount++;
            }
        });
    });

    const percentage = totalMinutes > 0 ? Math.round((completedMinutes / totalMinutes) * 100) : 0;
    const remainingMinutes = totalMinutes - completedMinutes;

    return {
        totalMinutes,
        completedMinutes,
        remainingMinutes,
        totalSections,
        completedSectionsCount,
        percentage
    };
}

function createWeekProgressCard(weekStats, weekNumber) {
    const card = document.createElement('div');
    card.className = 'week-progress-card';

    const completedHours = Math.floor(weekStats.completedMinutes / 60);
    const completedMins = weekStats.completedMinutes % 60;
    const totalHours = Math.floor(weekStats.totalMinutes / 60);
    const totalMins = weekStats.totalMinutes % 60;
    const remainingHours = Math.floor(weekStats.remainingMinutes / 60);
    const remainingMins = weekStats.remainingMinutes % 60;

    card.innerHTML = `
        <div class="week-progress-header">
            <h3 class="week-progress-title">Progreso de la Semana ${weekNumber}</h3>
            <div class="week-percentage">${weekStats.percentage}%</div>
        </div>
        <div class="week-progress-bar">
            <div class="week-progress-fill" style="width: ${weekStats.percentage}%"></div>
        </div>
        <div class="week-stats">
            <div class="week-stat">
                <div class="week-stat-label">Completado</div>
                <div class="week-stat-value">${completedHours}h ${completedMins}m</div>
            </div>
            <div class="week-stat">
                <div class="week-stat-label">Restante</div>
                <div class="week-stat-value">${remainingHours}h ${remainingMins}m</div>
            </div>
            <div class="week-stat">
                <div class="week-stat-label">Total</div>
                <div class="week-stat-value">${totalHours}h ${totalMins}m</div>
            </div>
            <div class="week-stat">
                <div class="week-stat-label">Secciones</div>
                <div class="week-stat-value">${weekStats.completedSectionsCount}/${weekStats.totalSections}</div>
            </div>
        </div>
    `;

    return card;
}

function createTabs() {
    const tabsNav = document.getElementById('tabsNav');
    const tabsContent = document.getElementById('tabsContent');
    
    tabsNav.innerHTML = '';
    tabsContent.innerHTML = '';

    // Crear 5 semanas (5 días laborales cada una, menos la última con 2 días)
    const weeks = [];
    let currentWeekDays = [];
    let dayCounter = 0;

    courseData.forEach((dayData, index) => {
        if (dayData.sections.length === 0) return;

        currentWeekDays.push(dayData);
        dayCounter++;

        if (dayCounter === 5 || index === courseData.length - 1) {
            weeks.push([...currentWeekDays]);
            currentWeekDays = [];
            dayCounter = 0;
        }
    });

    weeks.forEach((week, weekIndex) => {
        // Crear botón de pestaña
        const tabButton = document.createElement('button');
        tabButton.className = `tab-button ${weekIndex === 0 ? 'active' : ''}`;
        tabButton.textContent = `Semana ${weekIndex + 1}`;
        tabButton.onclick = () => switchTab(weekIndex + 1);
        tabsNav.appendChild(tabButton);

        // Crear contenido de pestaña
        const tabContent = document.createElement('div');
        tabContent.className = `tab-content ${weekIndex === 0 ? 'active' : ''}`;
        tabContent.id = `week-${weekIndex + 1}`;

        const weekTitle = document.createElement('h2');
        weekTitle.className = 'week-title';
        weekTitle.textContent = `Semana ${weekIndex + 1}`;
        tabContent.appendChild(weekTitle);

        // Agregar tarjeta de progreso de la semana
        const weekStats = calculateWeekProgress(week);
        const weekProgressCard = createWeekProgressCard(weekStats, weekIndex + 1);
        tabContent.appendChild(weekProgressCard);

        const daysGrid = document.createElement('div');
        daysGrid.className = 'days-grid';

        week.forEach(dayData => {
            const dayCard = createDayCard(dayData);
            daysGrid.appendChild(dayCard);
        });

        tabContent.appendChild(daysGrid);
        tabsContent.appendChild(tabContent);
    });
}

function createDayCard(dayData) {
    const totalMinutes = dayData.sections.reduce((sum, section) => sum + section.duration, 0);
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;

    // Calcular progreso del día
    const completedSectionsInDay = dayData.sections.filter(s => completedSections.has(s.num)).length;
    const totalSectionsInDay = dayData.sections.length;
    const dayPercentage = Math.round((completedSectionsInDay / totalSectionsInDay) * 100);
    
    const allCompleted = dayPercentage === 100;
    const hasProgress = dayPercentage > 0;

    const dayCard = document.createElement('div');
    dayCard.className = `day-card ${allCompleted ? 'completed' : hasProgress ? 'partial' : ''}`;

    // Header del día
    const dayHeader = document.createElement('div');
    dayHeader.className = 'day-header';

    const dayInfo = document.createElement('div');
    dayInfo.className = 'day-info';
    dayInfo.innerHTML = `
        <h3>Día ${dayData.day}</h3>
        <p>${dayData.date} • ${hours}h ${minutes}min</p>
    `;

    const dayStatus = document.createElement('div');
    dayStatus.className = 'day-status';

    // Checkbox del día
    const dayCheckbox = document.createElement('input');
    dayCheckbox.type = 'checkbox';
    dayCheckbox.className = 'day-checkbox';
    dayCheckbox.checked = allCompleted;
    if (hasProgress && !allCompleted) {
        dayCheckbox.indeterminate = true;
    }
    dayCheckbox.onchange = () => toggleDay(dayData);

    // Badge de estado
    const statusBadge = document.createElement('span');
    statusBadge.className = `status-badge ${
        allCompleted ? 'status-completed' : 
        hasProgress ? 'status-partial' : 'status-pending'
    }`;
    statusBadge.textContent = 
        allCompleted ? 'Completado' : 
        hasProgress ? `${completedSectionsInDay}/${totalSectionsInDay}` : 'Pendiente';

    dayStatus.appendChild(dayCheckbox);
    dayStatus.appendChild(statusBadge);

    dayHeader.appendChild(dayInfo);
    dayHeader.appendChild(dayStatus);

    // Barra de progreso del día
    const dayProgress = document.createElement('div');
    dayProgress.className = 'day-progress';

    const dayProgressBar = document.createElement('div');
    dayProgressBar.className = 'day-progress-bar';

    const dayProgressFill = document.createElement('div');
    dayProgressFill.className = 'day-progress-fill';
    dayProgressFill.style.width = `${dayPercentage}%`;

    const dayProgressText = document.createElement('div');
    dayProgressText.className = 'day-progress-text';
    dayProgressText.textContent = `${completedSectionsInDay} de ${totalSectionsInDay} secciones completadas (${dayPercentage}%)`;

    dayProgressBar.appendChild(dayProgressFill);
    dayProgress.appendChild(dayProgressBar);
    dayProgress.appendChild(dayProgressText);

    // Contenedor de secciones
    const sectionsContainer = document.createElement('div');
    sectionsContainer.className = 'sections-container';

    dayData.sections.forEach(section => {
        const sectionItem = document.createElement('div');
        sectionItem.className = `section-item ${completedSections.has(section.num) ? 'completed' : ''}`;
        sectionItem.onclick = () => toggleSection(section.num);

        const sectionCheckbox = document.createElement('input');
        sectionCheckbox.type = 'checkbox';
        sectionCheckbox.className = 'section-checkbox';
        sectionCheckbox.checked = completedSections.has(section.num);
        sectionCheckbox.onclick = (e) => e.stopPropagation();
        sectionCheckbox.onchange = () => toggleSection(section.num);

        const sectionInfo = document.createElement('div');
        sectionInfo.className = 'section-info';
        sectionInfo.innerHTML = `
            <div class="section-number">Sección ${section.num}</div>
            <div class="section-duration">${Math.floor(section.duration/60)}h ${section.duration%60}min</div>
        `;

        sectionItem.appendChild(sectionCheckbox);
        sectionItem.appendChild(sectionInfo);
        sectionsContainer.appendChild(sectionItem);
    });

    dayCard.appendChild(dayHeader);
    dayCard.appendChild(dayProgress);
    dayCard.appendChild(sectionsContainer);

    return dayCard;
}

function switchTab(weekNumber) {
    // Actualizar botones
    document.querySelectorAll('.tab-button').forEach(btn => btn.classList.remove('active'));
    document.querySelectorAll('.tab-button')[weekNumber - 1].classList.add('active');

    // Actualizar contenido
    document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));
    document.getElementById(`week-${weekNumber}`).classList.add('active');

    currentWeek = weekNumber;
}

function toggleSection(sectionNum) {
    if (completedSections.has(sectionNum)) {
        completedSections.delete(sectionNum);
    } else {
        completedSections.add(sectionNum);
    }

    createTabs(); // Recrear tabs para actualizar estados
    switchTab(currentWeek); // Mantener la pestaña actual
    updateSummary();
    updateCharts();
    saveProgress();
}

function toggleDay(dayData) {
    const allCompleted = dayData.sections.every(s => completedSections.has(s.num));

    if (allCompleted) {
        // Si está completo, desmarcar todas las secciones del día
        dayData.sections.forEach(section => completedSections.delete(section.num));
    } else {
        // Si no está completo, marcar todas las secciones del día
        dayData.sections.forEach(section => completedSections.add(section.num));
    }

    createTabs(); // Recrear tabs para actualizar estados
    switchTab(currentWeek); // Mantener la pestaña actual
    updateSummary();
    updateCharts();
    saveProgress();
}

function updateSummary() {
    const totalSections = 67;
    const completed = completedSections.size;
    const percentage = Math.round((completed / totalSections) * 100);

    let totalCompletedMinutes = 0;
    completedSections.forEach(sectionNum => {
        courseData.forEach(day => {
            const section = day.sections.find(s => s.num === sectionNum);
            if (section) totalCompletedMinutes += section.duration;
        });
    });

    const completedHours = Math.floor(totalCompletedMinutes / 60);
    const completedMins = totalCompletedMinutes % 60;
    const remainingMinutes = 3150 - totalCompletedMinutes;
    const remainingHours = Math.floor(remainingMinutes / 60);
    const remainingMins = remainingMinutes % 60;

    document.getElementById('completedSections').textContent = completed;
    document.getElementById('progressPercentage').textContent = `${percentage}%`;
    document.getElementById('hoursCompleted').textContent = `${completedHours}h ${completedMins}min`;
    document.getElementById('hoursRemaining').textContent = `${remainingHours}h ${remainingMins}min`;
    document.getElementById('progressBar').style.width = `${percentage}%`;
}

function createCharts() {
    const ctx1 = document.getElementById('progressChart').getContext('2d');
    progressChart = new Chart(ctx1, {
        type: 'doughnut',
        data: {
            labels: ['Completado', 'Pendiente'],
            datasets: [{
                data: [completedSections.size, 67 - completedSections.size],
                backgroundColor: ['#3E6D52', '#e8e6e0'],
                borderWidth: 0,
                borderRadius: 4
            }]
        },
        options: { 
            responsive: true,
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: {
                        font: {
                            family: 'Segoe UI'
                        },
                        color: '#3a3a3a'
                    }
                }
            }
        }
    });
}

function updateCharts() {
    const completed = completedSections.size;
    const remaining = 67 - completed;
    progressChart.data.datasets[0].data = [completed, remaining];
    progressChart.update();
}

function resetProgress() {
    if (confirm('¿Estás seguro de que quieres reiniciar todo el progreso?')) {
        completedSections.clear();
        saveProgress();
        createTabs();
        switchTab(1);
        updateSummary();
        updateCharts();
    }
}

function saveProgress() {
    const progressData = Array.from(completedSections);
    localStorage.setItem("courseProgress", JSON.stringify(progressData));
}

function loadProgress() {
    const saved = localStorage.getItem("courseProgress");
    if (saved) {
        completedSections = new Set(JSON.parse(saved));
    }
}

// Inicializar la aplicación cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', initializeApp);