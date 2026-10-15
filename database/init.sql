CREATE TABLE IF NOT EXISTS services (
    id SERIAL PRIMARY KEY,
    name VARCHAR(150) NOT NULL,
    description TEXT,
    price NUMERIC(12,2) NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS customers (
    id SERIAL PRIMARY KEY,
    full_name VARCHAR(150) NOT NULL,
    phone VARCHAR(20) NOT NULL,
    email VARCHAR(150)
);

CREATE TABLE IF NOT EXISTS time_slots (
    id SERIAL PRIMARY KEY,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    CONSTRAINT valid_time CHECK (end_time > start_time),
    CONSTRAINT unique_time_slot UNIQUE (start_time, end_time)
);

CREATE TABLE IF NOT EXISTS appointments (
    id SERIAL PRIMARY KEY,
    customer_id INT NOT NULL REFERENCES customers(id),
    service_id INT NOT NULL REFERENCES services(id),
    time_slot_id INT NOT NULL REFERENCES time_slots(id),
    appointment_date DATE NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT valid_status CHECK (
        status IN ('pending', 'confirmed', 'cancelled', 'completed')
    )
);