-- Crear base de datos si no existe
CREATE DATABASE IF NOT EXISTS DBQA CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci;

-- Usar la base de datos
USE DBQA;

-- Crear tablas (similar a tus migraciones)
CREATE TABLE IF NOT EXISTS plans (
  id int NOT NULL AUTO_INCREMENT,
  name varchar(150) NOT NULL,
  description text,
  status enum('PENDING','IN_PROGRESS','COMPLETED') DEFAULT 'PENDING',
  created_at timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE IF NOT EXISTS test_cases (
  id int NOT NULL AUTO_INCREMENT,
  plan_id int NOT NULL,
  name varchar(150) NOT NULL,
  description text,
  validation_type varchar(100) DEFAULT NULL,
  priority enum('P1','P2','P3') NOT NULL DEFAULT 'P2',
  status enum('PENDING','PASSED','FAILED','NA') DEFAULT 'PENDING',
  created_at timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY fk_cases_plan (plan_id),
  CONSTRAINT fk_cases_plan FOREIGN KEY (plan_id) REFERENCES plans (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
