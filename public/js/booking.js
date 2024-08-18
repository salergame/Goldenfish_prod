document.addEventListener('DOMContentLoaded', function() {
    const modal = document.getElementById("booking-modal");
    const span = document.getElementsByClassName("close")[0];
    const cottages = document.getElementsByClassName("cottage");
    const bookingForm = document.getElementById('booking-form');
    const cottageTitle = document.getElementById('cottage-title');
    let currentCottageId = null;

    Array.from(cottages).forEach(cottage => {
        cottage.addEventListener('click', function() {
            currentCottageId = this.getAttribute('data-id');
            cottageTitle.innerText = `Домик ${currentCottageId}`;
            modal.style.display = "block";
        });
    });

    span.onclick = function() {
        modal.style.display = "none";
    }

    window.onclick = function(event) {
        if (event.target == modal) {
            modal.style.display = "none";
        }
    }

    bookingForm.addEventListener('submit', function(event) {
        event.preventDefault();

        const name = document.getElementById('name').value;
        const phone = document.getElementById('phone').value;
        const payment = document.getElementById('payment').value;
        const startDate = document.getElementById('startDate').value;

        const bookingData = {
            cottageId: currentCottageId,
            name: name,
            phone: phone,
            payment: payment,
            date: startDate
        };

        fetch('/api/bookings', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(bookingData)
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                alert('Бронирование успешно!');
                modal.style.display = "none";
            } else {
                alert('Ошибка бронирования: ' + data.message);
            }
        })
        .catch(error => {
            console.error('Ошибка:', error);
            alert('Ошибка бронирования, попробуйте еще раз.');
        });
    });
});
