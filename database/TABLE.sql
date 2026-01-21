CREATE DATABASE LitePaaS;
GO

USE LitePaaS;
GO

CREATE TABLE users (
    id INT IDENTITY(1,1) PRIMARY KEY,
    email NVARCHAR(255) UNIQUE NOT NULL,
    name NVARCHAR(255) NOT NULL,
    role NVARCHAR(100) NOT NULL,
    created_at DATETIME DEFAULT GETDATE(),
    updated_at DATETIME DEFAULT GETDATE()
);
GO

CREATE TABLE auths (
    id INT IDENTITY(1,1) PRIMARY KEY,
    user_id INT NOT NULL,
    email NVARCHAR(255) UNIQUE NOT NULL,
    password NVARCHAR(255),
    salt NVARCHAR(255),
    banned BIT DEFAULT 0,
    role NVARCHAR(100) NOT NULL,
    created_at DATETIME DEFAULT GETDATE(),
    updated_at DATETIME DEFAULT GETDATE(),
    FOREIGN KEY (user_id) REFERENCES users(id)
);
GO

CREATE TABLE runtimes (
    id INT IDENTITY(1,1) PRIMARY KEY,
    name NVARCHAR(255) NOT NULL,
    price DECIMAL(18,2),
    cpu float,
    ram int,
    storage int,
    description NVARCHAR(500),
    version NVARCHAR(50),
    status BIT DEFAULT 0,
    created_at DATETIME DEFAULT GETDATE(),
    updated_at DATETIME DEFAULT GETDATE()
);
GO

CREATE TABLE databases (
    id INT IDENTITY(1,1) PRIMARY KEY,
    name NVARCHAR(255) NOT NULL,
    price DECIMAL(18,2),
    cpu float,
    ram int,
    storage int,
    description NVARCHAR(500),
    version NVARCHAR(50),
    status BIT DEFAULT 0,
    created_at DATETIME DEFAULT GETDATE(),
    updated_at DATETIME DEFAULT GETDATE()
);
GO

CREATE TABLE runtime_sub (
    id INT IDENTITY(1,1) PRIMARY KEY,
    user_id INT NOT NULL,
    service_id INT NOT NULL, 
    link_git NVARCHAR(255) NULL,
    token_git NVARCHAR(MAX),
    link_return NVARCHAR(255),
    status BIT DEFAULT 0,
    created_at DATETIME DEFAULT GETDATE(),
    updated_at DATETIME DEFAULT GETDATE(),
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (service_id) REFERENCES runtimes(id)
);
GO

CREATE TABLE database_sub (
    id INT IDENTITY(1,1) PRIMARY KEY,
    user_id INT NOT NULL,
    service_id INT NOT NULL, 
    link_return NVARCHAR(255),
    name_login NVARCHAR(255),
    password_login NVARCHAR(255),
    port NVARCHAR(255),
    status BIT DEFAULT 0,
    created_at DATETIME DEFAULT GETDATE(),
    updated_at DATETIME DEFAULT GETDATE(),
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (service_id) REFERENCES databases(id)
);
GO

CREATE TABLE invoices (
    id INT IDENTITY(1,1) PRIMARY KEY,
    user_id INT NOT NULL,
    service_id INT NOT NULL,
    service_type NVARCHAR(50) NOT NULL CHECK (service_type IN ('runtime','database')),
    amount DECIMAL(18,2) NOT NULL,
    status BIT DEFAULT 0,
    payment_method NVARCHAR(100),
    paid_at DATETIME NULL,
    due_date DATETIME,
    created_at DATETIME DEFAULT GETDATE(),
    updated_at DATETIME DEFAULT GETDATE(),
    FOREIGN KEY (user_id) REFERENCES users(id)
);
GO

CREATE TABLE payments (
    id INT IDENTITY(1,1) PRIMARY KEY,
    invoice_id INT NOT NULL,
    amount DECIMAL(18,2) NOT NULL,
    payment_gateway NVARCHAR(100),
    transaction_id NVARCHAR(255),
    created_at DATETIME DEFAULT GETDATE(),
    updated_at DATETIME DEFAULT GETDATE(),
    FOREIGN KEY (invoice_id) REFERENCES invoices(id)
);
GO

CREATE TABLE database_env (
    id INT IDENTITY(1,1) PRIMARY KEY,
    database_id INT NOT NULL,
    env_keys NVARCHAR(100),
    created_at DATETIME DEFAULT GETDATE(),
    updated_at DATETIME DEFAULT GETDATE(),
    FOREIGN KEY (database_id) REFERENCES databases(id)
);
GO

CREATE TABLE runtime_env (
    id INT IDENTITY(1,1) PRIMARY KEY,
    runtime_id INT NOT NULL,
    docker_file NVARCHAR(MAX),
    created_at DATETIME DEFAULT GETDATE(),
    updated_at DATETIME DEFAULT GETDATE(),
    FOREIGN KEY (runtime_id) REFERENCES runtimes(id)
);
GO