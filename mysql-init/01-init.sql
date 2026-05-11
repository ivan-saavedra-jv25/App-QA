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

CREATE TABLE IF NOT EXISTS test_case_examples (
  id int NOT NULL AUTO_INCREMENT,
  test_case_id int NOT NULL,
  example_type enum('TEXT','IMAGE_URL','FILE_SET') NOT NULL,
  input_json json NOT NULL,
  created_at timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_examples_test_case_id (test_case_id),
  CONSTRAINT fk_examples_test_case FOREIGN KEY (test_case_id) REFERENCES test_cases (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
