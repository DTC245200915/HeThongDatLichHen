
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

// Giao diện chung
function layout(title, content) {
  return `
    <!DOCTYPE html>
    <html lang="vi">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport"
        content="width=device-width, initial-scale=1.0">
      <title>${title} - Hệ thống Đặt lịch hẹn</title>
      <style>
        * { box-sizing: border-box; }

        body {
          font-family: Arial, sans-serif;
          background: #fff1f2;
          margin: 0;
          color: #881337;
        }

        header {
          background: #fff;
          padding: 22px;
          text-align: center;
          border-bottom: 1px solid #fecdd3;
        }

        h1 { color: #e11d48; }

        nav {
          background: #fb7185;
          padding: 15px;
          text-align: center;
        }

        nav a {
          color: white;
          text-decoration: none;
          margin: 0 15px;
          font-weight: bold;
        }

        nav a:hover { text-decoration: underline; }

        .container {
          background: white;
          max-width: 1000px;
          margin: 35px auto;
          padding: 30px;
          border-radius: 18px;
          box-shadow: 0 8px 25px rgba(225,29,72,.08);
        }

        h2 { color: #e11d48; }

        .intro {
          text-align: center;
          line-height: 1.8;
        }

        .cards {
          display: grid;
          grid-template-columns:
            repeat(auto-fit, minmax(220px, 1fr));
          gap: 18px;
          margin-top: 25px;
        }

        .card {
          border: 1px solid #fecdd3;
          border-radius: 14px;
          padding: 22px;
          background: #fff7f8;
        }

        .card h3 {
          color: #be123c;
          margin-top: 0;
        }

        .price {
          color: #e11d48;
          font-weight: bold;
          font-size: 19px;
        }

        .btn {
          display: inline-block;
          background: #fb7185;
          color: white;
          border: none;
          padding: 12px 22px;
          border-radius: 10px;
          text-decoration: none;
          cursor: pointer;
          font-weight: bold;
        }

        .btn:hover { background: #e11d48; }

        table {
          width: 100%;
          border-collapse: collapse;
          margin-top: 20px;
        }

        th, td {
          border: 1px solid #fecdd3;
          padding: 13px;
          text-align: left;
        }

        th {
          background: #ffe4e6;
          color: #9f1239;
        }

        tr:nth-child(even) { background: #fff7f8; }

        .table-wrap { overflow-x: auto; }

        .error {
          color: #be123c;
          background: #ffe4e6;
          padding: 15px;
          border-radius: 10px;
        }

        footer {
          text-align: center;
          color: #9f5365;
          padding: 25px;
        }

        @media (max-width: 600px) {
          nav a {
            display: inline-block;
            margin: 7px;
          }

          .container {
            margin: 15px;
            padding: 20px;
          }
        }
      </style>
    </head>
    <body>
      <header>
        <h1>HỆ THỐNG ĐẶT LỊCH HẸN</h1>
        <p>Đặt lịch nhanh chóng - Quản lý dễ dàng</p>
      </header>

      <nav>
        <a href="/">Trang chủ</a>
        <a href="/services">Dịch vụ</a>
        <a href="/time-slots">Khung giờ</a>
        <a href="/appointments">Lịch hẹn</a>
      </nav>

      <main class="container">${content}</main>

      <footer>
        Hệ thống Đặt lịch hẹn © 2026
      </footer>
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

// Trang chủ
app.get("/", (req, res) => {
  res.send(layout("Trang chủ", `
    <div class="intro">
      <h2>Chào mừng đến với hệ thống!</h2>
      <p>
        Quản lý dịch vụ, khung giờ, khách hàng
        và lịch hẹn một cách thuận tiện.
      </p>
      
       <a class="btn" href="/book">
  Đặt lịch hẹn ngay
</a>

<a class="btn" href="/services">
  Xem dịch vụ
</a>
    </div>
  `));
});

// Danh sách dịch vụ từ PostgreSQL
app.get("/services", async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT * FROM services ORDER BY id"
    );

    const cards = result.rows.map(service => `
      <div class="card">
        <h3>${escapeHtml(service.name)}</h3>
        <p>${escapeHtml(service.description)}</p>
        <p class="price">
          ${Number(service.price).toLocaleString("vi-VN")} đ
        </p>
        <a class="btn" href="/time-slots">
          Xem khung giờ
        </a>
      </div>
    `).join("");

    res.send(layout("Dịch vụ", `
      <h2>Danh sách dịch vụ</h2>
      <p>Các dịch vụ hiện có trong hệ thống.</p>
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

    const rows = result.rows.map(slot => `
      <tr>
        <td>${slot.id}</td>
        <td>${escapeHtml(slot.start_time)}</td>
        <td>${escapeHtml(slot.end_time)}</td>
      </tr>
    `).join("");

    res.send(layout("Khung giờ", `
      <h2>Danh sách khung giờ</h2>
      <div class="table-wrap">
        <table>
          <thead>
            <tr>
              <th>STT</th>
              <th>Giờ bắt đầu</th>
              <th>Giờ kết thúc</th>
            </tr>
          </thead>
          <tbody>${rows}</tbody>
        </table>
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

    const rows = result.rows.map(a => `
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
        <td>${escapeHtml(a.status)}</td>
      </tr>
    `).join("");

    res.send(layout("Lịch hẹn", `
      <h2>Danh sách lịch hẹn</h2>
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
      "SELECT id, name FROM services ORDER BY id"
    );

    const slots = await pool.query(
      "SELECT id, start_time, end_time FROM time_slots ORDER BY start_time"
    );

    const serviceOptions = services.rows.map(s => `
      <option value="${s.id}">
        ${escapeHtml(s.name)}
      </option>
    `).join("");

    const slotOptions = slots.rows.map(t => `
      <option value="${t.id}">
        ${escapeHtml(t.start_time)} - ${escapeHtml(t.end_time)}
      </option>
    `).join("");

    res.send(layout("Đặt lịch hẹn", `
      <h2>Đặt lịch hẹn</h2>
      <p>Vui lòng điền thông tin để đăng ký lịch hẹn.</p>

      <form action="/book" method="POST"
        style="display:grid;gap:16px;max-width:550px;">

        <label>Họ và tên
          <input type="text" name="full_name"
            required maxlength="150"
            style="width:100%;padding:12px;">
        </label>

        <label>Số điện thoại
          <input type="tel" name="phone"
            required maxlength="20"
            style="width:100%;padding:12px;">
        </label>

        <label>Email
          <input type="email" name="email"
            maxlength="150"
            style="width:100%;padding:12px;">
        </label>

        <label>Dịch vụ
          <select name="service_id" required
            style="width:100%;padding:12px;">
            <option value="">-- Chọn dịch vụ --</option>
            ${serviceOptions}
          </select>
        </label>

        <label>Ngày hẹn
          <input type="date" name="appointment_date"
            min="${new Date().toLocaleDateString("en-CA", {timeZone:"Asia/Ho_Chi_Minh"})}"
            required
            style="width:100%;padding:12px;">
        </label>

        <label>Khung giờ
          <select name="time_slot_id" required
            style="width:100%;padding:12px;">
            <option value="">-- Chọn khung giờ --</option>
            ${slotOptions}
          </select>
        </label>

<p id="slot-message"
   role="status"
   aria-live="polite"
   style="display:none;color:#e11d48;
   background:#ffe4e6;padding:12px;
   border-radius:10px;font-weight:bold;">
</p>

        <button type="submit" class="btn">
          Xác nhận đặt lịch
        </button>

      </form>

<script>
  const serviceSelect = document.querySelector(
    'select[name="service_id"]'
  );

  const dateInput = document.querySelector(
    'input[name="appointment_date"]'
  );

  const slotSelect = document.querySelector(
    'select[name="time_slot_id"]'
  );

  const message = document.getElementById("slot-message");

  const submitButton = document.querySelector(
    'form[action="/book"] button[type="submit"]'
  );

  let checkVersion = 0;

  async function checkSlot() {
    const version = ++checkVersion;

    const serviceId = serviceSelect.value;
    const date = dateInput.value;
    const slotId = slotSelect.value;

    message.style.display = "none";
    message.textContent = "";

    if (!serviceId || !date || !slotId) {
      submitButton.disabled = false;
      return;
    }

    submitButton.disabled = true;

    try {
      const params = new URLSearchParams({
        date: date,
        slot_id: slotId,
        service_id: serviceId
      });

      const response = await fetch(
        "/api/check-slot?" + params.toString()
      );

      if (!response.ok) {
        throw new Error("Không kiểm tra được lịch");
      }

      const data = await response.json();

      if (version !== checkVersion) return;

      if (data.booked) {
        message.textContent =
          "Dịch vụ này đã có người đặt vào khung giờ bạn chọn. Vui lòng chọn giờ khác!";

        message.style.display = "block";
        submitButton.disabled = true;
      } else {
        message.style.display = "none";
        submitButton.disabled = false;
      }

    } catch (error) {
      if (version !== checkVersion) return;

      message.textContent =
        "Không thể kiểm tra lịch hẹn. Vui lòng thử lại.";

      message.style.display = "block";
      submitButton.disabled = true;
    }
  }

  serviceSelect.addEventListener("change", checkSlot);
  dateInput.addEventListener("change", checkSlot);
  slotSelect.addEventListener("change", checkSlot);

  checkSlot();
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
  const fullName = String(req.body.full_name || "").trim();
  const phone = String(req.body.phone || "").trim();
  const email = String(req.body.email || "").trim();
  const serviceId = Number(req.body.service_id);
  const slotId = Number(req.body.time_slot_id);
  const appointmentDate = String(req.body.appointment_date || "");

  const today = new Date().toLocaleDateString("en-CA", {
    timeZone: "Asia/Ho_Chi_Minh"
  });

  if (
    !fullName || fullName.length > 150 ||
    !/^[0-9+().\s-]{9,20}$/.test(phone) ||
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
      <p>Vui lòng kiểm tra lại thông tin.</p>
      <a class="btn" href="/book">Quay lại</a>
    `));
  }

  let client;

  try {
    client = await pool.connect();
    await client.query("BEGIN");

    const service = await client.query(
      "SELECT id FROM services WHERE id = $1",
      [serviceId]
    );

    const slot = await client.query(
      "SELECT id FROM time_slots WHERE id = $1",
      [slotId]
    );

    if (service.rowCount === 0 || slot.rowCount === 0) {
      await client.query("ROLLBACK");
      return res.status(400).send(layout("Lỗi", `
        <p class="error">Dịch vụ hoặc khung giờ không tồn tại.</p>
        <a class="btn" href="/book">Quay lại</a>
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
      <div class="intro">
        <h2>Đặt lịch thành công!</h2>
        <p>Mã lịch hẹn: <strong>${appointment.rows[0].id}</strong></p>
        <p>Khách hàng: ${escapeHtml(fullName)}</p>
        <p>Ngày hẹn: ${escapeHtml(appointmentDate)}</p>
        <p>Trạng thái: Chờ xác nhận</p>
        <a class="btn" href="/">Về trang chủ</a>
      </div>
    `));
  } catch (error) {
    if (client) {
      await client.query("ROLLBACK").catch(console.error);
    }
    
if (error.code === "23505" &&
    error.constraint === "uq_appointments_active_slot") {
  return res.status(409).send(layout("Trùng lịch hẹn", `
    <div class="intro">
      <h2>Khung giờ đã được đặt!</h2>
      <p>
        Ngày và khung giờ bạn chọn đã có người đặt lịch.
        Vui lòng chọn khung giờ khác.
      </p>
      <a class="btn" href="/book">Chọn lại lịch hẹn</a>
    </div>
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
    