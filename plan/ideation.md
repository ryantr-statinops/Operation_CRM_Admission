# Ideation: Kiến trúc mới — API Gateway + Cloud Function + Config trong Sheet

## 1) Vấn đề gốc
| Hạn chế Apps Script thuần | Tác động |
|---|---|
| Giới hạn thời gian: 6 phút (consumer) / 30 phút (Workspace) | Batch sync hàng nghìn dòng bị cắt giữa chừng |
| Quota Sheets API hạn chế | Đọc/ghi nhiều sheet cùng lúc rất chậm, dễ throttle |
| Xử lý tuần tự | Mỗi lần gom dữ liệu chạy single-thread |
| Khó retry, log tập trung, monitoring | Chỉ có execution log, không có alert |

## 2) Kiến trúc đề xuất
```mermaid
flowchart LR
    A[User nhập liệu
Google Sheets] --> B[Apps Script trigger
(onEdit nhẹ / menu gọi API)]
    B -->|UrlFetchApp| C[API Gateway]
    C --> D{Cloud Function
/ Cloud Run}
    D --> E[Sheets API trực tiếp
(BatchUpdate, Values.get)]
    D --> F[(Memorystore / Redis
Cache config & metadata)]
    E --> G[File Google Sheet
(Data + Config sheet)]
    G --> H[Sheet Database
chứa toàn bộ dữ liệu]
    G --> I[Sheet Config
chứa cấu hình động]
```

**Luồng chính:**
1. User vẫn nhập liệu trực tiếp trên Google Sheets.
2. Khi cần đồng bộ/gom dữ liệu, Apps Script gọi API Gateway thay vì tự xử lý nặng.
3. Cloud Function thực hiện đọc song song, chuẩn hóa, batch ghi vào Database sheet.
4. **Config sheet** trong chính file Google Sheet lưu toàn bộ tham số, backend đọc mỗi request.

## 3) Cấu hình “file bất kỳ” bằng chính Google Sheet
Thay vì hardcode, tạo sheet **`Config`** (hoặc `__CONFIG__`) trong cùng spreadsheet:

| A: KEY | B: VALUE | C: TYPE | D: DESCRIPTION |
|---|---|---|---|
| `DB_SHEET_NAME` | `Database` | string | Tên sheet Database |
| `MONTH_PREFIX` | `Tháng` | string | Tiền tố sheet tháng |
| `HEADER_ROW` | `2` | number | Dòng header |
| `DATA_START_ROW` | `3` | number | Dòng bắt đầu data |
| `SDT_HEADER` | `SĐT` | string | Tên cột SĐT |
| `DB_COLUMNS` | `NGÀY
GHI NHẬN,MÃ TVV,...` | csv | Danh sách cột DB |
| `BATCH_SIZE` | `200` | number | Số dòng xử lý mỗi batch |
| `AUTO_FILL_DATE` | `true` | boolean | Tự động điền ngày |
| `SYNC_MODE` | `append` | enum | append / upsert / replace |

## 4) Migration
| Giai đoạn | Việc cần làm |
|---|---|
| 1 | Giữ nguyên Sheets hiện tại, không đổi UI |
| 2 | Thêm sheet `Config` vào mỗi file |
| 3 | Viết Cloud Function, expose `/sync` |
| 4 | Đóng API Gateway |
| 5 | Apps Script chỉ còn “client” nhẹ gọi API |
| 6 | Tùy chọn: bỏ Apps Script, dùng Sheets UI trực tiếp |

## 5) Lưu ý
- Auth: Workload Identity Federation hoặc OAuth2 for Apps Script.
- Quota: Sheets API 300 req/100s, đủ dùng nếu batch đúng cách.
- Cache: Memorystore (Redis) 60s cho Config.
- Idempotency: trả về `syncId`, Apps Script lưu vào `PropertiesService`.
- Monitoring: Cloud Logging + Cloud Monitoring + Error Reporting.
