///Элементы DOM

const formSearch = document.querySelector('.form-search');
const inputCitiesFrom = document.querySelector('.input__cities-from');
const inputCitiesTo = document.querySelector('.input__cities-to');
const dropdownCitiesFrom = document.querySelector('.dropdown__cities-from');
const dropdownCitiesTo  = document.querySelector('.dropdown__cities-to');
const inputDateDepart = document.querySelector('.input__date-depart');
const cheapestTicket = document.getElementById('cheapest-ticket');
const otherCheapTickets = document.getElementById('other-cheap-tickets');

///Данные 

const CITY_API = 'http://api.travelpayouts.com/data/ru/cities.json';
const PROXY = 'https://cors-anywhere.herokuapp.com/';
const API_KEY = '715e2d35e62ae0d7e697ef5121740132';
const CALENDAR = 'http://min-prices.aviasales.ru/calendar_preload';
const MAX_COUNT = 5;

let city = [];

///Функции             

const getData = (url, callback) => {
    const request = new XMLHttpRequest();
   
    request.open('GET', url);

    request.addEventListener('readystatechange', () => {
        if (request.readyState !== 4) return;
        if (request.status === 200) {
            callback(request.response);
        } else {
            console.error(request.status);
        }
    });

    request.send();
};

const showCity = (input, list) => {
   list.textContent = '';

    if (input.value !== '') {
        const filterCity = city.filter((item) => {
            if (item.name) {
                const fixItem = item.name.toLowerCase();
                return fixItem.startsWith(input.value.toLowerCase());
            }
        });
    
        filterCity.forEach((item) => {
            const li = document.createElement('li');
            li.classList.add('dropdown__city');
            li.textContent = item.name;
            list.append(li);
        }); 
    }
};

const selectCity = (evt, input, list) => {
    const target = evt.target;
    if (target.tagName.toLowerCase() === 'li') {
        input.value = target.textContent;
        list.textContent = '';
    }
};

const getNameCity = (code) => {
    const objCity = city.find((item) => item.code === code);
    return objCity.name;
};

const getDate = (date) => {
    return new Date(date).toLocaleString('ru', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
};

const getChanges = (num) => {
    if (num) {
        return num === 1 ? 'С одной пересадкой' : 'С двумя пересадками';
    } else {
        return 'Без пересадок'
    }
};

const getLinkAviasales = (data) => {
    let link = 'https://www.aviasales.ru/search/';
    link += data.origin;
    const date = new Date(data.depart_date);
    const day = date.getDate();
    link += day < 10 ? '0' + day : day;
    const month = date.getMonth() + 1;
    link += month < 10 ? '0' + month : month;
    link += data.destination;
    link += '1';
    return link;
};

const createCard = (data) => {
    const ticket = document.createElement('article');
    ticket.classList.add('ticket');

    let deep = '';

    if (data) {
        deep = `
            <h3 class="agent">${data.gate}</h3>
            <div class="ticket__wrapper">
                <div class="left-side">
                    <a href="${getLinkAviasales(data)}" target="blank" class="button button__buy">Купить
                        за ${data.value}₽</a>
                </div>
                <div class="right-side">
                    <div class="block-left">
                        <div class="city__from">Вылет из города
                            <span class="city__name">${getNameCity(data.origin)}</span>
                        </div>
                        <div class="date">${getDate(data.depart_date)}</div>
                    </div>
            
                    <div class="block-right">
                        <div class="changes">Без пересадок</div>
                        <div class="city__to">Город назначения:
                            <span class="city__name">${getNameCity(data.destination)}</span>
                        </div>
                    </div>
                </div>
            </div>
        `;
    } else {
        deep = '<h3>Билетов нет!</h3>'
    }

    ticket.insertAdjacentHTML('afterbegin', deep);

    return ticket;
};

const renderChipDay = (cheapTicket) => {
    cheapestTicket.style.display = 'block';
    cheapestTicket.innerHTML = '<h2>Самый дешевый билет на выбранную дату</h2>';
    const ticket = createCard(cheapTicket[0]);
    cheapestTicket.append(ticket);
};

const renderChipYear = (cheapTickets) => {
    otherCheapTickets.style.display = 'block';
    otherCheapTickets.innerHTML = '<h2>Самые дешевые билеты на другие даты</h2>';
    cheapTickets.sort((a, b) => a.value - b.value);
    for (let i = 0; i < cheapTickets.length && i < MAX_COUNT; i++) {
        const ticket = createCard(cheapTickets[i]);
        otherCheapTickets.append(ticket);
    }
};

const renderChip = (data, date) => {
    const cheapTicketYear = JSON.parse(data).best_prices;
    
    const cheapTicketDay = cheapTicketYear.filter((item) => {
        return item.depart_date === date;
    });

    renderChipDay(cheapTicketDay);
    renderChipYear(cheapTicketYear);
};

///События

inputCitiesFrom.addEventListener('input', () => {
    showCity(inputCitiesFrom, dropdownCitiesFrom);
}); 

inputCitiesTo.addEventListener('input', () => {
    showCity(inputCitiesTo, dropdownCitiesTo);
}); 

dropdownCitiesFrom.addEventListener('click', (evt) => {
    selectCity(evt, inputCitiesFrom, dropdownCitiesFrom);
});

dropdownCitiesTo.addEventListener('click', (evt) => {
    selectCity(evt, inputCitiesTo, dropdownCitiesTo);
});

formSearch.addEventListener('submit', (evt) => {
   evt.preventDefault();

   const from = city.find((item) => inputCitiesFrom.value === item.name);
   const to = city.find((item) => inputCitiesTo.value === item.name);

   const formData = {
       from: from,
       to: to,
       when: inputDateDepart.value
   };

   if (formData.from && formData.to) {
        const requestData = '?depart_date=' + formData.when + '&origin=' + formData.from.code +
                            '&destination=' + formData.to.code + '&one_way=true';

        getData(CALENDAR + requestData, 
            (data) => {
                renderChip(data, formData.when);
        }, 
        (error) => {
            alert('В этом направлении нет рейсов');
            console.error('Ошибка', error);
        });  

   } else {
        alert('Введите корректное название города!');
   }            
});

/// Вызовы функций  

getData(PROXY + CITY_API, (data) => {
    city = JSON.parse(data).filter((item) => item.name);

    city.sort((a, b) => {
        if (a.name > b.name) {
          return 1;
        }
        if (a.name < b.name) {
          return -1;
        }
        return 0;
      });
});
