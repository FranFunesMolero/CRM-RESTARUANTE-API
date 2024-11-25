DROP TABLE IF EXISTS user;
CREATE TABLE user (
    id INT PRIMARY KEY AUTO_INCREMENT,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    name VARCHAR(64) NOT NULL,
    surname VARCHAR(64) NOT NULL,
    phone VARCHAR(20) NOT NULL, --not used
    role ENUM('admin', 'client') DEFAULT 'client'
);

DROP TABLE IF EXISTS review;
CREATE TABLE review (
    id INT PRIMARY KEY AUTO_INCREMENT,
    rating INT NOT NULL,
    comment TEXT NOT NULL,
    user_id INT NOT NULL, 
    FOREIGN KEY (user_id) REFERENCES user (id) ON DELETE CASCADE
);

DROP TABLE IF EXISTS reservation;
CREATE TABLE reservation (
    id INT PRIMARY KEY AUTO_INCREMENT,
    `date` DATE NOT NULL,
    `time` ENUM('breakfast', 'lunch', 'dinner') NOT NULL,
    guests INT NOT NULL,
    status ENUM('pending', 'confirmed', 'cancelled', 'completed') NOT NULL DEFAULT 'confirmed',
    user_id INT NOT NULL, 
    FOREIGN KEY (user_id) REFERENCES user (id) ON DELETE CASCADE
);

DROP TABLE IF EXISTS `table`; 
CREATE TABLE `table` (
    id INT PRIMARY KEY AUTO_INCREMENT,
    location ENUM('outside', 'inside'), 
    number INT NOT NULL,
    capacity INT NOT NULL
);

DROP TABLE IF EXISTS reservation_has_table;
CREATE TABLE reservation_has_table (
    reservation_id INT NOT NULL,
    table_id INT NOT NULL,
    FOREIGN KEY (reservation_id) REFERENCES reservation (id) ON DELETE CASCADE,
    FOREIGN KEY (table_id) REFERENCES `table` (id) ON DELETE CASCADE,
    PRIMARY KEY(reservation_id, table_id),

    `date` DATE NOT NULL,
    time ENUM('breakfast', 'lunch', 'dinner') NOT NULL
);

DROP TABLE IF EXISTS dish;
CREATE TABLE dish (
    id INT NOT NULL PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(255) NOT NULL,
    type ENUM("dessert"),
    description TEXT, 
    price DECIMAL(5,2) NOT NULL,
    image_url VARCHAR(255) NOT NULL
);

DROP TABLE IF EXISTS menu;
CREATE TABLE menu (
    id INT NOT NULL PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100), 
    price DECIMAL(5,2) NOT NULL,
    `date` DATE NOT NULL 
);

DROP TABLE IF EXISTS menu_has_dish;
CREATE TABLE menu_has_dish (
    menu_id INT NOT NULL,
    dish_id INT NOT NULL,
    FOREIGN KEY (menu_id) REFERENCES menu(id) ON DELETE CASCADE,
    FOREIGN KEY (dish_id) REFERENCES dish(id) ON DELETE CASCADE,
    PRIMARY KEY(menu_id, dish_id)
);

---- EXTRA 

DROP TABLE IF EXISTS category;
CREATE TABLE category (
    id INT NOT NULL PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL, 
    description TEXT,
    type ENUM('Allergen') 
);

DROP TABLE IF EXISTS dish_has_category;
CREATE TABLE dish_has_category (
    dish_id INT NOT NULL,
    category_id INT NOT NULL,
    FOREIGN KEY (dish_id) REFERENCES dish(id) ON DELETE CASCADE,
    FOREIGN KEY (category_id) REFERENCES category(id) ON DELETE CASCADE,
    PRIMARY KEY(dish_id, category_id)
);


DROP TABLE IF EXISTS menu_has_category;
CREATE TABLE menu_has_category (
    menu_id INT NOT NULL,
    category_id INT NOT NULL,
    FOREIGN KEY (menu_id) REFERENCES menu(id) ON DELETE CASCADE,
    FOREIGN KEY (category_id) REFERENCES category(id) ON DELETE CASCADE,
    PRIMARY KEY(menu_id, category_id)
);

---