document.addEventListener('DOMContentLoaded', function() {
    const adminForm = document.getElementById('admin-form');

    adminForm.addEventListener('submit', function(event) {
        event.preventDefault();

        const reportData = {
            reportDate: document.getElementById('report-date').value,
            reservationName: document.getElementById('reservation-name').value,
            place: document.getElementById('place').value,
            adults: document.getElementById('adults').value,
            children: document.getElementById('children').value,
            prepayment: document.getElementById('prepayment').value,
            paymentMethod: document.getElementById('payment-method').value,
            contact: document.getElementById('contact').value,
            deposit: document.getElementById('deposit').value,
            idCard: document.getElementById('id-card').value,
            bookingDate: document.getElementById('booking-date').value,
            staffName: document.getElementById('staff-name').value,
            arrivalDate: document.getElementById('arrival-date').value,
            paymentOnArrival: document.getElementById('payment-on-arrival').value,
            additionalServices: document.getElementById('additional-services').value,
            additionalServicesPayment: document.getElementById('additional-services-payment').value,
            totalBill: document.getElementById('total-bill').value,
            bigSpoon: document.getElementById('big-spoon').value,
            bigCeramicPlate: document.getElementById('big-ceramic-plate').value,
            teaSpoon: document.getElementById('tea-spoon').value,
            bigBlackPlate: document.getElementById('big-black-plate').value,
            fork: document.getElementById('fork').value,
            plasticPlate: document.getElementById('plastic-plate').value,
            breadBasket: document.getElementById('bread-basket').value,
            plasticCup: document.getElementById('plastic-cup').value,
            dessertPlate: document.getElementById('dessert-plate').value,
            skewer: document.getElementById('skewer').value
        };

        fetch('/api/admin-report', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(reportData)
        })
        .then(response => response.json())
        .then(data => {ы
            if (data.success) {
                alert('Отчет успешно отправлен!');
            } else {
                alert('Ошибка отправки отчета: ' + data.message);
            }
        })
        .catch(error => {
            console.error('Ошибка:', error);
            alert('Ошибка отправки отчета, попробуйте еще раз.');
        });
    });
});

