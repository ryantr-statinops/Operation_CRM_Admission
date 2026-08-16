# Đề xuất folder structure mới

```tree
Smart_Sheets_System/
├── plan/
│   ├── ideation.md
│   └── folder-structure.md
├── backend/
│   ├── src/
│   │   ├── config-reader.ts        # Đọc Config sheet từ bất kỳ spreadsheet
│   │   ├── sync.ts                 # Logic đồng bộ chính
│   │   ├── auth.ts                 # Auth / verify token
│   │   └── index.ts                # Entry point Cloud Function
│   ├── package.json
│   ├── tsconfig.json
│   └── .env.example                # Không chứa secret
├── infra/
│   ├── main.tf                     # Terraform: Cloud Function + API Gateway + Redis
│   └── variables.tf
├── apps-script-client/
│   ├── src/
│   │   ├── Main_.js                # Menu + trigger (nhẹ)
│   │   ├── ApiClient_.js           # UrlFetchApp → API Gateway
│   │   └── Test_.js                # Test suite
│   ├── .clasp.json
│   └── appsscript.json
└── README.md
```

**Bỏ đi:**
- `Operation_CRM_Admission/` (toàn bộ) — vì logic đã chuyển sang `backend/`, giữ lại chỉ mỗi `apps-script-client/` cho Apps Script.
- `app script code/`, `crm-scripts/`, `gg_sheet/`, `google_sheet/`, `MINIHIPPO_27-07-2026/`, `data/` — các folder cũ/legacy không cần thiết.
- `CHANGELOG.md`, `CONTRIBUTING.md`, `GITHUB_SETUP.md`, `QUICK_START.md`, `SETUP.md` — gộp vào `README.md` mới.

**Giữ lại / thêm mới:**
- Giữ lại tên **Smart_Sheets_System** làm root.
- Thêm `plan/` cho ideation & roadmap.
- Thêm `backend/` cho Cloud Function (Node/TS).
- Thêm `infra/` cho IaC (Terraform).
- `apps-script-client/` chỉ còn client-side nhẹ.
