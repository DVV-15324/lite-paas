USE BNCloud;
GO

CREATE LOGIN admin_login WITH PASSWORD = 'Admin@123';
CREATE LOGIN user_login WITH PASSWORD = 'User@123';
GO

CREATE USER admin_user FOR LOGIN admin_login;
CREATE USER normal_user FOR LOGIN user_login;
GO

GRANT CONTROL ON DATABASE::BNCloud TO admin_user;

GRANT UPDATE, SELECT ON dbo.Auths TO admin_user;


GRANT DELETE ON DATABASE::BNCloud TO admin_user;

GRANT SELECT, INSERT, UPDATE ON DATABASE::BNCloud TO support_user;

DENY DELETE ON DATABASE::BNCloud TO support_user;

GRANT SELECT, INSERT ON DATABASE::BNCloud TO normal_user;

DENY UPDATE, DELETE ON DATABASE::BNCloud TO normal_user;

DENY UPDATE ON dbo.Auths TO support_user;
DENY UPDATE ON dbo.Auths TO normal_user;

