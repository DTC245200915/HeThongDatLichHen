
const express = require("express");
const promClient = require("prom-client");

promClient.collectDefaultMetrics();
const path = require("path");
const { Pool } = require("pg");

const app = express();
app.get("/metrics", async (req, res) => {
  try {
    res.set("Content-Type", promClient.register.contentType);
    res.end(await promClient.register.metrics());
  } catch (error) {
    console.error("Lỗi lấy metrics:", error);
    res.status(500).end("Không thể lấy metrics");
  }
});
const PORT = process.env.PORT || 3000;

// Kết nối PostgreSQL
const pool = new Pool({
  host: process.env.DB_HOST || "postgres",
  port: Number(process.env.DB_PORT || 5432),
  database: process.env.DB_NAME || "appointment_db",
  user: process.env.DB_USER || "appointment_user",
  password: process.env.DB_PASSWORD
});

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

app.get("/images/lam-mong.png", (req, res, next) => {
  res.sendFile(path.join(__dirname, "public", "images", "lam-mong .png"), error => {
    if (error) next(error);
  });
});

// Giao diện chung
function layout(title, content) {
  const activeHref = {
    "Trang chủ": "/",
    "Dịch vụ": "/services",
    "Khung giờ": "/book#time-slot-step",
    "Khách hàng": "/book#customer-step",
    "Xác nhận": "/book#booking-confirm",
    "Đặt lịch hẹn": "/book#customer-step",
    "Đặt lịch thành công": "/book#review-step",
    "Thông tin không hợp lệ": "/book#customer-step",
    "Trùng lịch hẹn": "/book#booking-confirm"
  }[title];

  return `
    <!DOCTYPE html>
    <html lang="vi">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport"
        content="width=device-width, initial-scale=1.0">
      <title>${title} | HẸN XINH - Đặt lịch hẹn</title>
      <meta name="theme-color" content="#FFF9F7">
      <link rel="stylesheet" href="/styles.css">
    </head>
    <body>
      <aside class="sidebar" id="sidebar">
        <div class="header-inner">
          <a class="brand" href="/" aria-label="Trang chủ HẸN XINH">
            <span class="brand-mark" aria-hidden="true">
              H
              <svg viewBox="0 0 24 24"><path d="M12 20s-7-4-7-9.5A4.2 4.2 0 0 1 12 8a4.2 4.2 0 0 1 7 2.5C19 16 12 20 12 20Z"/></svg>
            </span>
            <span class="brand-copy">
              <strong>HẸN XINH</strong>
              <span>Một chạm đặt lịch<br>Trọn vẹn thời gian</span>
            </span>
          </a>
          <nav class="sidebar-nav" aria-label="Điều hướng chính">
            <a href="/"${activeHref === "/" ? ' aria-current="page"' : ""}>
              <svg viewBox="0 0 24 24" aria-hidden="true"><path d="m3 10 9-7 9 7v10a1 1 0 0 1-1 1h-6v-7h-4v7H4a1 1 0 0 1-1-1z"/></svg>
              <span>Trang chủ</span>
            </a>
            <a href="/services"${activeHref === "/services" ? ' aria-current="page"' : ""}>
              <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 7h16l-1 13H5L4 7Z"/><path d="M9 9V6a3 3 0 0 1 6 0v3"/></svg>
              <span>Dịch vụ</span>
            </a>
            <a href="/book#time-slot-step"${activeHref === "/book#time-slot-step" ? ' aria-current="page"' : ""}>
              <svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg>
              <span>Khung giờ</span>
            </a>
            <a href="/book#customer-step"${activeHref === "/book#customer-step" ? ' aria-current="page"' : ""}>
              <svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="8" r="3.5"/><path d="M5 20c.7-3.2 3.2-5 7-5s6.3 1.8 7 5"/></svg>
              <span>Khách hàng</span>
            </a>
            <a class="nav-cta" href="/book#booking-confirm"${activeHref === "/book#booking-confirm" ? ' aria-current="page"' : ""}>
              <svg viewBox="0 0 24 24" aria-hidden="true"><rect x="4" y="5" width="16" height="16" rx="2"/><path d="M8 3v4m8-4v4M4 10h16m-8 3v5m-2.5-2.5h5"/></svg>
              <span>Xác nhận</span>
            </a>
          </nav>
        </div>
      </aside>
      <button class="sidebar-backdrop" id="sidebar-backdrop"
        type="button" aria-label="Đóng menu" tabindex="-1"></button>

      <main class="container">
        <button class="menu-toggle" id="menu-toggle" type="button"
          aria-controls="sidebar" aria-expanded="false">
          <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 6h16M4 12h16M4 18h16"/></svg>
          <span>Menu</span>
        </button>
        <header class="topbar">
          <div class="topbar-heading">
            <span class="topbar-label">KHÔNG GIAN CỦA BẠN</span>
            <h1>${title}</h1>
          </div>
          <div class="topbar-actions">
          <label class="dashboard-search">
            <svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="10.8" cy="10.8" r="6.8"/><path d="m16 16 4.5 4.5"/></svg>
            <input id="dashboard-search" type="search"
              placeholder="Tìm dịch vụ, lịch hẹn..."
              aria-label="Tìm dịch vụ, khung giờ hoặc lịch hẹn">
          </label>
          <div class="topbar-date">
            <svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3.5" y="5" width="17" height="16" rx="2"/><path d="M7.5 3v4m9-4v4m-13 3h17"/></svg>
            <time id="current-date"></time>
          </div>
          <div class="user-profile" aria-label="Tài khoản khách hàng">
            <span class="user-avatar" aria-hidden="true">
              <svg viewBox="0 0 24 24"><circle cx="12" cy="8" r="3.5"/><path d="M5 20c.7-3.2 3.2-5 7-5s6.3 1.8 7 5"/></svg>
            </span>
            <span class="user-profile-name">Khách hàng</span>
          </div>
          </div>
        </header>
        ${content}
      </main>

      <footer>
        <div class="footer-inner">
          <a class="brand footer-brand" href="/">
            <span class="brand-mark" aria-hidden="true">
              H
              <svg viewBox="0 0 24 24"><path d="M12 20s-7-4-7-9.5A4.2 4.2 0 0 1 12 8a4.2 4.2 0 0 1 7 2.5C19 16 12 20 12 20Z"/></svg>
            </span>
            <span class="brand-copy">
              <strong>HẸN XINH</strong>
              <span>Một chạm đặt lịch – Trọn vẹn thời gian</span>
            </span>
          </a>
          <p>© 2026 Hệ thống Đặt lịch hẹn</p>
        </div>
      </footer>
      <script>
        const menuToggle = document.getElementById("menu-toggle");
        const sidebarBackdrop = document.getElementById("sidebar-backdrop");
        const sidebarLinks = document.querySelectorAll(".sidebar-nav a");

        function setSidebarOpen(isOpen) {
          document.body.classList.toggle("sidebar-open", isOpen);
          menuToggle.setAttribute("aria-expanded", String(isOpen));
          sidebarBackdrop.tabIndex = isOpen ? 0 : -1;
        }

        menuToggle.addEventListener("click", () => {
          setSidebarOpen(menuToggle.getAttribute("aria-expanded") !== "true");
        });
        sidebarBackdrop.addEventListener("click", () => setSidebarOpen(false));
        sidebarLinks.forEach(link => {
          link.addEventListener("click", () => setSidebarOpen(false));
        });
        document.addEventListener("keydown", event => {
          if (event.key === "Escape") setSidebarOpen(false);
        });

        const currentDate = document.getElementById("current-date");
        if (currentDate) {
          currentDate.textContent = new Intl.DateTimeFormat("vi-VN", {
            weekday: "long",
            day: "numeric",
            month: "long",
            year: "numeric"
          }).format(new Date());
        }

        const dashboardSearch = document.getElementById("dashboard-search");
        if (dashboardSearch) {
          dashboardSearch.addEventListener("input", () => {
            const query = dashboardSearch.value.trim().toLocaleLowerCase("vi");
            document.querySelectorAll(
              ".cards .card, .time-slot-card, .table-wrap tbody tr"
            ).forEach(item => {
              item.hidden = query.length > 0 &&
                !item.textContent.toLocaleLowerCase("vi").includes(query);
            });
          });
        }

        const bookingForm = document.querySelector(".booking-form");
        if (bookingForm) {
          bookingForm.noValidate = true;
          const validationMessages = {
            full_name:
              "Vui lòng viết hoa chữ cái đầu của mỗi từ trong họ và tên.",
            phone:
              "Số điện thoại phải có 10 chữ số và bắt đầu bằng số 0."
          };
          const identityInputs = ["full_name", "phone"].map(name =>
            bookingForm.querySelector('[name="' + name + '"]')
          );
          const validateIdentityInput = input => {
            const value = input.value.trim().normalize("NFC");
            const isValid = input.name === "full_name"
              ? /^\\p{Lu}\\p{Ll}*(?:\\s+\\p{Lu}\\p{Ll}*)*$/u.test(value) &&
                value.length <= 150
              : /^0\\d{9}$/.test(value);
            const error = input
              .closest(".form-field")
              .querySelector(".field-error");

            input.classList.toggle("is-invalid", !isValid);
            input.setAttribute("aria-invalid", String(!isValid));
            error.textContent = isValid ? "" : validationMessages[input.name];
            error.hidden = isValid;
            return isValid;
          };

          identityInputs.forEach(input => {
            input.addEventListener("blur", () => validateIdentityInput(input));
            input.addEventListener("input", () => {
              if (input.classList.contains("is-invalid")) {
                validateIdentityInput(input);
              }
            });
          });

          const fieldGroups = [
            {
              title: "Chọn dịch vụ",
              description: "Chọn dịch vụ bạn muốn trải nghiệm tại HẸN XINH.",
              id: "service-step",
              fields: ["service_id"]
            },
            {
              title: "Chọn ngày và khung giờ",
              description: "Chọn ngày hẹn để kiểm tra các khung giờ còn trống.",
              id: "time-slot-step",
              fields: ["appointment_date", "time_slot_id"]
            },
            {
              title: "Thông tin của bạn",
              description: "Cho chúng tôi biết cách xưng hô và liên hệ với bạn.",
              id: "customer-step",
              fields: ["full_name", "phone", "email"]
            },
            {
              title: "Xác nhận thông tin",
              description: "Kiểm tra lại thông tin trước khi gửi yêu cầu đặt lịch.",
              id: "review-step",
              fields: []
            }
          ];
          let previousStep = bookingForm.querySelector("#booking-guidance");
          const steps = fieldGroups.map((group, index) => {
            const section = document.createElement("section");
            section.className = "booking-step";
            section.id = group.id;
            section.setAttribute("aria-label", group.title);
            section.innerHTML = '<div class="booking-step-heading"><span>BƯỚC ' +
              (index + 1) + " / " + fieldGroups.length +
              "</span><h2>" + group.title +
              "</h2><p>" + group.description + "</p></div>";

            if (group.id === "review-step") {
              section.insertAdjacentHTML(
                "beforeend",
                '<div class="booking-review-grid">' +
                  '<div><span>Dịch vụ</span><strong data-review="service"></strong></div>' +
                  '<div><span>Giá tiền</span><strong data-review="price"></strong></div>' +
                  '<div><span>Ngày hẹn</span><strong data-review="date"></strong></div>' +
                  '<div><span>Khung giờ</span><strong data-review="time"></strong></div>' +
                  '<div><span>Họ và tên</span><strong data-review="full_name"></strong></div>' +
                  '<div><span>Số điện thoại</span><strong data-review="phone"></strong></div>' +
                  '<div data-review-email-row><span>Email</span><strong data-review="email"></strong></div>' +
                '</div>'
              );
            }

            group.fields.forEach(name => {
              const field = bookingForm.querySelector(
                '[name="' + name + '"]'
              );
              if (field) section.append(field.closest(".form-field"));
            });

            previousStep.after(section);
            previousStep = section;
            return section;
          });
          const timeStep = steps[fieldGroups.findIndex(group =>
            group.id === "time-slot-step"
          )];
          timeStep.append(
            bookingForm.querySelector("#availability-status"),
            bookingForm.querySelector("#slot-message")
          );
          const stepControls = document.createElement("div");
          stepControls.className = "booking-step-controls";
          stepControls.innerHTML =
            '<button type="button" class="btn btn-secondary" data-step-back>' +
            'Quay lại</button><button type="button" class="btn" data-step-next>' +
            'Tiếp tục <span aria-hidden="true">→</span></button>';
          bookingForm.insertBefore(
            stepControls,
            bookingForm.querySelector(".form-footer")
          );

          let activeStep = 0;
          const backButton = stepControls.querySelector("[data-step-back]");
          const nextButton = stepControls.querySelector("[data-step-next]");
          const submitButton = bookingForm.querySelector(
            '.form-footer button[type="submit"]'
          );
          const reviewStepIndex = fieldGroups.findIndex(group =>
            group.id === "review-step"
          );
          const reviewStep = steps[reviewStepIndex];
          const updateReview = () => {
            const selectedService = serviceSelect.options[
              serviceSelect.selectedIndex
            ];
            const selectedSlot = slotButtons.find(button =>
              button.dataset.slotId === slotSelect.value
            );
            const values = {
              service: selectedService?.textContent.trim() || "",
              price: selectedService?.dataset.price
                ? Number(selectedService.dataset.price).toLocaleString("vi-VN") +
                  " đ"
                : "",
              date: dateInput.value
                ? new Date(dateInput.value + "T00:00:00").toLocaleDateString(
                    "vi-VN"
                  )
                : "",
              time: selectedSlot?.querySelector(".availability-slot-time")
                .textContent.trim() || "",
              full_name: bookingForm.elements.full_name.value.trim(),
              phone: bookingForm.elements.phone.value,
              email: bookingForm.elements.email.value.trim()
            };
            Object.entries(values).forEach(([key, value]) => {
              reviewStep.querySelector('[data-review="' + key + '"]')
                .textContent = value || "—";
            });
            reviewStep.querySelector("[data-review-email-row]").hidden =
              !values.email;
          };
          const showStep = index => {
            activeStep = index;
            if (steps[activeStep].id === "review-step") updateReview();
            backButton.textContent =
              steps[activeStep].id === "review-step"
                ? "Quay lại chỉnh sửa"
                : "Quay lại";
            steps.forEach((step, stepIndex) => {
              step.hidden = stepIndex !== activeStep;
            });
            backButton.hidden = activeStep === 0;
            nextButton.hidden = activeStep === steps.length - 1;
            submitButton.hidden = activeStep !== steps.length - 1;
            sidebarLinks.forEach(link => {
              const target = bookingNavigationTarget(link);
              if (["service-step", "customer-step", "time-slot-step",
                   "review-step"]
                  .includes(target)) {
                if (target === steps[activeStep].id) {
                  link.setAttribute("aria-current", "page");
                } else {
                  link.removeAttribute("aria-current");
                }
              }
            });
            const url = new URL(window.location.href);
            url.hash = steps[activeStep].id;
            history.replaceState(
              null, "", url.pathname + url.search + url.hash
            );
            persistBookingSelection();
          };

          const guidance = bookingForm.querySelector("#booking-guidance");
          const showGuidance = message => {
            guidance.textContent = message;
            guidance.hidden = false;
          };
          const clearGuidance = () => {
            guidance.textContent = "";
            guidance.hidden = true;
          };
          const bookingNavigationTarget = link => {
            const linkUrl = new URL(link.href);
            const hashTarget = linkUrl.hash.slice(1);
            return (hashTarget === "booking-confirm"
              ? "review-step"
              : hashTarget) ||
              (linkUrl.pathname === "/services" ? "service-step" : "");
          };
          const customerStepIndex = fieldGroups.findIndex(group =>
            group.fields.includes("full_name")
          );
          const serviceStepIndex = fieldGroups.findIndex(group =>
            group.fields.includes("service_id")
          );
          const timeStepIndex = fieldGroups.findIndex(group =>
            group.fields.includes("appointment_date")
          );
          const customerIsComplete = () => {
            const identityValid = identityInputs
              .map(validateIdentityInput)
              .every(Boolean);
            const otherFieldsValid = Array.from(
              steps[customerStepIndex].querySelectorAll("input, select")
            ).every(field => field.checkValidity());
            return identityValid && otherFieldsValid;
          };
          const timeSelectionIsComplete = () =>
            Array.from(
              steps[timeStepIndex].querySelectorAll("input, select")
            ).every(field => field.checkValidity()) &&
            window.isSelectedSlotAvailable();
          const timeFieldsAreValid = () =>
            Array.from(
              steps[timeStepIndex].querySelectorAll("input, select")
            ).every(field => field.checkValidity());
          const bookingSelectionIsComplete = () =>
            steps[serviceStepIndex].querySelector("select").checkValidity() &&
            timeSelectionIsComplete();
          const navigateBooking = target => {
            clearGuidance();
            if (target === "service-step") {
              showStep(serviceStepIndex);
              return;
            }
            if (target === "time-slot-step" &&
                !steps[serviceStepIndex].querySelector("select").checkValidity()) {
              showStep(serviceStepIndex);
              showGuidance("Vui lòng chọn dịch vụ trước khi chọn khung giờ.");
              steps[serviceStepIndex].querySelector("select").focus();
              return;
            }
            if (target === "customer-step" &&
                !steps[serviceStepIndex].querySelector("select").checkValidity()) {
              showStep(serviceStepIndex);
              showGuidance("Vui lòng chọn dịch vụ trước khi tiếp tục.");
              steps[serviceStepIndex].querySelector("select").focus();
              return;
            }
            if (target === "customer-step") {
              if (!timeSelectionIsComplete()) {
                showStep(timeStepIndex);
                if (timeFieldsAreValid() &&
                    !window.isBookingAvailabilityReady()) {
                  return;
                }
                showGuidance(
                  timeFieldsAreValid()
                    ? "Khung giờ đã chọn không còn trống. Vui lòng chọn khung giờ khác."
                    : "Vui lòng chọn ngày và một khung giờ còn trống trước khi tiếp tục."
                );
                steps[timeStepIndex]
                  .querySelector(":invalid")
                  ?.focus();
                return;
              }
              showStep(customerStepIndex);
              return;
            }
            if (target === "time-slot-step") {
              showStep(timeStepIndex);
              return;
            }

            if (!bookingSelectionIsComplete()) {
              const incompleteStep = steps[serviceStepIndex]
                .querySelector("select").checkValidity()
                ? timeStepIndex
                : serviceStepIndex;
              showStep(incompleteStep);
              if (incompleteStep === timeStepIndex &&
                  timeFieldsAreValid() &&
                  !window.isBookingAvailabilityReady()) {
                return;
              }
              showGuidance(
                incompleteStep === serviceStepIndex
                  ? "Vui lòng chọn dịch vụ trước khi tiếp tục."
                  : timeFieldsAreValid()
                    ? "Khung giờ đã chọn không còn trống. Vui lòng chọn khung giờ khác."
                    : "Vui lòng chọn ngày và một khung giờ còn trống trước khi xác nhận."
              );
              steps[incompleteStep].querySelector(":invalid")?.focus();
              return;
            }
            if (!customerIsComplete()) {
              showStep(customerStepIndex);
              showGuidance(
                "Vui lòng hoàn tất thông tin khách hàng trước khi xác nhận."
              );
              steps[customerStepIndex]
                .querySelector(":invalid, .is-invalid")
                ?.focus();
              return;
            }
            showStep(reviewStepIndex);
            submitButton.focus();
          };

          backButton.addEventListener("click", () => showStep(activeStep - 1));
          nextButton.addEventListener("click", () => {
            clearGuidance();
            const fieldsValid = Array.from(
              steps[activeStep].querySelectorAll("input, select")
            ).every(field => field.checkValidity());
            if (!fieldsValid) {
              steps[activeStep]
                .querySelector(":invalid")
                ?.reportValidity();
              return;
            }
            if (steps[activeStep].id === "time-slot-step" &&
                !window.isSelectedSlotAvailable()) {
              showGuidance(
                window.isBookingAvailabilityReady()
                  ? "Chọn một khung giờ còn trống sau khi kiểm tra tình trạng."
                  : "Vui lòng chờ kiểm tra tình trạng khung giờ rồi tiếp tục."
              );
              return;
            }
            if (steps[activeStep].id === "customer-step" &&
                !identityInputs.map(validateIdentityInput).every(Boolean)) {
              identityInputs.find(input =>
                input.classList.contains("is-invalid")
              )?.focus();
              return;
            }
            if (activeStep < steps.length - 1) {
              showStep(activeStep + 1);
              steps[activeStep].querySelector("input, select")?.focus();
            }
          });
          bookingForm.addEventListener("submit", event => {
            clearGuidance();
            if (steps[activeStep].id !== "review-step" ||
                event.submitter !== submitButton) {
              event.preventDefault();
              if (bookingSelectionIsComplete() && customerIsComplete()) {
                showStep(reviewStepIndex);
                return;
              }
            }
            if (!bookingSelectionIsComplete()) {
              event.preventDefault();
              const incompleteStep = steps[serviceStepIndex]
                .querySelector("select").checkValidity()
                ? timeStepIndex
                : serviceStepIndex;
              showStep(incompleteStep);
              showGuidance(
                incompleteStep === serviceStepIndex
                  ? "Vui lòng chọn dịch vụ trước khi tiếp tục."
                  : "Vui lòng chọn ngày và một khung giờ còn trống trước khi xác nhận."
              );
              steps[incompleteStep].querySelector(":invalid")?.focus();
              return;
            }
            if (!customerIsComplete()) {
              event.preventDefault();
              showStep(customerStepIndex);
              showGuidance(
                "Vui lòng hoàn tất thông tin khách hàng trước khi xác nhận."
              );
              steps[customerStepIndex]
                .querySelector(":invalid, .is-invalid")
                ?.focus();
              return;
            }
          });
          sidebarLinks.forEach(link => {
            const target = bookingNavigationTarget(link);
            if (!["service-step", "customer-step", "time-slot-step",
                  "review-step", "booking-confirm"]
                .includes(target)) {
              return;
            }
            link.addEventListener("click", event => {
              if (new URL(link.href).pathname !== window.location.pathname) {
                return;
              }
              event.preventDefault();
              const url = new URL(window.location.href);
              url.hash = target;
              history.replaceState(
                null, "", url.pathname + url.search + url.hash
              );
              navigateBooking(target);
              setSidebarOpen(false);
            });
          });
          const requestedTarget = window.location.hash.slice(1);
          showStep(0);
          if (["service-step", "customer-step", "time-slot-step",
               "review-step", "booking-confirm"]
              .includes(requestedTarget)) {
            navigateBooking(requestedTarget);
          }
        }
      </script>
    </body>
    </html>
  `;
}

// Tránh đưa dữ liệu chưa tin cậy trực tiếp vào HTML
function escapeHtml(value) {
  return String(value ?? "").replace(/[&<>"']/g, char => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;"
  })[char]);
}

// Trang chủ dành cho khách hàng
app.get("/", async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT id, name, description, price FROM services ORDER BY id"
    );
    const featuredServices = result.rows.filter(service =>
      service.name.trim().toLocaleLowerCase("vi") !== "tư vấn khách hàng"
    ).slice(0, 3);
    const featuredImages = {
      "chăm sóc da": "/images/cham-soc-da.jpg",
      "trang điểm": "/images/trang-diem.jpg",
      "làm tóc": "/images/lam-toc.jpg"
    };
    const serviceCards = featuredServices.map(service => `
      <article class="card">
        <img class="service-photo-placeholder"
          src="${featuredImages[service.name.trim().toLocaleLowerCase("vi")] || ""}"
          alt="${escapeHtml(service.name)}">
        <h3>${escapeHtml(service.name)}</h3>
        <p class="service-description">${escapeHtml(service.description)}</p>
        <p class="price">${Number(service.price).toLocaleString("vi-VN")} đ</p>
        <a class="btn" href="/book?service_id=${encodeURIComponent(service.id)}#time-slot-step">Chọn dịch vụ <span aria-hidden="true">→</span></a>
      </article>
    `).join("");

    res.send(layout("Trang chủ", `
    <section class="dashboard-welcome">
      <div class="welcome-copy">
        <span class="welcome-eyebrow">HẸN XINH · CHĂM SÓC LÀ DÀNH THỜI GIAN CHO BẠN</span>
        <h2>Chăm sóc bản thân<br><span>dễ dàng hơn mỗi ngày</span></h2>
        <p>Chào mừng bạn đến với HẸN XINH. Khám phá các dịch vụ chăm sóc và chọn thời gian thuận tiện cho cuộc hẹn của mình.</p>
        <div class="welcome-actions">
          <a class="btn" href="/services">Đặt lịch ngay <span aria-hidden="true">→</span></a>
        </div>
      </div>
      <img class="welcome-photo-placeholder"
        src="/images/spa-reception.png"
        alt="Không gian lễ tân spa HẸN XINH với nội thất kem và nâu ấm">
    </section>

    <section class="dashboard-section home-services">
      <div class="section-heading">
        <div><span class="section-kicker">CHĂM SÓC DÀNH CHO BẠN</span><h2>Dịch vụ nổi bật</h2></div>
        <a class="text-link" href="/services">Xem tất cả dịch vụ <span aria-hidden="true">→</span></a>
      </div>
      <div class="cards featured-services">
        ${serviceCards || '<p class="dashboard-empty">Hiện chưa có dịch vụ để giới thiệu.</p>'}
      </div>
    </section>
    `));
  } catch (error) {
    console.error("Lỗi lấy dịch vụ trang chủ:", error);
    res.status(500).send(layout("Trang chủ", `
      <section class="dashboard-welcome">
        <div class="welcome-copy">
          <span class="welcome-eyebrow">HẸN XINH · CHĂM SÓC LÀ DÀNH THỜI GIAN CHO BẠN</span>
          <h2>Chăm sóc bản thân<br><span>dễ dàng hơn mỗi ngày</span></h2>
          <p>Chào mừng bạn đến với HẸN XINH. Khám phá các dịch vụ chăm sóc và chọn thời gian thuận tiện cho cuộc hẹn của mình.</p>
          <div class="welcome-actions">
            <a class="btn" href="/services">Đặt lịch ngay <span aria-hidden="true">→</span></a>
          </div>
        </div>
        <img class="welcome-photo-placeholder"
          src="/images/spa-reception.png"
          alt="Không gian lễ tân spa HẸN XINH với nội thất kem và nâu ấm">
      </section>
      <p class="error" role="alert">Không thể tải danh sách dịch vụ ngay lúc này. Vui lòng thử lại.</p>
    `));
  }
});

// Danh sách dịch vụ từ PostgreSQL
app.get("/services", async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT * FROM services ORDER BY id"
    );

    const visibleServices = result.rows.filter(service =>
      service.name.trim().toLocaleLowerCase("vi") !== "tư vấn khách hàng"
    );
    const serviceImages = {
      "chăm sóc da": "/images/cham-soc-da.jpg",
      "trang điểm": "/images/trang-diem.jpg",
      "làm tóc": "/images/lam-toc.jpg",
      "làm móng": "/images/lam-mong.png"
    };
    const cards = visibleServices.map(service => `
      <article class="card">
        <img class="service-card-image"
          src="${serviceImages[service.name.trim().toLocaleLowerCase("vi")] || ""}"
          alt="${escapeHtml(service.name)}">
        <h3>${escapeHtml(service.name)}</h3>
        <p class="service-description">${escapeHtml(service.description)}</p>
        <p class="price">
          ${Number(service.price).toLocaleString("vi-VN")} đ
        </p>
        <a class="btn btn-outline" href="/book?service_id=${encodeURIComponent(service.id)}#time-slot-step">
          Chọn dịch vụ <span aria-hidden="true">→</span>
        </a>
      </article>
    `).join("");

    res.send(layout("Dịch vụ", `
      <div class="page-heading">
        <span class="section-kicker">CHỌN ĐIỀU BẠN YÊU THÍCH</span>
        <h1>Danh sách dịch vụ</h1>
        <p>Các dịch vụ hiện có trong hệ thống, dành riêng cho khoảng thời gian của bạn.</p>
      </div>
      <div class="cards">
        ${cards || "<p>Chưa có dịch vụ.</p>"}
      </div>
    `));
  } catch (error) {
    console.error("Lỗi lấy dịch vụ:", error);
    res.status(500).send(layout("Lỗi", `
      <p class="error">Không thể tải dịch vụ.</p>
    `));
  }
});

// Danh sách khung giờ từ PostgreSQL
app.get("/time-slots", async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT id, start_time, end_time
      FROM time_slots
      ORDER BY start_time
    `);

    const rows = result.rows.map((slot, index) => `
      <article class="time-slot-card">
        <span class="time-slot-number">KHUNG GIỜ ${String(index + 1).padStart(2, "0")}</span>
        <span class="time-slot-period" aria-hidden="true">◷</span>
        <strong>${escapeHtml(String(slot.start_time).slice(0, 5))}</strong>
        <span class="time-slot-divider" aria-hidden="true"></span>
        <strong>${escapeHtml(String(slot.end_time).slice(0, 5))}</strong>
      </article>
    `).join("");

    res.send(layout("Khung giờ", `
      <div class="page-heading">
        <span class="section-kicker">LÊN KẾ HOẠCH THẬT DỄ DÀNG</span>
        <h1>Khung giờ</h1>
        <p>Chọn khoảng thời gian thuận tiện nhất cho cuộc hẹn của bạn.</p>
      </div>
      <div class="time-slot-grid">
        ${rows || '<p class="dashboard-empty">Hiện chưa có khung giờ nào.</p>'}
      </div>
    `));
  } catch (error) {
    console.error("Lỗi lấy khung giờ:", error);
    res.status(500).send(layout("Lỗi", `
      <p class="error">Không thể tải khung giờ.</p>
    `));
  }
});

// Danh sách lịch hẹn
app.get("/appointments", async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT
        a.id,
        c.full_name,
        s.name AS service_name,
        a.appointment_date,
        t.start_time,
        t.end_time,
        a.status
      FROM appointments a
      JOIN customers c ON a.customer_id = c.id
      JOIN services s ON a.service_id = s.id
      JOIN time_slots t ON a.time_slot_id = t.id
      ORDER BY a.appointment_date DESC, t.start_time
    `);

    const statusLabels = {
      pending: "Chờ xác nhận",
      confirmed: "Đã xác nhận",
      cancelled: "Đã hủy"
    };
    const rows = result.rows.map(a => {
      const statusClass = ["pending", "confirmed", "cancelled"].includes(
        a.status
      ) ? " status-" + a.status : "";
      return `
      <tr>
        <td>${a.id}</td>
        <td>${escapeHtml(a.full_name)}</td>
        <td>${escapeHtml(a.service_name)}</td>
        <td>${escapeHtml(
          new Date(a.appointment_date)
            .toLocaleDateString("vi-VN", { timeZone: "UTC" })
        )}</td>
        <td>${escapeHtml(a.start_time)}</td>
        <td>${escapeHtml(a.end_time)}</td>
        <td><span class="appointment-status${statusClass}">${escapeHtml(
          statusLabels[a.status] || a.status
        )}</span></td>
      </tr>
    `;
    }).join("");

    res.send(layout("Lịch hẹn", `
      <div class="page-heading">
        <span class="section-kicker">THÔNG TIN ĐẶT HẸN</span>
        <h1>Danh sách lịch hẹn</h1>
        <p>Các lịch hẹn đã được đăng ký trong hệ thống.</p>
      </div>
      <div class="table-wrap">
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Khách hàng</th>
              <th>Dịch vụ</th>
              <th>Ngày hẹn</th>
              <th>Bắt đầu</th>
              <th>Kết thúc</th>
              <th>Trạng thái</th>
            </tr>
          </thead>
          <tbody>
            ${rows || `
              <tr>
                <td colspan="7">
                  Chưa có lịch hẹn nào.
                </td>
              </tr>
            `}
          </tbody>
        </table>
      </div>
    `));
  } catch (error) {
    console.error("Lỗi lấy lịch hẹn:", error);
    res.status(500).send(layout("Lỗi", `
      <p class="error">Không thể tải lịch hẹn.</p>
    `));
  }
});

 // Trang đặt lịch hẹn
app.get("/book", async (req, res) => {
  try {
    const services = await pool.query(
      "SELECT id, name, price FROM services ORDER BY id"
    );

    const slots = await pool.query(
      "SELECT id, start_time, end_time FROM time_slots ORDER BY start_time"
    );

    const requestedServiceId = Number(req.query.service_id);
    const requestedSlotId = Number(req.query.time_slot_id);
    const selectedServiceId = services.rows.some(service =>
      Number(service.id) === requestedServiceId &&
      service.name.trim().toLocaleLowerCase("vi") !== "tư vấn khách hàng"
    ) ? requestedServiceId : null;
    const selectedSlotId = slots.rows.some(slot =>
      Number(slot.id) === requestedSlotId
    ) ? requestedSlotId : null;
    const requestedDate = String(req.query.appointment_date || "");
    const selectedDate = /^\d{4}-\d{2}-\d{2}$/.test(requestedDate) &&
      Number.isFinite(Date.parse(requestedDate)) &&
      new Date(requestedDate).toISOString().slice(0, 10) === requestedDate
      ? requestedDate
      : "";

    const serviceOptions = services.rows.filter(s =>
      s.name.trim().toLocaleLowerCase("vi") !== "tư vấn khách hàng"
    ).map(s => `
      <option value="${s.id}" data-price="${escapeHtml(s.price)}"${Number(s.id) === selectedServiceId ? " selected" : ""}>
        ${escapeHtml(s.name)}
      </option>
    `).join("");

    const slotOptions = slots.rows.map(t => `
      <option value="${t.id}"${Number(t.id) === selectedSlotId ? " selected" : ""}>
        ${escapeHtml(t.start_time)} - ${escapeHtml(t.end_time)}
      </option>
    `).join("");
    const slotButtons = slots.rows.map(t => `
      <button type="button" class="availability-slot"
        data-slot-id="${t.id}" disabled aria-pressed="false">
        <span class="availability-slot-time">
          ${escapeHtml(String(t.start_time).slice(0, 5))} – ${escapeHtml(String(t.end_time).slice(0, 5))}
        </span>
        <span class="availability-slot-status">Chọn dịch vụ và ngày</span>
      </button>
    `).join("");

    res.send(layout("Đặt lịch hẹn", `
      <div class="page-heading">
        <span class="section-kicker">BẠN XỨNG ĐÁNG ĐƯỢC CHĂM SÓC</span>
        <h1>Đặt lịch hẹn</h1>
        <p>Chọn dịch vụ, tìm ngày và khung giờ còn trống, rồi nhập thông tin khách hàng.</p>
      </div>

      <form action="/book" method="POST"
        class="booking-form">

        <p class="booking-guidance" id="booking-guidance"
          role="status" aria-live="polite" hidden></p>

        <label class="form-field">Họ và tên
          <input type="text" name="full_name"
            required maxlength="150"
            aria-describedby="full-name-error"
            autocomplete="name" placeholder="Tên của bạn">
          <span class="field-error" id="full-name-error"
            aria-live="polite" hidden></span>
        </label>

        <label class="form-field">Số điện thoại
          <input type="tel" name="phone"
            required maxlength="20"
            inputmode="numeric"
            aria-describedby="phone-error"
            autocomplete="tel" placeholder="Ví dụ: 0901234567">
          <span class="field-error" id="phone-error"
            aria-live="polite" hidden></span>
        </label>

        <label class="form-field">Email <span class="optional">(không bắt buộc)</span>
          <input type="email" name="email"
            maxlength="150" autocomplete="email"
            placeholder="ban@example.com">
        </label>

        <label class="form-field">Dịch vụ
          <select name="service_id" id="booking-service" required>
            <option value="">-- Chọn dịch vụ --</option>
            ${serviceOptions}
          </select>
        </label>

        <label class="form-field">Ngày hẹn
          <input type="date" name="appointment_date" id="booking-date"
            min="${new Date().toLocaleDateString("en-CA", {timeZone:"Asia/Ho_Chi_Minh"})}"
            value="${escapeHtml(selectedDate)}"
            required>
        </label>

        <div class="form-field">
          <span>Khung giờ</span>
          <select name="time_slot_id" id="booking-time-slot" required
            class="availability-select" aria-label="Chọn khung giờ">
            <option value="">-- Chọn khung giờ --</option>
            ${slotOptions}
          </select>
          <div class="availability-grid" aria-label="Tình trạng khung giờ">
            ${slotButtons || '<p class="dashboard-empty">Hiện chưa có khung giờ nào.</p>'}
          </div>
        </div>

        <p id="slot-message" role="status" aria-live="polite"
          class="notice notice-error" hidden></p>
        <p id="availability-status" class="availability-status"
          role="status" aria-live="polite">
          Chọn dịch vụ và ngày để xem khung giờ còn trống.
        </p>

        <div class="form-footer">
          <span>Thông tin của bạn được sử dụng để xác nhận lịch hẹn.</span>
          <button type="submit" class="btn" id="booking-confirm"
            name="confirm_booking" value="yes">
            Xác nhận đặt lịch <span aria-hidden="true">→</span>
          </button>
        </div>

      </form>

<script>
  const serviceSelect = document.querySelector(
    "#booking-service"
  );

  const dateInput = document.querySelector(
    "#booking-date"
  );

  const slotSelect = document.querySelector(
    "#booking-time-slot"
  );

  const message = document.getElementById("slot-message");
  const availabilityStatus = document.getElementById("availability-status");
  const submitButton = document.getElementById("booking-confirm");
  const slotButtons = Array.from(
    document.querySelectorAll(".availability-slot")
  );
  let availabilityVersion = 0;
  let availabilityReady = false;
  let selectedSlotAvailable = false;
  submitButton.disabled = true;

  function persistBookingSelection() {
    const url = new URL(window.location.href);
    const selections = {
      service_id: serviceSelect.value,
      appointment_date: dateInput.value,
      time_slot_id: slotSelect.value
    };
    Object.entries(selections).forEach(([key, value]) => {
      if (value) url.searchParams.set(key, value);
      else url.searchParams.delete(key);
    });
    history.replaceState(null, "", url.pathname + url.search + url.hash);
  }

  function selectSlot(slotId) {
    const button = slotButtons.find(item =>
      item.dataset.slotId === String(slotId)
    );
    if (!button || button.disabled) return;

    slotSelect.value = String(slotId);
    slotButtons.forEach(item => {
      const selected = item === button;
      item.classList.toggle("is-selected", selected);
      item.setAttribute("aria-pressed", String(selected));
    });
    selectedSlotAvailable = true;
    submitButton.disabled = false;
    message.hidden = true;
    message.textContent = "";
    availabilityStatus.textContent =
      "Đã chọn " +
      button.querySelector(".availability-slot-time").textContent.trim() +
      ". Bạn có thể tiếp tục.";
    persistBookingSelection();
  }

  async function refreshAvailability() {
    const version = ++availabilityVersion;
    const serviceId = serviceSelect.value;
    const date = dateInput.value;
    const previouslySelectedSlot = slotSelect.value;
    availabilityReady = false;
    selectedSlotAvailable = false;
    submitButton.disabled = true;
    message.hidden = true;
    message.textContent = "";

    if (!serviceId || !date) {
      Array.from(slotSelect.options).forEach(option => {
        option.disabled = Boolean(option.value);
      });
      slotButtons.forEach(button => {
        button.disabled = true;
        button.classList.remove("is-selected", "is-unavailable");
        button.setAttribute("aria-pressed", "false");
        button.querySelector(".availability-slot-status").textContent =
          !serviceId ? "Chọn dịch vụ trước" : "Chọn ngày trước";
      });
      availabilityStatus.textContent =
        "Chọn dịch vụ và ngày để xem khung giờ còn trống.";
      return;
    }

    availabilityStatus.textContent = "Đang kiểm tra khung giờ còn trống…";
    Array.from(slotSelect.options).forEach(option => {
      option.disabled = Boolean(option.value);
    });
    slotButtons.forEach(button => {
      button.disabled = true;
      button.classList.remove("is-selected", "is-unavailable");
      button.setAttribute("aria-pressed", "false");
      button.querySelector(".availability-slot-status").textContent =
        "Đang kiểm tra…";
    });

    try {
      const availability = await Promise.all(slotButtons.map(async button => {
        const params = new URLSearchParams({
          date,
          slot_id: button.dataset.slotId,
          service_id: serviceId
        });
        const response = await fetch("/api/check-slot?" + params.toString());
        if (!response.ok) {
          throw new Error("Không kiểm tra được tình trạng khung giờ");
        }
        const result = await response.json();
        return { button, booked: result.booked };
      }));

      if (version !== availabilityVersion) return;

      availability.forEach(({ button, booked }) => {
        button.disabled = booked;
        const option = Array.from(slotSelect.options).find(item =>
          item.value === button.dataset.slotId
        );
        if (option) option.disabled = booked;
        button.classList.toggle("is-unavailable", booked);
        button.querySelector(".availability-slot-status").textContent =
          booked ? "Đã có lịch" : "Còn trống";
      });
      availabilityReady = true;

      const currentSelection = availability.find(({ button }) =>
        button.dataset.slotId === previouslySelectedSlot
      );
      if (currentSelection && !currentSelection.booked) {
        selectSlot(previouslySelectedSlot);
      } else {
        slotSelect.value = "";
        persistBookingSelection();
        submitButton.disabled = true;
        availabilityStatus.textContent =
          availability.every(({ booked }) => booked)
            ? "Ngày này đã kín lịch. Vui lòng chọn ngày khác."
            : "Chọn một khung giờ còn trống để tiếp tục.";
      }
    } catch (error) {
      if (version !== availabilityVersion) return;
      console.error("Không thể kiểm tra khung giờ:", error);
      availabilityReady = false;
      selectedSlotAvailable = false;
      submitButton.disabled = true;
      slotButtons.forEach(button => {
        button.disabled = true;
        const option = Array.from(slotSelect.options).find(item =>
          item.value === button.dataset.slotId
        );
        if (option) option.disabled = true;
        button.querySelector(".availability-slot-status").textContent =
          "Không kiểm tra được";
      });
      availabilityStatus.textContent =
        "Không thể kiểm tra khung giờ. Vui lòng thử lại.";
    }
  }

  slotButtons.forEach(button => {
    button.addEventListener("click", () => selectSlot(button.dataset.slotId));
  });
  serviceSelect.addEventListener("change", () => {
    persistBookingSelection();
    refreshAvailability();
  });
  dateInput.addEventListener("change", () => {
    persistBookingSelection();
    refreshAvailability();
  });
  slotSelect.addEventListener("change", () => {
    const selected = slotButtons.find(button =>
      button.dataset.slotId === slotSelect.value
    );
    if (selected && !selected.disabled) {
      selectSlot(selected.dataset.slotId);
    }
  });
  window.isSelectedSlotAvailable = () =>
    availabilityReady && selectedSlotAvailable;
  window.isBookingAvailabilityReady = () => availabilityReady;
  refreshAvailability();
</script>

    `));

  } catch (error) {
    console.error("Lỗi trang đặt lịch:", error);
    res.status(500).send(
      layout("Lỗi", "<p>Không thể tải biểu mẫu đặt lịch.</p>")
    );
  }
});

 // Xử lý khi khách hàng xác nhận đặt lịch
app.post("/book", async (req, res) => {
  const confirmationRequested = req.body.confirm_booking === "yes";
  const fullName = String(req.body.full_name || "").trim();
  const phone = String(req.body.phone || "");
  const email = String(req.body.email || "").trim();
  const serviceId = Number(req.body.service_id);
  const slotId = Number(req.body.time_slot_id);
  const appointmentDate = String(req.body.appointment_date || "");
  const normalizedFullName = fullName.normalize("NFC");
  const fullNameValid =
    /^\p{Lu}\p{Ll}*(?:\s+\p{Lu}\p{Ll}*)*$/u.test(normalizedFullName) &&
    normalizedFullName.length <= 150;
  const phoneValid = /^0\d{9}$/.test(phone);

  const today = new Date().toLocaleDateString("en-CA", {
    timeZone: "Asia/Ho_Chi_Minh"
  });

  if (
    !confirmationRequested ||
    !fullNameValid ||
    !phoneValid ||
    email.length > 150 ||
    (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) ||
    !Number.isSafeInteger(serviceId) || serviceId <= 0 ||
    !Number.isSafeInteger(slotId) || slotId <= 0 ||
    !/^\d{4}-\d{2}-\d{2}$/.test(appointmentDate) ||
    !Number.isFinite(Date.parse(appointmentDate)) ||
    new Date(appointmentDate).toISOString().slice(0, 10) !== appointmentDate ||
    appointmentDate < today
  ) {
    return res.status(400).send(layout("Thông tin không hợp lệ", `
      <h2>Thông tin đặt lịch không hợp lệ</h2>
      ${!confirmationRequested ? `
        <p class="error">Vui lòng xem lại thông tin và bấm “Xác nhận đặt lịch” để tiếp tục.</p>
      ` : ""}
      ${!fullNameValid ? `
        <p class="error">Vui lòng viết hoa chữ cái đầu của mỗi từ trong họ và tên.</p>
      ` : ""}
      ${!phoneValid ? `
        <p class="error">Số điện thoại phải có 10 chữ số và bắt đầu bằng số 0.</p>
      ` : ""}
      ${confirmationRequested && fullNameValid && phoneValid ? `
        <p>Vui lòng kiểm tra lại thông tin.</p>
      ` : ""}
      <a class="btn" href="/book">Quay lại</a>
    `));
  }

  let client;

  try {
    client = await pool.connect();
    await client.query("BEGIN");

    const service = await client.query(
      "SELECT id, name, price FROM services WHERE id = $1",
      [serviceId]
    );

    const slot = await client.query(
      "SELECT id, start_time, end_time FROM time_slots WHERE id = $1",
      [slotId]
    );

    if (
      service.rowCount === 0 ||
      service.rows[0].name.trim().toLocaleLowerCase("vi") ===
        "tư vấn khách hàng" ||
      slot.rowCount === 0
    ) {
      await client.query("ROLLBACK");
      return res.status(400).send(layout("Lỗi", `
        <p class="error">Dịch vụ hoặc khung giờ không tồn tại.</p>
        <a class="btn" href="/book">Quay lại</a>
      `));
    }

    const existingAppointment = await client.query(
      `SELECT 1 FROM appointments
       WHERE appointment_date = $1
       AND time_slot_id = $2
       AND service_id = $3
       AND status IN ('pending', 'confirmed')
       LIMIT 1`,
      [appointmentDate, slotId, serviceId]
    );
    if (existingAppointment.rowCount > 0) {
      await client.query("ROLLBACK");
      return res.status(409).send(layout("Trùng lịch hẹn", `
        <section class="booking-conflict">
          <div class="conflict-icon" aria-hidden="true">!</div>
          <span class="section-kicker">VUI LÒNG CHỌN LẠI THỜI GIAN</span>
          <h1>Khung giờ vừa được đặt</h1>
          <p class="conflict-message">
            Khung giờ này không còn trống. Thông tin khách hàng chưa được lưu.
            Vui lòng chọn ngày hoặc giờ khác rồi xác nhận lại.
          </p>
          <a class="btn" href="/book?service_id=${encodeURIComponent(serviceId)}&appointment_date=${encodeURIComponent(appointmentDate)}#time-slot-step">
            Chọn khung giờ khác <span aria-hidden="true">→</span>
          </a>
        </section>
      `));
    }

    const customer = await client.query(
      `INSERT INTO customers (full_name, phone, email)
       VALUES ($1, $2, $3)
       RETURNING id`,
      [fullName, phone, email || null]
    );

    const appointment = await client.query(
      `INSERT INTO appointments
       (customer_id, service_id, time_slot_id, appointment_date, status)
       VALUES ($1, $2, $3, $4, 'pending')
       RETURNING id`,
      [customer.rows[0].id, serviceId, slotId, appointmentDate]
    );

    await client.query("COMMIT");

    res.status(201).send(layout("Đặt lịch thành công", `
      <section class="confirmation">
        <div class="confirmation-icon" aria-hidden="true">✓</div>
        <span class="section-kicker">CẢM ƠN BẠN ĐÃ TIN TƯỞNG</span>
        <h1>Đặt lịch thành công!</h1>
        <p class="confirmation-lead">Cuộc hẹn của bạn đã được ghi nhận. Hẹn gặp bạn sớm nhé.</p>
        <div class="confirmation-details">
          <div><span>Mã lịch hẹn</span><strong>#${appointment.rows[0].id}</strong></div>
          <div><span>Khách hàng</span><strong>${escapeHtml(fullName)}</strong></div>
          <div><span>Dịch vụ</span><strong>${escapeHtml(service.rows[0].name)}</strong></div>
          <div><span>Ngày hẹn</span><strong>${escapeHtml(appointmentDate)}</strong></div>
          <div><span>Khung giờ</span><strong>${escapeHtml(String(slot.rows[0].start_time).slice(0, 5))} – ${escapeHtml(String(slot.rows[0].end_time).slice(0, 5))}</strong></div>
          <div><span>Trạng thái</span><strong class="status-pending">Đã tiếp nhận</strong></div>
        </div>
        <a class="btn" href="/">Về trang chủ <span aria-hidden="true">→</span></a>
      </section>
    `));
  } catch (error) {
    if (client) {
      await client.query("ROLLBACK").catch(console.error);
    }
    
if (error.code === "23505" &&
    error.constraint === "uq_appointments_active_slot") {
  return res.status(409).send(layout("Trùng lịch hẹn", `
    <section class="booking-conflict">
      <div class="conflict-icon" aria-hidden="true">!</div>
      <span class="section-kicker">VUI LÒNG CHỌN LẠI THỜI GIAN</span>
      <h1>Khung giờ đã được đặt</h1>
      <p class="conflict-message">
        Ngày và khung giờ bạn chọn đã có người đặt lịch.
        Vui lòng chọn khung giờ khác.
      </p>
      <a class="btn" href="/book?service_id=${encodeURIComponent(serviceId)}&appointment_date=${encodeURIComponent(appointmentDate)}#time-slot-step">Chọn lại lịch hẹn <span aria-hidden="true">→</span></a>
    </section>
  `));
}

    console.error("Lỗi lưu lịch hẹn:", error);

    res.status(500).send(layout("Lỗi", `
      <p class="error">Không thể lưu lịch hẹn.</p>
      <a class="btn" href="/book">Thử lại</a>
    `));
  } finally {
    if (client) client.release();
  }
});


app.get("/api/check-slot", async (req, res) => {
  try {
    const { date, slot_id, service_id } = req.query;

    const slotId = Number(slot_id);
    const serviceId = Number(service_id);

    if (
      typeof date !== "string" ||
      !/^\d{4}-\d{2}-\d{2}$/.test(date) ||
      !Number.isSafeInteger(slotId) ||
      slotId <= 0 ||
      !Number.isSafeInteger(serviceId) ||
      serviceId <= 0
    ) {
      return res.status(400).json({
        error: "Thông tin đặt lịch không hợp lệ"
      });
    }

    const result = await pool.query(
      `SELECT 1 FROM appointments
       WHERE appointment_date = $1
       AND time_slot_id = $2
       AND service_id = $3
       AND status IN ('pending', 'confirmed')
       LIMIT 1`,
      [date, slotId, serviceId]
    );

    res.json({ booked: result.rowCount > 0 });

  } catch (error) {
    console.error("Lỗi kiểm tra lịch:", error);

    res.status(500).json({
      error: "Không thể kiểm tra lịch hẹn"
    });
  }
});

// Khởi động hệ thống đặt lịch hẹn
app.listen(PORT, "0.0.0.0", () => {
  console.log(`Hệ thống đặt lịch hẹn đang chạy tại cổng ${PORT}`);
});
    