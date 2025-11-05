# Trang web Chép chính tả Phim Friends Product Requirements Document (PRD)

## 🏛️ Phần 1: Mục tiêu và Bối cảnh (Goals and Background Context)

### Mục tiêu

- Giúp người dùng rèn luyện kỹ năng nghe chi tiết để đạt được **sự trôi chảy trong giao tiếp thực tế**.
- Cải thiện kỹ năng nghe hiểu các cuộc hội thoại đời thường, không trang trọng, đặc biệt là với tốc độ nói nhanh và tiếng lóng.
- Mang lại trải nghiệm học tập vui vẻ, có động lực, và hiệu quả cao thông qua việc luyện nghe chủ động, chi tiết trong bối cảnh văn hóa thực tế.

### Bối cảnh

Người học tiếng Anh thường gặp khó khăn trong việc chuyển từ "hiểu biết sách vở" sang "giao tiếp thực tế". Việc chỉ xem phim với phụ đề là một hình thức học tập thụ động; não bộ có xu hướng "đọc" thay vì "nghe".

Các công cụ học tập hiện có thường khô khan, thiếu động lực, hoặc không tập trung vào ngôn ngữ nói tự nhiên, tốc độ nhanh, và đầy tiếng lóng như trong phim "Friends". Thiếu một công cụ hiệu quả để rèn luyện kỹ năng "nghe phân tích chi tiết" là một rào cản lớn để đạt được sự trôi chảy.

### Nhật ký Thay đổi (Change Log)

| Ngày       | Phiên bản | Mô tả                                                                                            | Tác giả   |
| :--------- | :-------- | :----------------------------------------------------------------------------------------------- | :-------- |
| 05/11/2025 | 1.0       | Bản thảo PRD đầu tiên dựa trên Project Brief và các quyết định chiến lược (chuyển sang 'online') | John (PM) |

---

## 📋 Phần 2: Yêu cầu (Requirements)

Dự thảo các yêu cầu chức năng và phi chức năng.

### Yêu cầu Chức năng (Functional)

1.  **FR1 (Mới):** Hệ thống phải lưu trữ (host) và phát (stream) một bộ sưu tập (collection) các video clip 10 giây từ phim "Friends" cho người dùng.
2.  **FR2:** Hệ thống phải hiển thị trình phát video cho clip 10 giây.
3.  **FR3:** Hệ thống phải cung cấp một ô nhập văn bản để chép chính tả.
4.  **FR4:** Sau khi nộp, hệ thống phải hiển thị cơ chế **So sánh Gợi ý**, đánh dấu sự khác biệt (đúng/sai). Hệ thống **không** được chấm điểm.
5.  **FR5:** Hệ thống phải triển khai cơ chế **Khớp từ linh hoạt** (ví dụ: 'gonna', 'wanna').
6.  **FR6:** Hệ thống phải cung cấp tính năng **Flashcard Tương tác** (Click-to-Create) để lưu từ vựng.
7.  **FR7:** Hệ thống phải có tính năng **Khởi động từ vựng** (hiển thị từ khó trước khi nghe).
8.  **FR8:** Hệ thống phải triển khai **Gamification Đơn giản** (Tổng thời gian & Chuỗi ngày học).
9.  **FR9 (Mới):** Hệ thống phải có chức năng tài khoản người dùng cơ bản (đăng ký/đăng nhập) để lưu tiến độ, flashcard và chuỗi ngày học của người dùng.

### Yêu cầu Phi chức năng (Non-Functional)

1.  **NFR1 (Mới - Rủi ro pháp lý):** Dự án chấp nhận rủi ro pháp lý liên quan đến việc lưu trữ và phân phối nội dung có bản quyền chưa được cấp phép.
2.  **NFR2 (Mới - Kỹ thuật):** Ứng dụng phải là một trang web công khai, trực tuyến (online), có thể truy cập qua Internet.
3.  **NFR3 (Mới - Kỹ thuật):** Nội dung video (clip 10 giây) và phụ đề phải được xử lý trước (pre-processed) và lưu trữ trên máy chủ (server-side), có thể qua CDN (Mạng phân phối nội dung) để tối ưu tốc độ.
4.  **NFR4 (Mới - Kỹ thuật):** Dữ liệu người dùng (flashcard, tiến độ) phải được lưu trữ trong cơ sở dữ liệu phía máy chủ (server-side database) và liên kết với tài khoản người dùng (FR9).

---

## 🎨 Phần 3: Mục tiêu Thiết kế Giao diện Người dùng (UI Design Goals)

Phần này nắm bắt tầm nhìn tổng thể về trải nghiệm người dùng (UX) và giao diện người dùng (UI) để hướng dẫn Kiến trúc sư Thiết kế.

### Tầm nhìn UX tổng thể (Overall UX Vision)

Tầm nhìn là tạo ra một giao diện học tập sạch sẽ, tập trung cao độ, và tạo động lực. Trải nghiệm phải mượt mà, loại bỏ mọi rào cản không cần thiết, cho phép người dùng tập trung 100% vào vòng lặp cốt lõi: Nghe và Chép chính tả. Các yếu tố Gamification (FR8) nên được thiết kế tinh tế để khuyến khích mà không gây xao lãng. Trải nghiệm phải mang lại cảm giác "thử thách nhưng không gây nản chí".

### Các mô thức tương tác chính (Key Interaction Paradigms)

- **Vòng lặp học tập (Learning Loop):** Luồng tương tác chính là: 1. Bắt đầu (Hiển thị Khởi động từ vựng - FR7), 2. Nghe (Phát clip 10 giây - FR2), 3. Gõ (Nhập vào ô văn bản - FR3), 4. So sánh (Xem kết quả so sánh - FR4), 5. Lưu (Tùy chọn tạo flashcard - FR6).
- **Click-to-Create:** Người dùng có thể nhấp vào bất kỳ từ nào (trong bản chép của họ hoặc bản gốc) để ngay lập tức tạo một flashcard (FR6).
- **Phản hồi tức thì:** Việc so sánh (FR4) phải diễn ra ngay lập tức sau khi người dùng nộp bài để duy trì động lực.

### Các màn hình cốt lõi (Core Screens)

1.  **Đăng nhập / Đăng ký:** Cần thiết cho tài khoản người dùng trực tuyến (FR9).
2.  **Bảng điều khiển (Dashboard):** Màn hình chính sau khi đăng nhập. Hiển thị bộ sưu tập (collection) các clip học, tiến độ tổng thể (FR8), và chuỗi ngày học (FR8).
3.  **Giao diện Học (Learning Interface):** Màn hình cốt lõi nơi diễn ra Vòng lặp học tập (trình phát video, ô nhập, nút nộp bài, kết quả so sánh).
4.  **Trang Flashcard / Từ vựng:** Nơi người dùng xem và ôn tập các từ vựng đã lưu (FR6).

### Khả năng tiếp cận (Accessibility)

- **Tiêu chuẩn:** WCAG AA (Giả định của PM).

### Xây dựng thương hiệu (Branding)

- **Màu chủ đạo:** **Xanh lá nhạt**.
- _Logo, phông chữ và phong cách hình ảnh chi tiết khác: TBD (Chưa xác định)_.

### Nền tảng mục tiêu (Target Platforms)

- **Web Responsive:** (Giả định của PM, bao gồm máy tính để bàn, máy tính bảng và di động).

---

## 🔧 Phần 4: Các Giả định Kỹ thuật (Technical Assumptions)

Phần này ghi lại các quyết định kỹ thuật cấp cao sẽ định hướng cho Kiến trúc sư.

### Cấu trúc Kho lưu trữ (Repository Structure)

- **Lựa chọn:** **Monorepo** (Một kho lưu trữ duy nhất).
- _Lý do:_ Vẫn là lựa chọn tốt nhất để chia sẻ logic và kiểu dữ liệu TypeScript giữa frontend (React) và backend (Serverless Functions), đặc biệt là cho logic "Khớp từ linh hoạt" (FR5).

### Kiến trúc Dịch vụ (Service Architecture)

- **Lựa chọn:** **Serverless Functions** (Phi máy chủ).
- _Lý do:_ Phù hợp cho các tác vụ không đồng bộ (như xử lý `FFmpeg` - NFR3) và tiết kiệm chi phí.

### Yêu cầu Kiểm thử (Testing Requirements)

- **Lựa chọn:** **Unit + Integration**.

### Các Giả định và Yêu cầu Kỹ thuật Bổ sung

Dưới đây là bộ công nghệ (tech stack) được đề xuất cho dự án này:

- **Ngôn ngữ chung:** **TypeScript** (cho cả frontend và backend).
- **Frontend Framework:** **Next.js (React)**.
  - _Lý do:_ Framework hàng đầu cho React, tích hợp hoàn hảo với kiến trúc Serverless Functions (API Routes).
- **Backend Runtime:** **Node.js** (chạy trên Serverless Functions).
  - _Lý do:_ Tích hợp sẵn trong Next.js/Vercel.
- **Cơ sở dữ liệu (Database):** **PostgreSQL** (Đề xuất của PM).
  - _Lý do:_ Mạnh mẽ, đáng tin cậy; các nhà cung cấp (Vercel Postgres, Supabase) có bậc miễn phí tốt.
- **Nền tảng Lưu trữ (Hosting):** **Vercel**.
  - _Lý do:_ Lựa chọn lý tưởng, được xây dựng cho Next.js, xử lý việc triển khai frontend và API (Serverless) tự động.

---

## 📜 Phần 5: Danh sách Epic (Epic List)

Cấu trúc Epic cấp cao cho toàn bộ dự án.

### Phạm vi MVP (MVP Scope)

1.  **Epic 1: Nền tảng (Foundation), Xác thực (Auth) & Vòng lặp Học tập Cốt lõi (Core Learning Loop)**
    - **Mục tiêu:** Thiết lập dự án, xác thực người dùng, và xây dựng chức năng cốt lõi (xem clip, chép chính tả, so sánh).
2.  **Epic 2: Mở rộng Trải nghiệm (Experience Expansion) - Flashcard & Gamification**
    - **Mục tiêu:** Thêm các tính năng giữ chân người dùng (Flashcard, Khởi động từ vựng, theo dõi tiến độ).

### Giai đoạn 2 (Post-MVP Scope)

3.  **Epic 3: Hệ thống Quản lý Nội dung (Admin CMS)**
    - **Mục tiêu:** (Post-MVP) Xây dựng một trang admin bảo mật cho phép quản trị viên tải lên/quản lý video, phụ đề và "từ khó" mà không cần can thiệp vào code.

---

## 📜 Phần 6: Chi tiết Epic 1: Nền tảng (Foundation), Xác thực (Auth) & Vòng lặp Học tập Cốt lõi (Core Learning Loop)

**Mục tiêu Epic:** Khi Epic này hoàn thành, người dùng có thể đăng ký tài khoản, đăng nhập, xem danh sách các clip học, chọn một clip, phát nó, chép chính tả, và nhận phản hồi so sánh cơ bản. Epic này thiết lập các yêu cầu FR9, FR1, FR2, FR3, FR4, và FR5.

### Story 1.1: Thiết lập Nền tảng Dự án (Project Foundation)

**As a** (Developer) / **Với tư cách là** (Nhà phát triển),
**I want** (a Monorepo project structure with Next.js, TypeScript, and a connected PostgreSQL database) / **Tôi muốn** (một cấu trúc dự án Monorepo với Next.js, TypeScript, và một cơ sở dữ liệu PostgreSQL đã được kết nối),
**so that** (the team has a stable, consistent foundation for building all future features) / **để** (nhóm có một nền tảng ổn định, nhất quán để xây dựng tất cả các tính năng trong tương lai).

#### Tiêu chí Chấp nhận (Acceptance Criteria)

1.  Kho lưu trữ (repository) được khởi tạo dưới dạng Monorepo (ví dụ: `pnpm workspaces`).
2.  Ứng dụng Next.js (frontend) được thiết lập trong thư mục `apps/web`.
3.  TypeScript được cấu hình hoạt động trên toàn bộ kho lưu trữ, bao gồm cả các gói (packages) chia sẻ.
4.  ORM (ví dụ: Prisma) được cài đặt và cấu hình để kết nối với cơ sở dữ liệu PostgreSQL.
5.  Một API route (Serverless Function) kiểm tra sức khỏe (ví dụ: `api/health`) được tạo.
6.  Khi gọi `api/health`, nó phải trả về trạng thái `{"status": "ok"}` và xác nhận kết nối cơ sở dữ liệu thành công.

### Story 1.2: Triển khai Xác thực Người dùng (FR9)

**As a** (New User) / **Với tư cách là** (Người dùng mới),
**I want** (to sign up and log in to the application) / **Tôi muốn** (đăng ký và đăng nhập vào ứng dụng),
**so that** (my progress (flashcards, streaks) can be saved to my account) / **để** (tiến độ của tôi (flashcard, chuỗi ngày) có thể được lưu vào tài khoản của tôi).

#### Tiêu chí Chấp nhận (Acceptance Criteria)

1.  Người dùng có thể truy cập trang Đăng ký (Core Screen 1).
2.  Người dùng có thể tạo tài khoản (ví dụ: sử dụng email/mật khẩu).
3.  Mật khẩu của người dùng phải được băm (hashed) và lưu trữ an toàn trong cơ sở dữ liệu.
4.  Người dùng có thể Đăng nhập bằng thông tin đăng nhập đã tạo (Core Screen 1).
5.  Người dùng nhận được thông báo lỗi rõ ràng nếu đăng nhập thất bại.
6.  Sau khi đăng nhập thành công, người dùng được chuyển hướng đến Bảng điều khiển (Core Screen 2).
7.  Người dùng có thể Đăng xuất khỏi ứng dụng.
8.  Trạng thái xác thực (việc đã đăng nhập) được quản lý (ví dụ: qua session hoặc JWT).

### Story 1.3: Duyệt và Phát Bộ sưu tập Video (FR1, FR2)

**As a** (Logged-in User) / **Với tư cách là** (Người dùng đã đăng nhập),
**I want** (to see a collection of video clips on my dashboard and play one) / **Tôi muốn** (xem một bộ sưu tập các video clip trên bảng điều khiển của mình và phát một clip),
**so that** (I can select a clip to start my dictation practice) / **để** (tôi có thể chọn một clip để bắt đầu luyện chép chính tả).

#### Tiêu chí Chấp nhận (Acceptance Criteria)

1.  Sau khi đăng nhập, Bảng điều khiển (Core Screen 2) hiển thị một danh sách hoặc lưới các clip video có sẵn (từ bộ sưu tập FR1 phía máy chủ).
2.  Nhấp vào một clip sẽ điều hướng người dùng đến Giao diện Học tập (Core Screen 3) với clip đó đã được tải.
3.  Giao diện Học tập hiển thị một trình phát video (FR2).
4.  Clip video 10 giây được phát chính xác.
5.  (Phụ thuộc) API backend (NFR3) phải được tạo để cung cấp các clip 10 giây và phụ đề tương ứng của chúng.

### Story 1.4: Vòng lặp Chép chính tả và So sánh Cốt lõi (FR3, FR4, FR5)

**As a** (Logged-in User) / **Với tư cách là** (Người dùng đã đăng nhập),
**I want** (to type what I hear, submit it, and see a comparison with the correct text) / **Tôi muốn** (gõ lại những gì tôi nghe được, nộp bài, và xem so sánh với văn bản đúng),
**so that** (I can actively practice my listening and identify my mistakes) / **để** (tôi có thể chủ động luyện nghe và nhận ra lỗi sai của mình).

#### Tiêu chí Chấp nhận (Acceptance Criteria)

1.  Giao diện Học tập (Core Screen 3) hiển thị một ô nhập văn bản (FR3).
2.  Người dùng có thể nhập văn bản vào ô.
3.  Sau khi nhấp vào nút "Kiểm tra", hệ thống phải hiển thị kết quả so sánh (FR4).
4.  Kết quả so sánh phải hiển thị văn bản của người dùng bên cạnh văn bản phụ đề gốc.
5.  Kết quả so sánh phải làm nổi bật sự khác biệt (ví dụ: từ đúng màu xanh, từ sai màu đỏ).
6.  Hệ thống **không** được hiển thị điểm số (FR4).
7.  Logic **Khớp từ linh hoạt** (FR5) phải được triển khai ở mức cơ bản (ví dụ: 'gonna' được tính là đúng nếu đáp án là 'going to').
8.  Sau khi xem kết quả, người dùng có thể tiếp tục (ví dụ: một nút "Clip tiếp theo").

---

## 📜 Phần 7: Chi tiết Epic 2: Mở rộng Trải nghiệm (Experience Expansion) - Flashcard & Gamification

**Mục tiêu Epic:** Xây dựng dựa trên vòng lặp học tập cốt lõi (Epic 1), bổ sung các tính năng quan trọng để tăng cường khả năng ghi nhớ và duy trì động lực cho người dùng. Epic này triển khai các yêu cầu FR6, FR7, và FR8.

### Story 2.1: Triển khai Khởi động Từ vựng (FR7)

**As a** (Logged-in User) / **Với tư cách là** (Người dùng đã đăng nhập),
**I want** (to see the difficult vocabulary _before_ the clip plays) / **Tôi muốn** (xem các từ vựng khó _trước khi_ clip phát),
**so that** (I can be prepared to listen for those specific words) / **để** (tôi có thể chuẩn bị sẵn sàng để nghe các từ cụ thể đó).

#### Tiêu chí Chấp nhận (Acceptance Criteria)

1.  Trước khi Giao diện Học tập (Core Screen 3) phát video, một lớp phủ (overlay) hiển thị "Các từ cần chú ý".
2.  Hệ thống phải có một cơ chế (ví dụ: một danh sách từ vựng/tiếng lóng được định nghĩa sẵn) để xác định từ nào trong phụ đề của clip là "khó".
3.  Lớp phủ hiển thị 3-5 từ/cụm từ khó nhất từ clip sắp phát.
4.  Người dùng phải nhấp vào nút "Bắt đầu" để ẩn lớp phủ này và bắt đầu phát video.

### Story 2.2: Triển khai Tạo Flashcard (FR6)

**As a** (Logged-in User) / **Với tư cách là** (Người dùng đã đăng nhập),
**I want** (to click on any word in the comparison results to save it as a flashcard) / **Tôi muốn** (nhấp vào bất kỳ từ nào trong kết quả so sánh để lưu nó làm flashcard),
**so that** (I can easily build a personal vocabulary deck to review later) / **để** (tôi có thể dễ dàng xây dựng một bộ từ vựng cá nhân để ôn tập sau).

#### Tiêu chí Chấp nhận (Acceptance Criteria)

1.  Trên màn hình kết quả so sánh (Story 1.4), tất cả các từ (của người dùng và phụ đề gốc) phải có thể nhấp được.
2.  Khi nhấp vào một từ, một pop-up xuất hiện, cho phép người dùng "Lưu vào Flashcard".
3.  Khi lưu, từ đó được lưu vào cơ sở dữ liệu (NFR4) và liên kết với tài khoản người dùng (FR9).
4.  Hệ thống phải đưa ra phản hồi trực quan (ví dụ: "Đã lưu!").
5.  Từ đã được lưu không nên hiển thị tùy chọn "Lưu" nữa.

### Story 2.3: Triển khai Trang ôn tập Flashcard (FR6)

**As a** (Logged-in User) / **Với tư cách là** (Người dùng đã đăng nhập),
**I want** (to access a dedicated page to review all my saved flashcards) / **Tôi muốn** (truy cập một trang chuyên dụng để ôn tập tất cả các flashcard đã lưu của mình),
**so that** (I can reinforce my learning and memorize new vocabulary) / **để** (tôi có thể củng cố việc học và ghi nhớ từ vựng mới).

#### Tiêu chí Chấp nhận (Acceptance Criteria)

1.  Người dùng có thể điều hướng đến Trang Flashcard (Core Screen 4) từ Bảng điều khiển.
2.  Trang này hiển thị tất cả các flashcard mà người dùng đã lưu (Story 2.2).
3.  Người dùng có thể xem flashcard (ví dụ: mặt trước là từ, mặt sau là câu ví dụ).
4.  Người dùng có thể xóa các flashcard.

### Story 2.4: Triển khai Gamification - Theo dõi Tiến độ (FR8)

**As a** (Logged-in User) / **Với tư cách là** (Người dùng đã đăng nhập),
**I want** (to see my total learning time and my daily learning streak) / **Tôi muốn** (xem tổng thời gian học và chuỗi ngày học liên tiếp của mình),
**so that** (I feel motivated to continue practicing every day) / **để** (tôi cảm thấy có động lực để tiếp tục luyện tập mỗi ngày).

#### Tiêu chí Chấp nhận (Acceptance Criteria)

1.  Hệ thống phải theo dõi "Tổng thời gian học" (thời gian trên Giao diện Học tập).
2.  Hệ thống phải theo dõi "Chuỗi ngày học liên tiếp" (số ngày liên tục hoàn thành ít nhất một clip).
3.  Cả hai chỉ số này phải được hiển thị rõ ràng trên Bảng điều khiển (Core Screen 2).
4.  Khi người dùng hoàn thành một clip, hệ thống phải cập nhật các chỉ số này trong cơ sở dữ liệu.
5.  Chuỗi ngày học phải được đặt lại (reset) về 0 nếu người dùng bỏ lỡ một ngày.

---

## 🏁 Phần 8: Báo cáo Kết quả Checklist (Checklist Results Report)

(Đã chạy 'pm-checklist' - Báo cáo xác nhận trạng thái 'READY FOR ARCHITECT' với các rủi ro nhỏ đã được ghi nhận, chủ yếu liên quan đến việc thiếu các NFR chi tiết về hiệu suất/bảo mật, và sự phức tạp của NFR3 (FFmpeg trên Serverless). Những vấn đề này sẽ được chuyển cho Kiến trúc sư để giải quyết trong giai đoạn tiếp theo.)

---

## 🚀 Phần 9: Các bước Tiếp theo (Next Steps)

### Lời nhắc cho Chuyên gia UX (UX Expert Prompt)

"Bản PRD này (đặc biệt là Phần 3 - Mục tiêu UI) đã sẵn sàng để bạn tạo Tài liệu Đặc tả UI/UX (UI/UX Specification) chi tiết. Hãy tập trung vào việc thiết kế các 'Core Screens' (Màn hình cốt lõi) đã được xác định, đảm bảo tuân thủ màu sắc 'xanh lá nhạt' và thiết kế 'responsive'."

### Lời nhắc cho Kiến trúc sư (Architect Prompt)

"Bản PRD này (đặc biệt là Phần 4 - Giả định Kỹ thuật) đã sẵn sàng để bạn tạo Tài liệu Kiến trúc (Architecture Document). Hãy thiết kế một Monorepo sử dụng Next.js (cho React/Serverless) và PostgreSQL, tuân theo các yêu cầu chức năng và phi chức năng đã nêu. Đặc biệt chú ý đến tính khả thi của NFR3 (FFmpeg trên Serverless) và định nghĩa các mẫu bảo mật/logging chi tiết."
