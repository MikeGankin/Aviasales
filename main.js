///Элементы DOM

const formSearch = document.querySelector('.form-search');
const inputCitiesFrom = document.querySelector('.input__cities-from');
const inputCitiesTo = document.querySelector('.input__cities-to');
const dropdownCitiesFrom = document.querySelector('.dropdown__cities-from');
const dropdownCitiesTo  = document.querySelector('.dropdown__cities-to');
const inputDateDepart = document.querySelector('.input__date-depart');

///Данные 

const CITY_API = 'http://api.travelpayouts.com/data/ru/cities.json';
const PROXY = 'https://cors-anywhere.herokuapp.com/';
const API_KEY = '715e2d35e62ae0d7e697ef5121740132';
const CALENDAR = 'http://min-prices.aviasales.ru/calendar_preload';

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
                return fixItem.includes(input.value.toLowerCase());
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

const renderChipDay = (cheapTicket) => {
    console.log(cheapTicket);
};

const renderChipYear = (cheapTickets) => {
    console.log(cheapTickets);
};

const renderChip = (data, date) => {
    const cheapTicketYear = JSON.parse(data).best_prices;
    
    const cheapTicketDay = chipTicketYear.filter((item) => {
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
       from: from.code,
       to: to.code,
       when: inputDateDepart.value
   };

   const requestData = '?depart_date=' + formData.when + '&origin=' + formData.from +
                       '&destination=' + formData.to + '&one_way=true';

   getData(CALENDAR + requestData, (response) => {
       renderChip(response, formData.when);
   });              
});

/// Вызовы функций  

getData(PROXY + CITY_API, (data) => {
    city = JSON.parse(data).filter((item) => item.name);
});
