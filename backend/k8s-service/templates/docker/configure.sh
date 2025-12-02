#!/bin/bash
# Chờ SQL Server khởi động và sau đó cấu hình để lắng nghe trên tất cả interface
# Khởi động SQL Server, cấu hình, rồi khởi động lại SQL Server

# Start SQL Server in the background
/opt/mssql/bin/sqlservr &
sleep 30

# Cấu hình để lắng nghe trên tất cả interface
/opt/mssql-tools/bin/sqlcmd -S localhost -U sa -P $SA_PASSWORD -Q "EXEC xp_readerrorlog 0, 1, 'Server is listening on'"
/opt/mssql-tools/bin/sqlcmd -S localhost -U sa -P $SA_PASSWORD -Q "EXEC sys.sp_configure N'remote access', N'1'"
/opt/mssql-tools/bin/sqlcmd -S localhost -U sa -P $SA_PASSWORD -Q "RECONFIGURE"

# Dừng SQL Server
pkill sqlservr

# Chờ một chút để đảm bảo tiến trình dừng lại
sleep 10

# Bây giờ khởi động SQL Server ở foreground
exec /opt/mssql/bin/sqlservr