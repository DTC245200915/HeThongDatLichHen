
# HỆ THỐNG ĐẶT LỊCH HẸN (APPOINTMENT SYSTEM)
 

---

## 1. Giới thiệu

Hệ thống Đặt lịch hẹn – HẸN XINH là ứng dụng web cho phép người dùng lựa chọn dịch vụ, ngày và khung giờ để đăng ký lịch hẹn trực tuyến.

Dự án được xây dựng phục vụ học phần **Triển khai và Quản trị Hệ thống Phần mềm**, với mục tiêu triển khai ứng dụng bằng Docker Compose, quản lý cơ sở dữ liệu, cấu hình Nginx Reverse Proxy, giám sát hệ thống và thu thập log tập trung.

**Đề tài:** Đề 40 – Hệ thống Đặt lịch hẹn.

Các thành phần của hệ thống được triển khai bằng Docker Compose, thuận tiện cho việc khởi động, quản lý và kiểm tra khi demo.

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
- Cho phép người dùng lựa chọn ngày và khung giờ.
- Nhập thông tin khách hàng để đăng ký lịch hẹn.
- Kiểm tra lịch đã được đặt, hạn chế trùng lịch.
- Lưu trữ thông tin lịch hẹn trong PostgreSQL.
- Hiển thị thông báo sau khi gửi yêu cầu đặt lịch thành công.
- Giám sát ứng dụng, container và cơ sở dữ liệu.
- Thu thập, tìm kiếm và lọc log bằng Grafana Loki.

**Lưu ý:** Lịch hẹn được lưu ở trạng thái `pending`. Phiên bản hiện tại chưa có quy trình duyệt lịch riêng để chuyển sang `confirmed`.

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

Ứng dụng / cAdvisor / PostgreSQL Exporter
    |
    v
Prometheus
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

Hệ thống sử dụng hai mạng Docker:

- `frontend`: Kết nối các thành phần cần giao tiếp trong hệ thống.
- `backend`: Mạng nội bộ, sử dụng cấu hình `internal: true` để tăng cường khả năng cách ly.

## 5. Cấu trúc thư mục

Cấu trúc các thành phần chính:

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
├── .gitignore
├── .env
└── README.md
```

Ngoài ra, dự án còn có các file cấu hình phục vụ Nginx, Grafana và Loki.

**Lưu ý:** File `.env` chứa thông tin cấu hình riêng, được loại khỏi Git và không đưa lên GitHub.

## 6. Hướng dẫn triển khai

### Bước 1: Yêu cầu môi trường

- Cài đặt Docker Desktop.
- Cài đặt Git.
- Sử dụng VS Code hoặc PowerShell để chạy lệnh.
- Đảm bảo Docker Desktop đang hoạt động.

### Bước 2: Tải mã nguồn

```bash
git clone https://github.com/DTC245200915/HeThongDatLichHen.git
cd HeThongDatLichHen
```

### Bước 3: Cấu hình môi trường

Tạo file `.env` tại thư mục gốc dự án và khai báo các biến môi trường theo cấu hình thực tế trong `docker-compose.yml`.

Sử dụng mật khẩu mạnh cho PostgreSQL, pgAdmin và Grafana.

Không công khai file `.env` hoặc mật khẩu thật trên GitHub.

**Lưu ý:** Người triển khai mới cần có các giá trị cấu hình môi trường phù hợp trước khi khởi động hệ thống.

### Bước 4: Khởi động hệ thống

Mở PowerShell tại thư mục dự án và chạy:

```powershell
docker compose up -d --build
```

Lệnh này khởi động các dịch vụ đã được khai báo trong Docker Compose.

### Bước 5: Kiểm tra container

```powershell
docker compose ps
```

Hệ thống đã triển khai gồm 10 container:

1. appointment-app
2. postgres
3. pgadmin
4. nginx
5. prometheus
6. grafana
7. cadvisor
8. postgres-exporter
9. loki
10. promtail

Kiểm tra các dịch vụ cần thiết đang ở trạng thái hoạt động.

### Bước 6: Kiểm tra cấu hình Docker Compose

```powershell
docker compose config --quiet
```

Nếu cấu hình hợp lệ, lệnh có thể kết thúc mà không in thông báo lỗi.

### Bước 7: Khởi động lại hệ thống khi mở máy

Mở Docker Desktop, sau đó mở PowerShell tại thư mục dự án:

```powershell
docker compose up -d
```

Kiểm tra lại:

```powershell
docker compose ps
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

## 8. Kiểm tra Website và PostgreSQL

### 8.1. Kiểm tra website

Truy cập:

http://localhost:8085

Thực hiện:

1. Mở trang chủ HẸN XINH.
2. Chọn một dịch vụ.
3. Chọn ngày và khung giờ còn trống.
4. Nhập thông tin khách hàng.
5. Xác nhận gửi yêu cầu đặt lịch.
6. Kiểm tra thông báo thành công.

### 8.2. Kiểm tra dữ liệu bằng pgAdmin

Truy cập:

http://localhost:5050

Đăng nhập bằng tài khoản đã cấu hình.

Mở cơ sở dữ liệu của hệ thống, chọn Query Tool và chạy:

```sql
SELECT *
FROM appointments
ORDER BY id DESC;
```

Kiểm tra thông tin lịch hẹn đã được lưu.

### 8.3. Kiểm tra chống trùng lịch

Thử chọn lại cùng dịch vụ, ngày và khung giờ đã được đặt.

Hệ thống sẽ phát hiện lịch trùng và không cho phép tiếp tục đặt cùng khung giờ đó.

Cơ sở dữ liệu có chỉ mục duy nhất `uq_appointments_active_slot` nhằm hỗ trợ ngăn chặn lịch trùng ở các trạng thái `pending` và `confirmed`.

## 9. Nginx Reverse Proxy và Security Headers

Nginx được sử dụng làm Reverse Proxy để tiếp nhận yêu cầu HTTP và chuyển tiếp đến ứng dụng Node.js/Express.

Website truy cập qua Nginx tại:

http://localhost:8085

### 9.1. Kiểm tra Nginx Security Headers

Mở PowerShell và chạy:

```powershell
curl.exe -I http://localhost:8085
```

**Lưu ý:** Sử dụng `-I` viết hoa để xem HTTP response headers.

Trong kết quả, kiểm tra các header:

```text
X-Frame-Options: SAMEORIGIN
X-Content-Type-Options: nosniff
Referrer-Policy: strict-origin-when-cross-origin
```

Tên header có thể được hiển thị bằng chữ thường.

### 9.2. Ý nghĩa

- `X-Frame-Options`: Hạn chế nguy cơ clickjacking.
- `X-Content-Type-Options`: Ngăn trình duyệt tự suy đoán kiểu nội dung.
- `Referrer-Policy`: Kiểm soát thông tin nguồn được gửi khi điều hướng.

Hệ thống sử dụng HTTP kết hợp Security Headers cơ bản, đáp ứng phương án được cho phép trong yêu cầu đề thi.

## 10. Giám sát bằng Prometheus và Grafana

Prometheus thu thập chỉ số giám sát từ các thành phần:

- Ứng dụng Node.js/Express.
- cAdvisor.
- PostgreSQL Exporter.
- Prometheus.

### 10.1. Kiểm tra Prometheus

Truy cập:

http://localhost:9091

Mở trang Targets và kiểm tra các mục tiêu giám sát.

Kết quả đã kiểm thử: **4/4 Targets UP**.

Có thể truy vấn PromQL:

```promql
up
```

### 10.2. Kiểm tra PostgreSQL Exporter

Trong Prometheus, truy vấn:

```promql
pg_up
```

Kết quả mong muốn:

```text
1
```

Giá trị `1` thể hiện PostgreSQL Exporter kết nối thành công với cơ sở dữ liệu.

### 10.3. Kiểm tra Grafana

Truy cập:

http://localhost:3006

Đăng nhập bằng tài khoản đã cấu hình.

Mở Dashboard để theo dõi:

- Mức sử dụng CPU.
- Mức sử dụng RAM.
- Chỉ số tài nguyên container.
- Trạng thái ứng dụng và cơ sở dữ liệu.

## 11. Thu thập log bằng Loki và Promtail

Promtail thu thập nhật ký từ các Docker container và gửi đến Loki để lưu trữ tập trung.

Grafana được sử dụng để truy vấn và phân tích log bằng LogQL.

### 11.1. Cách mở LogQL

1. Truy cập http://localhost:3006.
2. Đăng nhập Grafana.
3. Chọn **Explore**.
4. Chọn Data Source **Loki**.
5. Chuyển sang chế độ **Code**.
6. Nhập truy vấn và chọn **Run query**.

### 11.2. Truy vấn LogQL 1: Xem toàn bộ log ứng dụng

```logql
{container="appointment-app"}
```

Mục đích: Hiển thị nhật ký của ứng dụng đặt lịch hẹn.

### 11.3. Truy vấn LogQL 2: Lọc log khởi động ứng dụng

```logql
{container="appointment-app"} |= "Hệ thống"
```

Mục đích: Lọc các dòng log có chứa từ khóa `Hệ thống`.

### 11.4. Truy vấn LogQL 3: Tìm log lỗi hoặc tín hiệu dừng

```logql
{container="appointment-app"} |~ "(?i)error|sigterm"
```

Mục đích: Tìm các dòng log chứa `error` hoặc `sigterm`, không phân biệt chữ hoa và chữ thường.

### 11.5. Lưu ý khi demo

- Nếu không thấy log, thử mở rộng khoảng thời gian, ví dụ Last 24 hours.
- Truy vấn tìm lỗi có thể không trả về kết quả nếu không có log phù hợp trong khoảng thời gian đã chọn.
- Không cần cố tình tạo lỗi để chứng minh LogQL hoạt động.

Cả ba truy vấn đã được kiểm tra trong quá trình triển khai hệ thống.

## 12. Hardening – Các biện pháp bảo mật hệ thống

Hệ thống áp dụng các biện pháp Hardening nhằm hạn chế quyền truy cập và giảm thiểu rủi ro khi vận hành.

### 12.1. Biện pháp 1: Non-root Container

Ứng dụng Node.js chạy bằng tài khoản `node`, không phải tài khoản `root`.

**Lệnh kiểm tra trong PowerShell:**

```powershell
docker exec appointment-app id
```

Kết quả mong muốn:

```text
uid=1000(node) gid=1000(node) groups=1000(node)
```

**Ý nghĩa:** Hạn chế đặc quyền của tiến trình ứng dụng bên trong container.

### 12.2. Biện pháp 2: Network Isolation

Hệ thống sử dụng hai mạng Docker:

- `frontend`
- `backend`

Trong file `docker-compose.yml`, kiểm tra phần cấu hình mạng:

```yaml
networks:
  frontend:
    driver: bridge
  backend:
    driver: bridge
    internal: true
```

**Ý nghĩa:** Mạng `backend` được cấu hình nội bộ, hạn chế khả năng giao tiếp trực tiếp với mạng bên ngoài.

Có thể kiểm tra cấu hình Docker Compose bằng lệnh:

```powershell
docker compose config
```

Tìm phần `networks` và xác nhận `backend` có `internal: true`.

### 12.3. Biện pháp 3: Giới hạn quyền PostgreSQL

Ứng dụng sử dụng tài khoản PostgreSQL `appointment_app` được giới hạn quyền quản trị.

**Lệnh kiểm tra trong PowerShell:**

```powershell
docker exec appointment-postgres psql -U appointment_user -d appointment_db -c "SELECT rolname, rolsuper, rolcreatedb, rolcreaterole FROM pg_roles WHERE rolname='appointment_app';"
```

Kết quả mong muốn:

```text
    rolname      | rolsuper | rolcreatedb | rolcreaterole
-----------------+----------+-------------+--------------
 appointment_app | f        | f           | f
```

Giải thích:

- `rolsuper = f`: Không có quyền Superuser.
- `rolcreatedb = f`: Không có quyền tạo database.
- `rolcreaterole = f`: Không có quyền tạo hoặc quản lý role.

**Ý nghĩa:** Giới hạn quyền tài khoản ứng dụng theo nguyên tắc cấp quyền tối thiểu.

### 12.4. Biện pháp 4: Bảo vệ mật khẩu và file môi trường

Thông tin cấu hình nhạy cảm được lưu trong file `.env`.

File `.gitignore` được sử dụng để loại trừ các file chứa thông tin riêng tư và file sao lưu cục bộ.

Ví dụ:

```gitignore
.env
.env.backup
docker-compose.backup.yml
```

**Cách kiểm tra:**

Mở file `.gitignore` trong VS Code và kiểm tra các dòng trên.

Có thể chạy:

```powershell
git check-ignore .env
```

Nếu `.env` đang được Git bỏ qua, lệnh sẽ hiển thị:

```text
.env
```

Lưu ý: Cần bảo đảm file `.env` chưa từng được đưa vào Git trước đó. Không công khai nội dung hoặc mật khẩu thật khi demo.

### 12.5. Biện pháp 5: Nginx Security Headers

Kiểm tra bằng PowerShell:

```powershell
curl.exe -I http://localhost:8085
```

Các header cần kiểm tra:

```text
X-Frame-Options: SAMEORIGIN
X-Content-Type-Options: nosniff
Referrer-Policy: strict-origin-when-cross-origin
```

**Ý nghĩa:** Bổ sung các cơ chế bảo vệ cơ bản khi trình duyệt truy cập ứng dụng.

### 12.6. Tổng hợp Hardening

| Biện pháp | Minh chứng |
|---|---|
| Non-root container | `docker exec appointment-app id` |
| Network Isolation | `backend` có `internal: true` |
| Giới hạn quyền PostgreSQL | Role `appointment_app` không có quyền quản trị cao |
| Bảo vệ file `.env` | `.gitignore`, `git check-ignore .env` |
| Nginx Security Headers | `curl.exe -I http://localhost:8085` |

Các lệnh kiểm tra trên chỉ đọc thông tin, không thay đổi dữ liệu hoặc cấu hình hệ thống.

## 13. Quản lý mã nguồn trên GitHub

Toàn bộ mã nguồn ứng dụng và các file cấu hình triển khai được quản lý bằng Git và GitHub.

**Repository:**

https://github.com/DTC245200915/HeThongDatLichHen

Các nhóm thay đổi chính gồm:

- Triển khai ứng dụng, PostgreSQL và Nginx.
- Tích hợp Prometheus, Grafana, cAdvisor và PostgreSQL Exporter.
- Tích hợp Loki, Promtail và truy vấn LogQL.
- Bổ sung tài liệu README.
- Cải thiện giao diện ứng dụng.
- Tăng cường bảo mật và phân tách mạng Docker.
- Bảo vệ file môi trường và file sao lưu.

### Kiểm tra lịch sử commit

Mở PowerShell tại thư mục dự án và chạy:

```powershell
git log --oneline
```

Hoặc truy cập repository trên GitHub, chọn **Commits** để xem lịch sử.

### Kiểm tra trạng thái Git

```powershell
git status
```



## 14. Kết quả triển khai

Hệ thống HẸN XINH đã được triển khai bằng Docker Compose với 10 container phục vụ các thành phần ứng dụng, cơ sở dữ liệu, reverse proxy, giám sát và thu thập log.

Các kết quả đã kiểm tra trong quá trình thực hiện:

- Website đặt lịch hoạt động.
- PostgreSQL lưu trữ dữ liệu lịch hẹn.
- pgAdmin hỗ trợ quản lý và truy vấn dữ liệu.
- Nginx Reverse Proxy hoạt động với Security Headers.
- Prometheus ghi nhận 4/4 Targets UP.
- Grafana hiển thị Dashboard giám sát CPU và RAM.
- PostgreSQL Exporter trả về `pg_up = 1`.
- Loki và Promtail hỗ trợ truy vấn nhật ký bằng LogQL.
- Các biện pháp Hardening được triển khai và kiểm tra.
- Mã nguồn và cấu hình được quản lý trên GitHub.

## 15. Kết luận

Dự án HỆ THỐNG ĐẶT LỊCH HẸN – HẸN XINH giúp thực hành quy trình triển khai và quản trị một ứng dụng web bằng Docker Compose.

Hệ thống tích hợp PostgreSQL, pgAdmin, Nginx Reverse Proxy, Prometheus, Grafana, Loki và Promtail, đồng thời áp dụng các biện pháp Hardening cơ bản.

Dự án có thể tiếp tục được phát triển với các chức năng quản lý và xác nhận lịch hẹn, gửi thông báo, sao lưu dữ liệu tự động và triển khai HTTPS trong môi trường thực tế.
