DROP TABLE IF EXISTS messages;
DROP TABLE IF EXISTS users;

CREATE TABLE users (
    username text PRIMARY KEY,
    password text NOT NULL,
    first_name text NOT NULL,
    last_name text NOT NULL,
    phone text NOT NULL,
    join_at timestamp without time zone NOT NULL,
    last_login_at timestamp with time zone
);

CREATE TABLE messages (
    id SERIAL PRIMARY KEY,
    from_username text NOT NULL REFERENCES users,
    to_username text NOT NULL REFERENCES users,
    body text NOT NULL,
    sent_at timestamp with time zone NOT NULL,
    read_at timestamp with time zone
);

INSERT INTO users (username, password, first_name, last_name, phone, join_at)
VALUES ('topdog', '$2b$12$hAUAD377ZxRJCtPhDplE..QFQCEYtIonQqkYLR6ag4AWGSkyXrNN2', 'Leia', 'Solo', '444-444-4444', '2011-01-01T01:01:11'),
('muffinman', '$2b$12$ZhpWt/KAs7Svyg6QyzLdHunwGOznq1Shm44vqZs2hBIXsibIgOH92', 'Luke', 'Skywalker', '555-555-5555', '2012-02-02T02:02:22');


INSERT INTO messages (from_username, to_username, body, sent_at)
VALUES ('topdog', 'muffinman', 'howdy, muffinman!', '2023-03-03T03:03:33'),
('muffinman', 'topdog', 'Well, hi, topdog321!', '2023-04-04T04:04:44');
