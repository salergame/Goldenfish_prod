// main.js

document.addEventListener('DOMContentLoaded', function() {
    console.log('Скрипт главной страницы загружен.');
    // Дополнительные функции для главной страницы можно добавить здесь
});

// main.js

document.addEventListener('DOMContentLoaded', function() {
    console.log('Скрипт главной страницы загружен.');
    const registerForm = document.getElementById('registerForm');
    
    if (registerForm) {
        registerForm.addEventListener('submit', function(event) {
            event.preventDefault();
            
            const username = document.getElementById('username').value;
            const phone = document.getElementById('phone').value;
            const password = document.getElementById('password').value;
            
            const userData = {
                username: username,
                phone: phone,
                password: password
            };
            
            console.log('Регистрация пользователя:', userData);
            
            // Отправка данных на сервер (пример с fetch)
            fetch('/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(userData)
            })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    alert('Регистрация прошла успешно!');
                    window.location.href = 'login.html';
                } else {
                    alert('Ошибка регистрации: ' + data.message);
                }
            })
            .catch(error => {
                console.error('Ошибка:', error);
                alert('Ошибка регистрации, попробуйте еще раз.');
            });
        });
    }
});

// main.js

document.addEventListener('DOMContentLoaded', function() {
    console.log('Скрипт загружен.');

    const registerForm = document.getElementById('registerForm');
    const loginForm = document.getElementById('loginForm');
    
    if (registerForm) {
        registerForm.addEventListener('submit', function(event) {
            event.preventDefault();
            
            const username = document.getElementById('username').value;
            const phone = document.getElementById('phone').value;
            const password = document.getElementById('password').value;
            
            const userData = {
                username: username,
                phone: phone,
                password: password
            };
            
            console.log('Sending registration data:', userData); // Отладочное сообщение
            
            fetch('/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(userData)
            })
            .then(response => response.json())
            .then(data => {
                console.log('Received response:', data); // Отладочное сообщение
                if (data.success) {
                    alert('Регистрация прошла успешно!');
                    window.location.href = 'login.html';
                } else {
                    alert('Ошибка регистрации: ' + data.message);
                }
            })
            .catch(error => {
                console.error('Ошибка:', error);
                alert('Ошибка регистрации, попробуйте еще раз.');
            });
        });
    }

    if (loginForm) {
        loginForm.addEventListener('submit', function(event) {
            event.preventDefault();
            
            const username = document.getElementById('username').value;
            const password = document.getElementById('password').value;
            
            const loginData = {
                username: username,
                password: password
            };
            
            console.log('Sending login data:', loginData); // Отладочное сообщение
            
            fetch('/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(loginData)
            })
            .then(response => response.json())
            .then(data => {
                console.log('Received response:', data); // Отладочное сообщение
                if (data.success) {
                    alert('Вход выполнен успешно!');
                    window.location.href = 'index.html';
                } else {
                    alert('Ошибка входа: ' + data.message);
                }
            })
            .catch(error => {
                console.error('Ошибка:', error);
                alert('Ошибка входа, попробуйте еще раз.');
            });
        });
    }
});
