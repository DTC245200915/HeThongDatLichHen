# HỆ THỐNG ĐẶT LỊCH HẸN (APPOINTMENT SYSTEM)

## 1. Giới thiệu

Hệ thống Đặt lịch hẹn là ứng dụng web cho phép người dùng lựa chọn dịch vụ, ngày và khung giờ để đăng ký lịch hẹn trực tuyến.

Dự án được xây dựng phục vụ học phần **Triển khai và Quản trị Hệ thống Phần mềm**, với mục tiêu triển khai ứng dụng bằng Docker Compose, quản lý cơ sở dữ liệu, cấu hình reverse proxy, giám sát hệ thống và thu thập log tập trung.

**Đề tài:** Đề 40 – Hệ thống Đặt lịch hẹn.

## 2. Công nghệ sử dụng

| Thành phần | Công nghệ |
|---|---|
| Ứng dụng web | Node.js, Express |
| Giao diện | HTML, CSS, JavaScript |
| Cơ sở dữ liệu | PostgreSQL 16 |
| Quản lý cơ sở dữ liệu | pgAdmin 4 |
| Đóng gói và triển khai | Docker, Docker Compose |
| Reverse Proxy | Nginx |
| Giám sát | Prometheus, Grafana |
| Giám sát container | cAdvisor |
| Giám sát PostgreSQL | PostgreSQL Exporter |
| Thu thập log | Promtail |
| Lưu trữ và truy vấn log | Loki |
| Quản lý mã nguồn | Git, GitHub |

## 3. Chức năng hệ thống

- Hiển thị danh sách dịch vụ đặt lịch.
- Cho phép người dùng chọn ngày và khung giờ.
- Nhập thông tin để đăng ký lịch hẹn.
- Kiểm tra lịch đã được đặt, hạn chế trùng lịch.
- Lưu trữ thông tin lịch hẹn trong PostgreSQL.
- Hiển thị thông báo xác nhận sau khi đặt lịch thành công.
- Giám sát ứng dụng, container và cơ sở dữ liệu.
- Thu thập, tìm kiếm và lọc log bằng Grafana Loki.

## 4. Kiến trúc hệ thống

```text
Người dùng
    |
    v
Nginx Reverse Proxy
    |
    v
Node.js + Express
    |
    v
PostgreSQL
    |
    +---- pgAdmin

Hệ thống giám sát:
Prometheus <--- Ứng dụng / cAdvisor / PostgreSQL Exporter
    |
    v
Grafana

Hệ thống log:
Docker Containers
    |
    v
Promtail
    |
    v
Loki
    |
    v
Grafana Explore
```

## 5. Cấu trúc thư mục

```text
HeThongDatLichHen/
├── app/
│   ├── public/
│   ├── Dockerfile
│   ├── package.json
│   ├── package-lock.json
│   └── server.js
├── monitoring/
│   ├── prometheus/
│   │   └── prometheus.yml
│   └── promtail/
│       └── promtail-config.yml
├── docker-compose.yml
├── .env
└── README.md
```

Lưu ý: File `.env` chứa các thông tin cấu hình riêng và không được đưa lên GitHub.

## 6. Hướng dẫn triển khai

### Bước 1: Yêu cầu môi trường

- Cài đặt Docker Desktop.
- Cài đặt Git.
- Sử dụng VS Code hoặc Terminal để chạy lệnh.

### Bước 2: Tải mã nguồn

```bash
git clone https://github.com/dtc245200915/HeThongDatLichHen.git
cd HeThongDatLichHen
```

### Bước 3: Cấu hình môi trường

Tạo file `.env` tại thư mục gốc của dự án và khai báo các biến môi trường được sử dụng trong `docker-compose.yml`.

Sử dụng mật khẩu mạnh cho PostgreSQL, pgAdmin và Grafana. Không công khai file `.env` hoặc mật khẩu thật.

### Bước 4: Khởi động hệ thống

```bash
docker compose up -d --build
```

### Bước 5: Kiểm tra container

```bash
docker compose ps
```

### Bước 6: Kiểm tra cấu hình Docker Compose

```bash
docker compose config --quiet
```


## 7. Địa chỉ truy cập

| Dịch vụ | Địa chỉ |
|---|---|
| Website qua Nginx | http://localhost:8085 |
| Ứng dụng Node.js | http://localhost:3005 |
| pgAdmin | http://localhost:5050 |
| Prometheus | http://localhost:9091 |
| Grafana | http://localhost:3006 |

Các địa chỉ trên áp dụng cho môi trường triển khai cục bộ đã cấu hình.

## 8. Giám sát bằng Prometheus và Grafana

Prometheus được cấu hình để thu thập chỉ số từ các thành phần hệ thống.

Grafana được sử dụng để trực quan hóa thông tin giám sát thông qua dashboard.

Các nội dung giám sát gồm:

- Trạng thái hoạt động của các dịch vụ.
- Mức sử dụng CPU của container.
- Mức sử dụng bộ nhớ RAM.
- Chỉ số ứng dụng và cơ sở dữ liệu theo cấu hình thu thập.

Ví dụ truy vấn PromQL:

```promql
up
```

## 9. Thu thập log bằng Loki và Promtail

Promtail thu thập log từ các Docker container và gửi đến Loki.

Grafana sử dụng Loki Data Source để tìm kiếm và phân tích log.

### Truy vấn LogQL 1: Xem toàn bộ log ứng dụng

```logql
{container="appointment-app"}
```

### Truy vấn LogQL 2: Lọc log khởi động ứng dụng

```logql
{container="appointment-app"} |= "Hệ thống"
```

### Truy vấn LogQL 3: Tìm log lỗi hoặc tín hiệu dừng

```logql
{container="appointment-app"} |~ "(?i)error|sigterm"
```

Cả ba truy vấn đã được thực hiện và kiểm tra trên Grafana Explore.

## 10. Bảo mật hệ thống

Các nội dung bảo mật cần được áp dụng và kiểm tra khi triển khai:

- Sử dụng biến môi trường để cấu hình mật khẩu.
- Không đưa file `.env` lên GitHub.
- Phân tách các dịch vụ bằng Docker Compose.
- Hạn chế công khai những cổng không cần thiết.
- Sử dụng Nginx Reverse Proxy để điều hướng truy cập.
- Cấu hình security headers hoặc HTTPS cho Nginx.
- Hạn chế quyền của container và tài khoản cơ sở dữ liệu khi có thể.

**Lưu ý:** Một số biện pháp hardening cần được kiểm chứng riêng trước khi xác nhận hoàn thành trong báo cáo.

## 11. Quản lý mã nguồn

Mã nguồn và các file cấu hình được quản lý bằng Git và GitHub.

Repository:

https://github.com/dtc245200915/HeThongDatLichHen

Các nhóm thay đổi chính gồm:

- Xây dựng ứng dụng và cơ sở dữ liệu.
- Triển khai Docker Compose và Nginx.
- Tích hợp Prometheus, Grafana.
- Tích hợp Loki, Promtail và truy vấn LogQL.

## 12. Kết quả triển khai

Hệ thống đã được chạy trên Docker Desktop với các thành phần ứng dụng web, PostgreSQL, pgAdmin, Nginx, Prometheus, Grafana, Loki và Promtail.

Đã kiểm tra khả năng truy cập website, dashboard giám sát và truy vấn log ứng dụng trên Grafana.

## 13. Kết luận

Dự án giúp thực hành quy trình triển khai và quản trị một ứng dụng web sử dụng Docker Compose, từ quản lý cơ sở dữ liệu, reverse proxy đến giám sát hiệu năng và quản lý log tập trung.

Hệ thống có thể tiếp tục được cải tiến về giao diện, bảo mật, tính năng quản lý lịch hẹn và khả năng vận hành.