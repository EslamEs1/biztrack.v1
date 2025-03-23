// Sidebar Toggle
document.addEventListener("DOMContentLoaded", function () {
    // Mobile sidebar toggle
    document
        .getElementById("sidebarCollapse")
        .addEventListener("click", function () {
            document.getElementById("sidebar").classList.toggle("active");
            document.getElementById("content").classList.toggle("active");
        });

    // Desktop sidebar toggle
    document
        .getElementById("sidebarCollapseDesktop")
        .addEventListener("click", function () {
            document.getElementById("sidebar").classList.toggle("active");
            document.getElementById("content").classList.toggle("active");
        });

    // Initialize Charts with a small delay to ensure proper sizing
    setTimeout(() => {
        initializeSalesAnalyticsChart();
        initializeProductDistributionChart();
        initializeCustomerDistributionChart();
    }, 100);

    // Initialize Bootstrap tooltips
    var tooltipTriggerList = [].slice.call(
        document.querySelectorAll('[data-bs-toggle="tooltip"]')
    );
    tooltipTriggerList.map(function (tooltipTriggerEl) {
        return new bootstrap.Tooltip(tooltipTriggerEl);
    });

    // Add active class to current menu item
    const currentPath = window.location.pathname;
    document.querySelectorAll("#sidebar a").forEach((link) => {
        if (link.getAttribute("href") === currentPath) {
            link.classList.add("active");
        }
    });
});

// Sales Analytics Chart
function initializeSalesAnalyticsChart() {
    const ctx = document.getElementById('salesAnalyticsChart').getContext('2d');
    new Chart(ctx, {
        type: 'line',
        data: {
            labels: ['يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو'],
            datasets: [{
                label: 'المبيعات',
                data: [12000, 19000, 14000, 25000, 22000, 30000],
                borderColor: '#4285f4',
                backgroundColor: 'rgba(66, 133, 244, 0.1)',
                tension: 0.4,
                fill: true,
                borderWidth: 2
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            aspectRatio: 2,
            plugins: {
                legend: {
                    display: true,
                    position: 'top',
                    align: 'end',
                    labels: {
                        boxWidth: 15,
                        font: {
                            family: 'Cairo'
                        }
                    }
                },
                title: {
                    display: true,
                    text: 'تحليل المبيعات الشهرية',
                    align: 'start',
                    font: {
                        size: 16,
                        family: 'Cairo'
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    grid: {
                        color: '#f0f0f0',
                        drawBorder: false
                    },
                    ticks: {
                        font: {
                            family: 'Cairo'
                        }
                    }
                },
                x: {
                    grid: {
                        display: false
                    },
                    ticks: {
                        font: {
                            family: 'Cairo'
                        }
                    }
                }
            }
        }
    });
}

// Product Distribution Chart
function initializeProductDistributionChart() {
    const ctx = document.getElementById('productDistributionChart').getContext('2d');
    new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: ['منتج 1', 'منتج 2', 'منتج 3', 'منتج 4'],
            datasets: [{
                data: [40, 25, 20, 15],
                backgroundColor: [
                    '#4285f4',
                    '#709bff',
                    '#a1b9ff',
                    '#d2ddff'
                ],
                borderWidth: 0
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            aspectRatio: 1,
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: {
                        font: {
                            family: 'Cairo'
                        },
                        padding: 20
                    }
                }
            },
            cutout: '70%'
        }
    });
}

// Customer Distribution Chart
function initializeCustomerDistributionChart() {
    const ctx = document.getElementById('customerDistributionChart').getContext('2d');
    new Chart(ctx, {
        type: 'pie',
        data: {
            labels: ['عملاء حاليون', 'عملاء جدد', 'عملاء متكررون'],
            datasets: [{
                data: [50, 30, 20],
                backgroundColor: [
                    '#4285f4',
                    '#34a853',
                    '#fbbc05'
                ],
                borderWidth: 0
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            aspectRatio: 1,
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: {
                        font: {
                            family: 'Cairo'
                        },
                        padding: 20
                    }
                }
            }
        }
    });
}

// Notifications System
let notifications = [];

function addNotification(message, type = "info") {
    notifications.unshift({
        id: Date.now(),
        message,
        type,
        timestamp: new Date(),
    });
    updateNotificationsBadge();
    updateNotificationsList();
}

function updateNotificationsBadge() {
    const unreadCount = notifications.length;
    const badge = document.querySelector("#notificationsDropdown .badge");
    badge.textContent = unreadCount;
    badge.style.display = unreadCount > 0 ? "block" : "none";
}

function updateNotificationsList() {
    const container = document.querySelector(".notification-dropdown");
    if (!container) return;

    const notificationItems = notifications
        .map(
            (notification) => `
        <li>
            <a class="dropdown-item" href="#">
                <i class="bi bi-info-circle text-${notification.type}"></i>
                ${notification.message}
                <small class="text-muted d-block">${formatTimestamp(
                    notification.timestamp
                )}</small>
            </a>
        </li>
    `
        )
        .join("");

    container.innerHTML = `
        <li><h6 class="dropdown-header">التنبيهات</h6></li>
        ${notificationItems}
        <li><hr class="dropdown-divider"></li>
        <li><a class="dropdown-item text-center" href="#">عرض كل التنبيهات</a></li>
    `;
}

function formatTimestamp(date) {
    const now = new Date();
    const diff = now - date;
    const minutes = Math.floor(diff / 60000);

    if (minutes < 1) return "الآن";
    if (minutes < 60) return `منذ ${minutes} دقيقة`;

    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `منذ ${hours} ساعة`;

    return date.toLocaleDateString("ar-SA");
}

// Example notifications
setTimeout(() => {
    addNotification("تم تحديث المخزون", "info");
}, 3000);

setTimeout(() => {
    addNotification("فاتورة جديدة تم إنشاؤها", "success");
}, 7000);

// Task Management
document
    .querySelectorAll('.task-item input[type="checkbox"]')
    .forEach((checkbox) => {
        checkbox.addEventListener("change", function () {
            const taskItem = this.closest(".task-item");
            if (this.checked) {
                taskItem.style.opacity = "0.5";
                taskItem.style.textDecoration = "line-through";
            } else {
                taskItem.style.opacity = "1";
                taskItem.style.textDecoration = "none";
            }
        });
    });

// Handle window resize
window.addEventListener(
    "resize",
    debounce(() => {
        const salesAnalyticsChart = Chart.getChart("salesAnalyticsChart");
        const salesDistributionChart = Chart.getChart("salesDistributionChart");

        if (salesAnalyticsChart) {
            salesAnalyticsChart.resize();
        }

        if (salesDistributionChart) {
            salesDistributionChart.resize();
        }
    }, 250)
);

// Debounce function to limit resize events
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}




