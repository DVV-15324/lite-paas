
| Nhóm người dùng      | Quyền                                                   | Mục đích                                                                           |
| -------------------- | ------------------------------------------------------- | ---------------------------------------------------------------------------------- |
| **admin_user**       | `CONTROL`, `DELETE`, `UPDATE`, `SELECT` toàn DB         | Toàn quyền, bao gồm xóa dữ liệu, ban user                                          |
| **support_user**     | `SELECT`, `INSERT`, `UPDATE` (nhưng không được DELETE)  | Hỗ trợ người dùng, cập nhật nội dung dịch vụ, ticket                               |
| **normal_user**      | `SELECT`, `INSERT` (không được UPDATE/DELETE trực tiếp) | Chỉ được thêm và xem dữ liệu, đổi mật khẩu thông qua procedure                     |
| **Tất cả trừ admin** | `DENY UPDATE ON dbo.Auths`                              | Không được thay đổi trực tiếp bảng Auths (chống tự ý đổi mật khẩu, ban user, v.v.) |
