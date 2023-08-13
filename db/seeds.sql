INSERT INTO department (id, name)
VALUES
    (1, 'Sales'),
    (2, 'Engineering'),
    (3, 'Finance'),
    (4, 'Marketing');

INSERT INTO role (id, title, salary, department_id)
VALUES
    (1, 'Sales Manager', 80000.00, 1),
    (2, 'Sales Associate', 45000.00, 1),
    (3, 'Software Engineer', 95000.00, 2),
    (4, 'Web Developer', 80000.00, 2),
    (5, 'Financial Analyst', 60000.00, 3),
    (6, 'Marketing Specialist', 55000.00, 4);

INSERT INTO employee (id, first_name, last_name, role_id, manager_id)
VALUES
    (1, 'John', 'Doe', 1, NULL),
    (2, 'Jane', 'Smith', 2, 1),
    (3, 'Michael', 'Johnson', 3, NULL),
    (4, 'Emily', 'Williams', 4, 3),
    (5, 'Daniel', 'Brown', 5, NULL),
    (6, 'Olivia', 'Jones', 6, 4);
