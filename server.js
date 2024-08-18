const express = require('express');
const bodyParser = require('body-parser');
const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');
const path = require('path');
const TelegramBot = require('node-telegram-bot-api');

const app = express();
const port = 3000;

// Подключение к базе данных MySQL
const pool = mysql.createPool({
    host: 'localhost',
    user: 'goldenfish_user', // Замените на ваш MySQL username
    password: 'Q1w2e3r4t5y6', // Замените на ваш MySQL пароль
    database: 'goldenfish_db'
});

app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));

// Хеширование пароля администратора
const hashAdminPassword = async () => {
    const adminPassword = 'adminsitepassword1234gf';
    const hashedPassword = await bcrypt.hash(adminPassword, 10);
    try {
        const [rows] = await pool.query(
            'INSERT INTO users (username, phone, password, role) VALUES (?, ?, ?, ?) ON DUPLICATE KEY UPDATE username = username',
            ['admingoldenfishwebsite', '0000000000', hashedPassword, 'admin']
        );
        console.log('Администратор добавлен в базу данных');
    } catch (error) {
        console.error('Ошибка добавления администратора:', error);
    }
};
hashAdminPassword();

// Функция для проверки ролей
const checkRole = (role) => {
    return async (req, res, next) => {
        const { username } = req.query;
        try {
            const [rows] = await pool.query('SELECT role FROM users WHERE username = ?', [username]);
            if (rows.length === 0 || rows[0].role !== role) {
                return res.status(403).json({ success: false, message: 'Доступ запрещен' });
            }
            next();
        } catch (err) {
            console.error('Error checking user role:', err);
            return res.status(500).json({ success: false, message: 'Ошибка проверки роли пользователя' });
        }
    };
};

// Маршрут для корневой страницы
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Маршрут для страницы "О нас"
app.get('/about', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'about.html'));
});

// Маршрут для регистрации пользователя
app.post('/register', async (req, res) => {
    const { username, phone, password } = req.body;
    console.log('Received registration data:', { username, phone, password }); // Отладочное сообщение

    try {
        // Хеширование пароля
        const hashedPassword = await bcrypt.hash(password, 10);
        console.log('Hashed password:', hashedPassword); // Отладочное сообщение

        const [result] = await pool.query(
            'INSERT INTO users (username, phone, password, role) VALUES (?, ?, ?, ?)',
            [username, phone, hashedPassword, 'user']
        );
        console.log('Insert result:', result); // Отладочное сообщение
        res.status(201).json({ success: true, userId: result.insertId });
    } catch (error) {
        console.error('Error inserting user:', error); // Отладочное сообщение
        res.status(500).json({ success: false, message: 'Ошибка при регистрации пользователя' });
    }
});

// Маршрут для входа пользователя
app.post('/login', async (req, res) => {
    const { username, password } = req.body;
    console.log('Received login data:', { username, password }); // Отладочное сообщение

    try {
        const [rows] = await pool.query('SELECT * FROM users WHERE username = ?', [username]);
        console.log('User query result:', rows); // Отладочное сообщение

        if (rows.length === 0) {
            console.log('User not found'); // Отладочное сообщение
            return res.status(400).json({ success: false, message: 'Пользователь не найден' });
        }

        const user = rows[0];
        const isValidPassword = await bcrypt.compare(password, user.password);
        console.log('Password validation result:', isValidPassword); // Отладочное сообщение

        if (!isValidPassword) {
            console.log('Invalid password'); // Отладочное сообщение
            return res.status(400).json({ success: false, message: 'Неверный пароль' });
        }

        res.json({ success: true, message: 'Вход выполнен успешно', role: user.role, phone: user.phone });
    } catch (error) {
        console.error('Error logging in user:', error); // Отладочное сообщение
        res.status(500).json({ success: false, message: 'Ошибка при входе пользователя' });
    }
});

// Маршрут для получения данных пользователя
app.get('/user', async (req, res) => {
    const { username } = req.query;

    try {
        const [rows] = await pool.query('SELECT username, role FROM users WHERE username = ?', [username]);
        if (rows.length === 0) {
            return res.status(404).json({ success: false, message: 'Пользователь не найден' });
        }
        res.json({ success: true, user: rows[0] });
    } catch (error) {
        console.error('Error fetching user data:', error);
        res.status(500).json({ success: false, message: 'Ошибка при получении данных пользователя' });
    }
});

// Пример защищенного маршрута для администраторов
app.get('/admin', checkRole('admin'), (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'admin.html'));
});

// Маршрут для страницы "Контакты"
app.get('/contact', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'contact.html'));
});

// Настройка Telegram ботов
const MAIN_BOT_TOKEN = '7476052318:AAHBzxdNM7HAZedWqEXoWMGFtyAXrWsvIe4'; // Замените YOUR_MAIN_TELEGRAM_BOT_TOKEN на ваш токен основного Telegram бота
const MAIN_CHAT_ID = '-1002232085244'; // Замените YOUR_MAIN_TELEGRAM_CHAT_ID на ваш chat ID основного Telegram бота

const REPORT_BOT_TOKEN = '7095725941:AAFckQHJMazdYmZVE6EN0lhrhrqEmrp-ASI'; // Замените YOUR_REPORT_TELEGRAM_BOT_TOKEN на ваш токен для отчетов Telegram бота
const REPORT_CHAT_ID = '-1002226028284'; // Замените YOUR_REPORT_TELEGRAM_CHAT_ID на ваш chat ID для отчетов Telegram бота
	
const mainBot = new TelegramBot(MAIN_BOT_TOKEN, { polling: true });
const reportBot = new TelegramBot(REPORT_BOT_TOKEN, { polling: true });

// Маршрут для получения бронирований
app.get('/api/bookings', async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT * FROM bookings WHERE house_id = ?', [req.query.cottageId]);
        res.json(rows);
    } catch (error) {
        res.status(500).json({ error: 'Database error' });
    }
});

// Маршрут для создания нового бронирования
app.post('/api/bookings', async (req, res) => {
    const { cottageId, name, phone, payment, date } = req.body;
    try {
        const [result] = await pool.query(
            'INSERT INTO bookings (house_id, name, phone, payment, date) VALUES (?, ?, ?, ?, ?)',
            [cottageId, name, phone, payment, date]
        );
        const booking = result.insertId;

        // Отправка сообщения в Telegram основному боту
        const message = `Новое бронирование:
Домик ID: ${cottageId}
ФИО: ${name}
Телефон: ${phone}
Дата: ${date}
Способ оплаты: ${payment}`;
        mainBot.sendMessage(MAIN_CHAT_ID, message);

        res.status(201).json({ success: true, booking });
    } catch (error) {
        res.status(500).json({ error: 'Database error' });
    }
});

// Маршрут для отправки отчетов администратора
app.post('/api/admin-report', async (req, res) => {
    const {
        reportDate, reservationName, place, adults, children, prepayment, paymentMethod,
        contact, deposit, idCard, bookingDate, staffName, arrivalDate, paymentOnArrival,
        additionalServices, additionalServicesPayment, totalBill, bigSpoon, bigCeramicPlate,
        teaSpoon, bigBlackPlate, fork, plasticPlate, breadBasket, plasticCup, dessertPlate, skewer
    } = req.body;
    try {
        console.log('Received admin report data:', req.body); // Отладочное сообщение

        const [result] = await pool.query(
            `INSERT INTO admin_reports (
                report_date, reservation_name, place, adults, children, prepayment, payment_method, 
                contact, deposit, id_card, booking_date, staff_name, arrival_date, payment_on_arrival, 
                additional_services, additional_services_payment, total_bill, big_spoon, big_ceramic_plate, 
                tea_spoon, big_black_plate, fork, plastic_plate, bread_basket, plastic_cup, dessert_plate, 
                skewer) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`, 
            [
                reportDate, reservationName, place, adults, children, prepayment, paymentMethod, 
                contact, deposit, idCard, bookingDate, staffName, arrivalDate, paymentOnArrival, 
                additionalServices, additionalServicesPayment, totalBill, bigSpoon, bigCeramicPlate, 
                teaSpoon, bigBlackPlate, fork, plasticPlate, breadBasket, plasticCup, dessertPlate, skewer
            ]
        );
        const report = result.insertId;

        // Отправка сообщения в Telegram основному боту
        const message = `Новый отчет:
Дата заполнения: ${reportDate}
Бронь на имя: ${reservationName}
Место: ${place}
Кол-во взрослые: ${adults}
Кол-во дети: ${children}
Предоплата (сумма): ${prepayment}
Наличные или kaspi QR: ${paymentMethod}
Контакты: ${contact}
Залог: ${deposit}
Удостоверение личности: ${idCard}
Дата бронирования: ${bookingDate}
ФИО персонала кто заполнил бланк: ${staffName}
Дата и время заезда: ${arrivalDate}
Оплата по факту (сумма): ${paymentOnArrival}
Доп услуги: ${additionalServices}
Оплата за доп услуги: ${additionalServicesPayment}
Итоговый счет на момент съезда: ${totalBill}
Посуда:
  - Ложка большая: ${bigSpoon}
  - Кер.тар большая: ${bigCeramicPlate}
  - Чайная ложка: ${teaSpoon}
  - Тар больш. черная: ${bigBlackPlate}
  - Вилки: ${fork}
  - Пластик. тарелка: ${plasticPlate}
  - Корзина для хлеба: ${breadBasket}
  - Пластик стакан: ${plasticCup}
  - Десертная тарелка: ${dessertPlate}
  - Шампур: ${skewer}`;

        mainBot.sendMessage(MAIN_CHAT_ID, message);
        reportBot.sendMessage(REPORT_CHAT_ID, message);

        res.status(201).json({ success: true, report });
    } catch (error) {
        console.error('Error inserting admin report:', error); // Отладочное сообщение
        res.status(500).json({ error: 'Database error' });
    }
});

app.listen(port, () => {
    console.log(`Сервер запущен на http://localhost:${port}`);
});
