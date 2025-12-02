CREATE DATABASE LitePaaS;
GO

USE LitePaaS;
GO

CREATE TABLE users (
    id INT IDENTITY(1,1) PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    phone VARCHAR(50) NULL,
    address VARCHAR(255) NULL,
    created_at DATETIME DEFAULT GETDATE(),
    updated_at DATETIME DEFAULT GETDATE()
);
GO

CREATE TABLE user_auth (
    id INT IDENTITY(1,1) PRIMARY KEY,
    user_id INT NOT NULL UNIQUE,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255),
    salt VARCHAR(255),
    banned BIT DEFAULT 0,
    role VARCHAR(100) NOT NULL,
    created_at DATETIME DEFAULT GETDATE(),
    updated_at DATETIME DEFAULT GETDATE(),
    FOREIGN KEY (user_id) REFERENCES users(id)
);
GO

CREATE TABLE runtime_services (
    id INT IDENTITY(1,1) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    price DECIMAL(18,2),
    cpu int,
    ram int,
    storage int,
    description VARCHAR(500),
    version VARCHAR(50),
    status BIT DEFAULT 0,
    created_at DATETIME DEFAULT GETDATE(),
    updated_at DATETIME DEFAULT GETDATE()
);
GO

CREATE TABLE storage_services (
    id INT IDENTITY(1,1) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    price DECIMAL(18,2),
    service_type VARCHAR(50) NOT NULL CHECK (service_type IN ('database', 'storage')),
    cpu int,
    ram int,
    storage int,
    description VARCHAR(500),
    version VARCHAR(50),
    status BIT DEFAULT 0,
    created_at DATETIME DEFAULT GETDATE(),
    updated_at DATETIME DEFAULT GETDATE()
);
GO

CREATE TABLE user_runtime_sub (
    id INT IDENTITY(1,1) PRIMARY KEY,
    user_id INT NOT NULL,
    service_id INT NOT NULL, 
    link_git VARCHAR(255) NULL,
    token VARCHAR(MAX),
    link_return VARCHAR(255),
    status BIT DEFAULT 0,
    created_at DATETIME DEFAULT GETDATE(),
    updated_at DATETIME DEFAULT GETDATE(),
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (service_id) REFERENCES runtime_services(id)
);
GO

CREATE TABLE user_storage_sub (
    id INT IDENTITY(1,1) PRIMARY KEY,
    user_id INT NOT NULL,
    service_id INT NOT NULL, 
    link_return VARCHAR(255),
    name_login VARCHAR(255),
    password_login VARCHAR(255),
    port_one VARCHAR(255),
    port_two VARCHAR(255),
    status BIT DEFAULT 0,
    created_at DATETIME DEFAULT GETDATE(),
    updated_at DATETIME DEFAULT GETDATE(),
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (service_id) REFERENCES storage_services(id)
);
GO

CREATE TABLE support_tickets (
    id INT IDENTITY(1,1) PRIMARY KEY,
    user_id INT NOT NULL,
    service_sub_id INT NOT NULL,
    service_type VARCHAR(50) NOT NULL CHECK (service_type IN ('runtime', 'database', 'storage')),
    title VARCHAR(255) NOT NULL,
    content VARCHAR(MAX) NOT NULL,
    status VARCHAR(50) DEFAULT 'open', -- 'done'
    created_at DATETIME DEFAULT GETDATE(),
    updated_at DATETIME DEFAULT GETDATE(),
    FOREIGN KEY (user_id) REFERENCES users(id)
);
GO

CREATE TABLE ticket_messages (
    id INT IDENTITY(1,1) PRIMARY KEY,
    ticket_id INT NOT NULL,
    sender_id INT NOT NULL,
    message VARCHAR(MAX) NOT NULL,
    created_at DATETIME DEFAULT GETDATE(),
    updated_at DATETIME DEFAULT GETDATE(),
    FOREIGN KEY (ticket_id) REFERENCES support_tickets(id),
    FOREIGN KEY (sender_id) REFERENCES users(id)
);
GO

CREATE TABLE invoices (
    id INT IDENTITY(1,1) PRIMARY KEY,
    user_id INT NOT NULL,
    service_id INT NOT NULL,
    service_type VARCHAR(50) NOT NULL CHECK (service_type IN ('runtime','database','storage')),
    amount DECIMAL(18,2) NOT NULL,
    status VARCHAR(50) DEFAULT 'pending', 
    payment_method VARCHAR(100),
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
    payment_gateway VARCHAR(100),
    transaction_id VARCHAR(255),
    created_at DATETIME DEFAULT GETDATE(),
    updated_at DATETIME DEFAULT GETDATE(),
    FOREIGN KEY (invoice_id) REFERENCES invoices(id)
);
GO